import React from 'react';
import './ParticipantModal.css';

const ParticipantModal = ({ participant, onClose }) => {
  if (!participant) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>{participant.tipo === 'abogado' ? 'Abogado/a' : 'Cliente'} {participant.nombre}</h2>
        <div className="participant-details">
          <p><strong>Cédula:</strong> {participant.cedula}</p>
          <p><strong>Email:</strong> {participant.email}</p>
          <p><strong>Teléfono:</strong> {participant.telefono || 'No disponible'}</p>
          <p><strong>Dirección:</strong> {participant.direccion || 'No disponible'}</p>
          
          {participant.tipo === 'abogado' && (
            <>
              <p><strong>Especialidad:</strong> {participant.especialidad || 'No especificada'}</p>
              <p><strong>Años de experiencia:</strong> {participant.experiencia || 'No especificada'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;