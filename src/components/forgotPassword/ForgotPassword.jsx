import React from 'react';
import '../logInView/Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';

const ForgotPassword = () => {
    return (
      <div className="login-wrapper">
        {/* Contenedor de la imagen */}
        <div className="login-image">
          <ResponsiveLazyImage
            imagePath={Logo}
            altText="Imagen de inicio de sesión"
            size="medium" 
          />
        </div>
  
        {/* Contenedor del formulario */}
        <div className="login-container">
          {/* Encabezado */}
          <div className="login-header">
            <h1>Recuperar contraseña</h1>
          </div>
  
          {/* Formulario de inicio de sesión */}
          <form className="login-form">
            {/* Campo de correo electrónico */}
            <div className="form-group">
              <label htmlFor="codigo">Código:</label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                placeholder="Código"
                required
              />
            </div>
  
            {/* Campo de contraseña */}
            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Nueva contraseña"
                required
              />
            </div>

            {/* Campo de contraseña */}
            <div className="form-group">
              <label htmlFor="newPassword2">Nueva contraseña:</label>
              <input
                type="password"
                id="newPassword2"
                name="newPassword2"
                placeholder="Repetir contraseña"
                required
              />
            </div>
  
  
            {/* Botón de inicio de sesión */}
            <button type="submit" className="login-button">
              Cambiar contraseña
            </button>
          </form>

        </div>
      </div>
    );
  };
  
  export default ForgotPassword;