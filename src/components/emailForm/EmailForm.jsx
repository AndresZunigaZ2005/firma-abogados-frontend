import React, { useState } from 'react';
import LoadingSpinner from '../loading/LoadingSpinner';
import './EmailForm.css';

const EmailForm = ({ idCaso }) => {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const enviarCorreo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!asunto.trim()) {
      setError('El asunto es requerido');
      setIsLoading(false);
      return;
    }

    if (!idCaso) {
      setError('No se pudo identificar el caso asociado');
      setIsLoading(false);
      return;
    }

    try {
      const correoData = {
        idCaso, // Usamos el idCaso pasado como prop
        asunto,
        cuerpo
      };

      const response = await fetch(process.env.REACT_APP_ENVIAR_CORREO_SOBRE_CASO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(correoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el correo');
      }

      setSuccess('Correo enviado exitosamente');
      // Limpiar formulario
      setAsunto('');
      setCuerpo('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="email-form-container">
      <div className="email-form-header">
        <h2>Enviar correo sobre el caso</h2>
        <p>Este correo se enviará a todos los participantes del caso</p>
      </div>
      
      <form onSubmit={enviarCorreo} className="email-form">
        <div className="form-group">
          <label>Asunto:</label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label>Cuerpo del mensaje:</label>
          <textarea
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            disabled={isLoading}
            rows={10}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          disabled={isLoading || !asunto.trim() || !cuerpo.trim()}
          className="submit-button"
        >
          {isLoading ? (
            <div className="button-loading">
              <LoadingSpinner small white />
              Enviando...
            </div>
          ) : (
            'Enviar Correo'
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;