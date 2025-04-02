import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';
import LoadingSpinner from '../loading/LoadingSpinner';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Limpiar errores previos

    try {
      const response = await fetch(process.env.REACT_APP_LOGIN_CLIENTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Credenciales incorrectas');

      const data = await response.json();
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('userEmail', email);
      onLogin();
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-image">
        <ResponsiveLazyImage imagePath={Logo} altText="Imagen de inicio de sesión" size="medium" />
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1>Iniciar sesión</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading} // Deshabilitar campo durante carga
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading} // Deshabilitar campo durante carga
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="forgot-password">
            <a href="/sendcode">Recuperar Contraseña</a>
          </div>

          {/* Botón con spinner superpuesto */}
          <div className="submit-button-container">
            <button
              type="submit"
              className="login-button"
              disabled={isLoading} // Deshabilitar botón durante carga
            >
              {isLoading ? (
                <div className="spinner-inside-button">
                  <LoadingSpinner /> {/* Spinner pequeño */}
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
        </form>

        <div className="additional-links">
          <a href="/signup">Registrarse</a>
          <a href="/ContactUs">Contáctanos</a>
        </div>
      </div>
    </div>
  );
};

export default Login;