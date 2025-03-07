import React from 'react';
import './Contact.css'; // Importa los estilos

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contacto</h1>
      <div className="contact-info">
        {/* Correo electrónico */}
        <div className="contact-item">
          <span className="contact-label">Correo electrónico:</span>
          <span className="contact-value">
            laleydelhielosa@gmail.com
          </span>
        </div>

        {/* Número de teléfono */}
        <div className="contact-item">
          <span className="contact-label">Teléfono:</span>
          <span className="contact-value">
            321 886 1990
          </span>
        </div>

        {/* Dirección */}
        <div className="contact-item">
          <span className="contact-label">Dirección:</span>
          <span className="contact-value">
            Calle 22 # 15-53, Armenia, Quindío
          </span>
        </div>
      </div>
    </div>
  );
};

export default Contact;