import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Importar useLocation
import '../logInView/Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';

const ForgotPassword = () => {
  const location = useLocation(); // Obtener la ubicación actual
  const email = location.state?.email; // Obtener el email del estado

  const [verificationCode, setVerificationCode] = useState(''); // Estado para el código de verificación
  const [newPassword, setNewPassword] = useState(''); // Estado para la nueva contraseña
  const [repeatPassword, setRepeatPassword] = useState(''); // Estado para repetir la contraseña
  const [error, setError] = useState(''); // Estado para manejar errores
  const [successMessage, setSuccessMessage] = useState(''); // Estado para mensajes de éxito

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (newPassword !== repeatPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Realiza la solicitud al backend para cambiar la contraseña
      const response = await fetch(process.env.REACT_APP_CAMBIAR_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoVerificacion: verificationCode, // Código de verificación ingresado por el usuario
          email, // Email obtenido del estado
          passwordNueva: newPassword,
          repetirContraseña: repeatPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar la contraseña');
      }

      const data = await response.json();
      setSuccessMessage('Contraseña cambiada correctamente.'); // Mensaje de éxito
      setError(''); // Limpiar errores
    } catch (error) {
      setError(error.message); // Mostrar mensaje de error
      setSuccessMessage(''); // Limpiar mensaje de éxito
    }
  };

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
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Campo de código de verificación */}
          <div className="form-group">
            <label htmlFor="verificationCode">Código de verificación:</label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              placeholder="Código de verificación"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </div>

          {/* Campo de nueva contraseña */}
          <div className="form-group">
            <label htmlFor="newPassword">Nueva contraseña:</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Nueva contraseña"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* Campo de repetir contraseña */}
          <div className="form-group">
            <label htmlFor="newPassword2">Repetir contraseña:</label>
            <input
              type="password"
              id="newPassword2"
              name="newPassword2"
              placeholder="Repetir contraseña"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>

          {/* Mostrar mensaje de error si existe */}
          {error && <div className="error-message">{error}</div>}

          {/* Mostrar mensaje de éxito si existe */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

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