import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/topBar/TopBar';
import Login from './components/logInView/Login';
import SignupClientForm from './components/clienteComponents/registerClientView/SignupClientForm';
import Home from './components/info/Home';
import About from './components/info/About';
import UpdateProfile from './components/updateProfile/UpdateProfile';
import ForgotPassword from './components/forgotPassword/ForgotPassword';
import SendCodePassword from './components/sendCode/sendCodePassword';
import CasesView from './components/clienteComponents/casesView/casesView';
import CreateCase from './components/abogadoComponents/createCase/CreateCase';
import Contact from './components/contact/Contact';


import CasesViewAbogado from './components/abogadoComponents/CasesViewAbogado/CasesViewAbogado';
import UpdateCase from './components/abogadoComponents/updateCase/UpdateCase'

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');

  // Función para verificar la autenticación y obtener el tipo de usuario
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${userEmail}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      const data = await response.json();
      setUserType(data.respuesta.tipoCuenta);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserType('');
  };

  // Componente para proteger rutas según tipo de usuario
  const UserProtectedRoute = ({ children, allowedTypes }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!allowedTypes.includes(userType)) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <div className="App">
        <TopBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            {/* Rutas públicas (accesibles para todos) */}
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<About />} />
            <Route path="/contactUs" element={<Contact />} />
            <Route path="/signup" element={<SignupClientForm />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/sendCode" element={<SendCodePassword />} />
            <Route
              path="/updateProfile"
              element={
                <UserProtectedRoute allowedTypes={['CLIENTE', 'ABOGADO', 'ADMIN']}>
                  <UpdateProfile />
                </UserProtectedRoute>
              }
            />
            
            {/* Ruta de login */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" />
                ) : (
                  <Login 
                    onLogin={() => setIsAuthenticated(true)} 
                    onUserTypeFetched={(type) => setUserType(type)}
                  />
                )
              }
            />

            {/* Rutas protegidas para CLIENTES */}
            <Route
              path="/viewCases"
              element={
                <UserProtectedRoute allowedTypes={['CLIENTE']}>
                  <CasesView />
                </UserProtectedRoute>
              }
            />
            {/* Rutas protegidas para ABOGADOS */}
            <Route
              path="/abogado/viewCases"
              element={
                <UserProtectedRoute allowedTypes={['ABOGADO']}>
                  <CasesViewAbogado />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/abogado/createCase"
              element={
                <UserProtectedRoute allowedTypes={['ABOGADO']}>
                  <CreateCase />
                </UserProtectedRoute>
              }
            />
            <Route
              path="/abogado/updateCase"
              element={
                <UserProtectedRoute allowedTypes={['ABOGADO']}>
                  <UpdateCase />
                </UserProtectedRoute>
              }
            />

            {/* Rutas protegidas para ADMIN */}
            <Route
              path="/addLawyer"
              element={
                <UserProtectedRoute allowedTypes={['ADMIN']}>
                  {/* Aquí iría el componente para añadir abogados */}
                  <div>Añadir abogado</div>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/generateStatistics"
              element={
                <UserProtectedRoute allowedTypes={['ADMIN']}>
                  {/* Aquí iría el componente de estadísticas */}
                  <div>Estadísticas</div>
                </UserProtectedRoute>
              }
            />
            <Route
              path="/generateReceipt"
              element={
                <UserProtectedRoute allowedTypes={['ADMIN']}>
                  {/* Aquí iría el componente para generar facturas */}
                  <div>Generar factura</div>
                </UserProtectedRoute>
              }
            />

            {/* Ruta de redirección para rutas no válidas */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;