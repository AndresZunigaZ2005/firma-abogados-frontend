import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TopBar.css'; // Asegúrate de crear este archivo para los estilos
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import logo from '../assets/images/logo.png';

const TopBar = ({ isAuthenticated, onLogout }) => {
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Obtener el nombre del usuario al cargar el componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  // Función para obtener los datos del usuario desde el backend
  const fetchUserData = async () => {
    try {
      const response = await fetch('https://api.ejemplo.com/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      const data = await response.json();
      setUserName(data.nombre); // Asume que el backend devuelve un objeto con un campo "nombre"
    } catch (error) {
      console.error(error);
    }
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    onLogout(); // Llama a la función de cierre de sesión
    setShowDropdown(false); // Oculta el menú desplegable
  };

  // Función para manejar la navegación desde los botones del menú desplegable
  const handleNavigation = (path) => {
    navigate(path); // Navega a la ruta especificada
    setShowDropdown(false); // Oculta el menú desplegable
  };

  return (
    <div className="top-bar">
      {/* Logo y texto "La Ley del Hielo" */}
      <Link to="/" className="logo-container">
        <ResponsiveLazyImage
          imagePath={logo}
          altText="Logo de la aplicación"
          size="small"
        />
        <h1>La Ley del Hielo</h1>
      </Link>

      {/* Navegación y autenticación */}
      <div className="right-section">
        <nav className="navigation">
          <Link to="/aboutus">Sobre Nosotros</Link>
          <Link to="/contactUs">Contáctanos</Link>
        </nav>

        {isAuthenticated ? (
          // Si el usuario está autenticado, muestra el nombre y el menú desplegable
          <div className="user-menu">
            <div
              className="user-info"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{userName}</span>
              <ResponsiveLazyImage
                imagePath={logo}
                altText="Logo de la aplicación"
                size="small"
              />
              <span className="dropdown-arrow">▼</span> {/* Flecha hacia abajo */}
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => handleNavigation('/viewCases')}>
                  Ver casos
                </button>
                <button onClick={() => handleNavigation('/updateProfileClient')}>
                  Actualizar perfil
                </button>
                <button onClick={handleLogout}>Salir</button>
              </div>
            )}
          </div>
        ) : (
          // Si el usuario no está autenticado, muestra los enlaces de inicio de sesión y registro
          <div className="auth-links">
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/signup">Registrarse</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;