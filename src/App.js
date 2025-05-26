import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import all your components
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
import ViewCaseInformation from './components/clienteComponents/viewCaseInformation/ViewCaseInformation';
import CasesViewAbogado from './components/abogadoComponents/CasesViewAbogado/CasesViewAbogado';
import UpdateCase from './components/abogadoComponents/updateCase/UpdateCase';
import CrearAbogado from './components/adminComponents/crearAbogado/crearAbogado';
import CreateReceipt from './components/abogadoComponents/createReceipt/CreateReceipt';
import UpdateReceipt from './components/abogadoComponents/updateReceipt/UpdateReceipt';
import ReceiptClientView from './components/clienteComponents/receiptView/ReceiptClientView';
import LoadingSpinner from './components/loading/LoadingSpinner'; // Assuming you have a LoadingSpinner

import './App.css';

// Create a component that holds all your routing logic and state management
// This component will be rendered *inside* the <Router> in the actual App export.
function AppContent() {
  const location = useLocation(); // <--- NOW THIS IS IN THE CORRECT CONTEXT
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(true); // New state for initial auth check

  // Function to verify authentication and get user type
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData();
    } else {
      setIsAuthenticating(false); // No token, so not authenticating
    }
  }, []);

  const fetchUserData = async () => {
    setIsAuthenticating(true); // Set to true when fetching user data
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) { // Handle case where userEmail might be missing even if token exists
          throw new Error("No user email found in local storage.");
      }
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });

      if (!response.ok) {
        // Handle token expiration or invalid token by logging out
        localStorage.removeItem('jwt');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
        setUserType('');
        throw new Error('Error al obtener los datos del usuario. Sesión expirada o inválida.');
      }

      const data = await response.json();
      setUserType(data.respuesta.tipoCuenta);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Also handle error here if user data fetching fails, e.g., redirect to login
      setIsAuthenticated(false);
      setUserType('');
    } finally {
      setIsAuthenticating(false); // Authentication attempt finished
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserType('');
  };

  // Component to protect routes based on user type
  // This component is defined INSIDE AppContent, so it also has access to AppContent's state/props
  const UserProtectedRoute = ({ children, allowedTypes }) => {
    // This useLocation is fine as UserProtectedRoute is rendered by <Routes>
    const currentPathLocation = useLocation(); 

    // Show loading spinner while authenticating
    if (isAuthenticating) {
      return <LoadingSpinner fullPage />;
    }

    if (!isAuthenticated) {
      // Redirect to login, preserving the attempted path in state for redirection after login
      return <Navigate to="/login" state={{ from: currentPathLocation }} replace />;
    }
    
    if (!allowedTypes.includes(userType)) {
      // Redirect to home if user type is not allowed
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      <TopBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          {/* Public Routes (accesible para todos) */}
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/contactUs" element={<Contact />} />
          <Route path="/signup" element={<SignupClientForm />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/sendCode" element={<SendCodePassword />} /> 
          
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login 
                  onLogin={() => {
                    setIsAuthenticated(true);
                    fetchUserData(); // Fetch user data after successful login
                  }} 
                  onUserTypeFetched={(type) => setUserType(type)}
                />
              )
            }
          />

          {/* Protected Routes - These routes use the UserProtectedRoute component. */}

          {/* Protected Routes for all authenticated users */}
          <Route
            path="/updateProfile"
            element={
              <UserProtectedRoute allowedTypes={['CLIENTE', 'ABOGADO', 'ADMIN']}>
                <UpdateProfile />
              </UserProtectedRoute>
            }
          />

          {/* Protected Routes for CLIENTES */}
          <Route
            path="/viewCases"
            element={
              <UserProtectedRoute allowedTypes={['CLIENTE']}>
                <CasesView />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/viewCaseInformation"
            element={
              <UserProtectedRoute allowedTypes={['CLIENTE']}>
                <ViewCaseInformation initialCaso={location.state?.caso}/> 
              </UserProtectedRoute>
            }
          />
          <Route
            path="/viewReceiptCase"
            element={
              <UserProtectedRoute allowedTypes={['CLIENTE']}>
                <ReceiptClientView initialFactura={location.state?.factura}/> 
              </UserProtectedRoute>
            }
          />

          {/* Protected Routes for ABOGADOS */}
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
                {/* Access location.state.caso directly within the element */}
                <UpdateCase initialCaso={location.state?.caso} /> 
              </UserProtectedRoute>
            }
          />
          <Route
            path="/abogado/createReceipt"
            element={
              <UserProtectedRoute allowedTypes={['ABOGADO']}>
                {/* Access location.state.idCaso directly within the element */}
                <CreateReceipt idCaso={location.state?.idCaso} />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/abogado/updateReceipt"
            element={
              <UserProtectedRoute allowedTypes={['ABOGADO']}>
                {/* Access location.state.factura directly within the element */}
                <UpdateReceipt factura={location.state?.factura} />
              </UserProtectedRoute>
            }
          />

          {/* Protected Routes for ADMIN */}
          <Route
            path="/addLawyer"
            element={
              <UserProtectedRoute allowedTypes={['ADMIN']}>
                <CrearAbogado />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/generateStatistics"
            element={
              <UserProtectedRoute allowedTypes={['ADMIN']}>
                <div>Estadísticas</div>
              </UserProtectedRoute>
            }
          />
          <Route
            path="/generateReceipt"
            element={
              <UserProtectedRoute allowedTypes={['ADMIN']}>
                <div>Generar factura</div>
              </UserProtectedRoute>
            }
          />

          {/* Fallback route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

// The main App component only renders the Router and its content
function App() {
  return (
    <Router>
      <AppContent /> {/* Render the actual application content here */}
    </Router>
  );
}

export default App;