import React from 'react';
import '../logInView/Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';

const SendCode = () => {
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
            <h1>Se enviará un código de recuperación al correo:</h1>
          </div>
  
          {/* Formulario de inicio de sesión */}
        <form className="login-form">
          {/* Campo de correo electrónico */}
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              required
            />
          </div>
  
  
            {/* Botón de inicio de sesión */}
            <button type="submit" className="login-button">
              Enviar código
            </button>
          </form>

        </div>
      </div>
    );
  };
  
  export default SendCode;