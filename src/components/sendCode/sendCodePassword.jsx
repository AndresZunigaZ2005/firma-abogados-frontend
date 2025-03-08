import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import '../logInView/Login.css';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import Logo from '../assets/images/logo.png';

const SendCodePassword = () => {
  const [email, setEmail] = useState(''); // Estado para el email
  const [error, setError] = useState(''); // Estado para manejar errores
  const [successMessage, setSuccessMessage] = useState(''); // Estado para mensajes de éxito
  const navigate = useNavigate(); // Hook para redirigir

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Realiza la solicitud al backend para enviar el código de recuperación
      const response = await fetch(
        `${process.env.REACT_APP_ENVIAR_CODIGO_RECUPERACION}/${email}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar el código de recuperación');
      }

      const data = await response.json();
      setSuccessMessage('Código de recuperación enviado correctamente.'); // Mensaje de éxito
      setError(''); // Limpiar errores

      // Redirigir al usuario a ForgotPassword después de 2 segundos
      setTimeout(() => {
        navigate('/forgotPassword', { state: { email } }); // Pasar el email como estado
      }, 2000);
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
          <h1>Se enviará un código de recuperación al correo:</h1>
        </div>

        {/* Formulario de inicio de sesión */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Campo de correo electrónico */}
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
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

          {/* Mostrar mensaje de error si existe */}
          {error && <div className="error-message">{error}</div>}

          {/* Mostrar mensaje de éxito si existe */}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Botón de inicio de sesión */}
          <button type="submit" className="login-button">
            Enviar código
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendCodePassword;