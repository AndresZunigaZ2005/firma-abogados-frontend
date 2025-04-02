import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../logInView/Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';
import LoadingSpinner from '../loading/LoadingSpinner'; // Importar el spinner

const ForgotPassword = () => {
  const location = useLocation();
  const email = location.state?.email;

  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para el loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Activar el spinner
    setError('');
    setSuccessMessage('');

    if (newPassword !== repeatPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(process.env.REACT_APP_CAMBIAR_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoVerificacion: verificationCode,
          email,
          passwordNueva: newPassword,
          repetirContraseña: repeatPassword,
        }),
      });

      if (!response.ok) throw new Error('Error al cambiar la contraseña');

      const data = await response.json();
      setSuccessMessage('Contraseña cambiada correctamente.');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false); // Desactivar el spinner
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-image">
        <ResponsiveLazyImage imagePath={Logo} altText="Imagen de inicio de sesión" size="medium" />
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1>Recuperar contraseña</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="verificationCode">Código de verificación:</label>
            <input
              type="text"
              id="verificationCode"
              placeholder="Código de verificación"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isLoading} // Deshabilitar campo durante carga
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Nueva contraseña:</label>
            <input
              type="password"
              id="newPassword"
              placeholder="Nueva contraseña"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading} // Deshabilitar campo durante carga
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword2">Repetir contraseña:</label>
            <input
              type="password"
              id="newPassword2"
              placeholder="Repetir contraseña"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              disabled={isLoading} // Deshabilitar campo durante carga
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {/* Botón con spinner integrado */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading} // Deshabilitar botón durante carga
          >
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner /> {/* Spinner dentro del botón */}
              </div>
            ) : (
              'Cambiar contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;