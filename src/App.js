import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/topBar/TopBar';
import Login from './components/logInView/Login';
import SignupClientForm from './components/registerClientView/SignupClientForm';
import Home from './components/info/Home';
import About from './components/info/About';
import UpdateProfileClient from './components/updateProfile/UpdateProfileClient';
import ForgotPassword from './components/forgotPassword/ForgotPassword';
import SendCodePassword from './components/sendCode/sendCodePassword';
import CasesView from './components/casesView/casesView';
import Contact from './components/contact/Contact';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css'; // Importa el archivo CSS

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('jwt'); // Elimina el JWT del localStorage
    setIsAuthenticated(false); // Actualiza el estado de autenticación
  };

  return (
    <Router>
      <div className="App">
        {/* Pasa el estado de autenticación y la función de logout a TopBar */}
        <TopBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<About />} />
            <Route path="/contactUs" element={<Contact/>} />
            <Route path="/signup" element={<SignupClientForm />} />
            <Route
              path="/login"
              element={<Login onLogin={() => setIsAuthenticated(true)} />}
            />
            <Route
              path="/updateProfileClient"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <UpdateProfileClient />
                </ProtectedRoute>
              }
            />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/sendCode" element={<SendCodePassword />} />
            <Route
              path="/viewCases"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CasesView />
                </ProtectedRoute>
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