import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const jwt = localStorage.getItem('jwt');

  if (!jwt) {
    // Si no hay JWT, redirige al usuario al login
    return <Navigate to="/login" replace />;
  }

  // Si hay JWT, permite el acceso al componente hijo
  return children;
};

export default ProtectedRoute;