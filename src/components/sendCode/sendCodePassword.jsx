import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../logInView/Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';
import LoadingSpinner from '../loading/LoadingSpinner'; // Importar el spinner

const SendCodePassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Activar loading al iniciar
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_ENVIAR_CODIGO_RECUPERACION}/${email}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar el código de recuperación');
      }

      const data = await response.json();
      setSuccessMessage('Código de recuperación enviado correctamente.');
      
      setTimeout(() => {
        navigate('/forgotPassword', { state: { email } });
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false); // Desactivar loading al finalizar
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-image">
        <ResponsiveLazyImage
          imagePath={Logo}
          altText="Imagen de inicio de sesión"
          size="medium"
        />
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1>Se enviará un código de recuperación al correo:</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
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

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {/* Botón con spinner integrado */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading} // Deshabilitar durante carga
          >
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : (
              'Enviar código'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendCodePassword;