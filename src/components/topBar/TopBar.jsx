import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TopBar.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import logo from '../assets/images/logo.png';
import profile from '../assets/images/profile.png';

const TopBar = ({ isAuthenticated, onLogout }) => {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      const data = await response.json();
      const infoUser = data.respuesta;
      const firstName = infoUser.nombre.split(' ')[0];
      setUserName(firstName);
      setUserType(infoUser.tipoCuenta); // Establecer el tipo de cuenta del usuario
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userEmail');
    onLogout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const renderUserSpecificOptions = () => {
    switch (userType) {
      case 'CLIENTE':
        return (
          <>
            <button onClick={() => handleNavigation('/viewCases')}>
              Ver casos
            </button>
            <button onClick={() => handleNavigation('/realizar-pago')}>
              Realizar pago
            </button>
          </>
        );
      case 'ABOGADO':
        return (
          <>
            <button onClick={() => handleNavigation('/abogado/viewCases')}>
              Ver casos
            </button>
            <button onClick={() => handleNavigation('/abogado/createCase')}>
              Crear caso
            </button>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <button onClick={() => handleNavigation('/addLawyer')}>
              Añadir abogado
            </button>
            <button onClick={() => handleNavigation('/generateStatistics')}>
              Ver estadísticas
            </button>
            <button onClick={() => handleNavigation('/generateReceipt')}>
              Generar factura
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="top-bar">
      <Link to="/" className="logo-container">
        <ResponsiveLazyImage
          imagePath={logo}
          altText="Logo de la aplicación"
          size="small"
        />
        <h1>La Ley del Hielo</h1>
      </Link>

      <div className="hamburger-menu" onClick={() => setShowMobileMenu(!showMobileMenu)}>
        <div className="hamburger-icon">&#9776;</div>
      </div>

      <div className={`right-section ${showMobileMenu ? 'mobile-visible' : ''}`}>
        <nav className="navigation">
          <Link to="/aboutus" onClick={() => setShowMobileMenu(false)}>Sobre Nosotros</Link>
          <Link to="/contactUs" onClick={() => setShowMobileMenu(false)}>Contáctanos</Link>
        </nav>

        {isAuthenticated ? (
          <div className="user-menu">
            <div
              className="user-info"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{userName}</span>
              <ResponsiveLazyImage
                imagePath={profile}
                altText="Logo de la aplicación"
                size="small"
              />
              <span className="dropdown-arrow">▼</span>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                {renderUserSpecificOptions()}
                <button onClick={() => handleNavigation('/updateProfile')}>
                  Actualizar perfil
                </button>
                <button onClick={handleLogout}>Salir</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" onClick={() => setShowMobileMenu(false)}>Iniciar sesión</Link>
            <Link to="/signup" onClick={() => setShowMobileMenu(false)}>Registrarse</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;