import React, { useState } from 'react';
import LoadingSpinner from '../loading/LoadingSpinner';
import './EmailForm.css';

const EmailForm = () => {
  const [destinatarios, setDestinatarios] = useState([]);
  const [nuevoDestinatario, setNuevoDestinatario] = useState('');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const agregarDestinatario = () => {
    if (!nuevoDestinatario.trim()) return;
    
    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoDestinatario)) {
      setError('Por favor ingrese un email válido');
      return;
    }
    
    if (destinatarios.includes(nuevoDestinatario)) {
      setError('Este email ya está en la lista de destinatarios');
      return;
    }
    
    setDestinatarios([...destinatarios, nuevoDestinatario]);
    setNuevoDestinatario('');
    setError('');
  };

  const eliminarDestinatario = (index) => {
    const nuevosDestinatarios = [...destinatarios];
    nuevosDestinatarios.splice(index, 1);
    setDestinatarios(nuevosDestinatarios);
  };

  const enviarCorreo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (destinatarios.length === 0) {
      setError('Debe agregar al menos un destinatario');
      setIsLoading(false);
      return;
    }

    if (!asunto.trim()) {
      setError('El asunto es requerido');
      setIsLoading(false);
      return;
    }

    try {
      const correoData = {
        destinatarios,
        asunto,
        cuerpo,
        // El remitente se manejará en el backend
      };

      // Endpoint de ejemplo: REACT_APP_ENVIAR_CORREO
      const response = await fetch(process.env.REACT_APP_ENVIAR_CORREO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(correoData)
      });

      if (!response.ok) {
        throw new Error('Error al enviar el correo');
      }

      setSuccess('Correo enviado exitosamente');
      // Limpiar formulario
      setDestinatarios([]);
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
        <h2>Mensaje nuevo</h2>
      </div>
      
      <form onSubmit={enviarCorreo} className="email-form">
        <div className="form-group">
          <label>Para:</label>
          <div className="destinatarios-input">
            <input
              type="email"
              value={nuevoDestinatario}
              onChange={(e) => setNuevoDestinatario(e.target.value)}
              placeholder="Ingrese email del destinatario"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={agregarDestinatario}
              className="add-button"
              disabled={isLoading || !nuevoDestinatario.trim()}
            >
              Añadir
            </button>
          </div>
          <div className="destinatarios-list">
            {destinatarios.map((email, index) => (
              <div key={index} className="email-tag">
                {email}
                <button
                  type="button"
                  onClick={() => eliminarDestinatario(index)}
                  className="remove-button"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

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
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? (
            <div className="button-loading">
              <LoadingSpinner small white />
              Enviando...
            </div>
          ) : (
            'Enviar'
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;