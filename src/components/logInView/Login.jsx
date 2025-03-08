import React, { useState } from 'react';
import './Login.css'; // Archivo de estilos para el Login
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Realiza la solicitud al backend para autenticar al usuario
      const response = await fetch(process.env.REACT_APP_LOGIN_CLIENTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Cuerpo de la solicitud
      });

      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }

      const data = await response.json();

      // Almacena el JWT en localStorage
      localStorage.setItem('jwt', data.token);

      // Llama a la función onLogin para actualizar el estado de autenticación
      onLogin();
    } catch (error) {
      setError(error.message);
    }
  };

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
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Campo de correo electrónico */}
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Mostrar mensaje de error si existe */}
          {error && <div className="error-message">{error}</div>}

          {/* Enlace para recuperar contraseña */}
          <div className="forgot-password">
            <a href="/sendcode">Recuperar Contraseña</a>
          </div>

          {/* Botón de inicio de sesión */}
          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="additional-links">
          <a href="/signup">Registrarse</a>
          <a href="/ContactUs">Contáctanos</a>
        </div>
      </div>
    </div>
  );
};

export default Login;