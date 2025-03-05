import React from 'react';
import { Link } from 'react-router-dom'; // Importa Link
import './TopBar.css'; // Asegúrate de crear este archivo para los estilos
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import logo from '../assets/images/logo.png';

const TopBar = () => {
  return (
    <div className="top-bar">
      {/* Logo y texto "La Ley del Hielo" */}
      <Link to="/" className="logo-container"> {/* Envuelve en un Link */}
        <ResponsiveLazyImage
          imagePath={logo}
          altText="Logo de la aplicación" 
          size='small'
        />
        <h1>La Ley del Hielo</h1>
      </Link>

      {/* Navegación y autenticación */}
      <div className="right-section">
        <nav className="navigation">
          <a href="/aboutus">Sobre Nosotros</a>
          <a href="/contactanos">Contáctanos</a>
        </nav>
        <div className="auth-links">
          <a href="/login">Iniciar sesión</a>
          <a href="/signup">Registrarse</a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;