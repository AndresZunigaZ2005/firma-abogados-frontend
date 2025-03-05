import React from 'react';
import './Login.css'; // Archivo de estilos para el Login
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';

const Login = () => {
  return (
    <div className="login-wrapper">
      {/* Contenedor de la imagen */}
      <div className="login-image">
        <ResponsiveLazyImage
          imagePath={Logo}
          altText="Imagen de inicio de sesión"
          size="medium" // Ajusta el tamaño según sea necesario
        />
      </div>

      {/* Contenedor del formulario */}
      <div className="login-container">
        {/* Encabezado */}
        <div className="login-header">
          <h1>Iniciar sesión</h1>
        </div>

        {/* Formulario de inicio de sesión */}
        <form className="login-form">
          {/* Campo de correo electrónico */}
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              required
            />
          </div>

          {/* Campo de contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Contraseña"
              required
            />
          </div>

          {/* Enlace para recuperar contraseña */}
          <div className="forgot-password">
            <a href="/recuperar-contraseña">Recuperar Contraseña</a>
          </div>

          {/* Botón de inicio de sesión */}
          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="additional-links">
          <a href="/signup">Registrarse</a>
          <a href="/contactanos">Contáctanos</a>
        </div>
      </div>
    </div>
  );
};

export default Login;