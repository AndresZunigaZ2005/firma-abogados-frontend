import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ParticipantModal from './ParticipantModal';
import LoadingSpinner from '../../loading/LoadingSpinner';
import './ViewCaseInformation.css';

const ViewCaseInformation = () => {
  const { state } = useLocation();
  const caso = state?.caso;
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [abogados, setAbogados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        if (!jwt) throw new Error('No hay token de autenticación');

        // Buscar detalles de abogados
        const abogadosPromises = caso.idAbogados.map(async (id) => {
          const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${id}`, {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });
          if (!response.ok) throw new Error('Error al buscar abogado');
          const data = await response.json();
          return { ...data.respuesta, tipo: 'abogado' };
        });

        // Buscar detalles de clientes
        const clientesPromises = caso.idCliente.map(async (id) => {
          const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${id}`, {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });
          if (!response.ok) throw new Error('Error al buscar cliente');
          const data = await response.json();
          return { ...data.respuesta, tipo: 'cliente' };
        });

        const [abogadosData, clientesData] = await Promise.all([
          Promise.all(abogadosPromises),
          Promise.all(clientesPromises)
        ]);

        setAbogados(abogadosData);
        setClientes(clientesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingParticipants(false);
      }
    };

    if (caso) {
      fetchParticipants();
    }
  }, [caso]);

  const handleParticipantClick = (participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  if (!caso) {
    return <div className="error-message">No se encontró información del caso</div>;
  }

  if (loadingParticipants) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="view-case-container">
      <h1>Descripción</h1>
      <h2>Documentos solicitados</h2>
      
      <div className="case-header">
        <h3>{caso.nombreCaso}</h3>
      </div>
      
      <div className="case-description">
        <p>{caso.descripcionCaso}</p>
      </div>
      
      <div className="participants-section">
        <h4>Abogados:</h4>
        <div className="participants-list">
          {abogados.length > 0 ? (
            abogados.map((abogado, index) => (
              <span 
                key={`abogado-${index}`} 
                className="participant-name"
                onClick={() => handleParticipantClick(abogado)}
              >
                <strong>Abogado/a {abogado.nombre}</strong>
                {index < abogados.length - 1 ? ', ' : ''}
              </span>
            ))
          ) : (
            <span className="no-participants">No hay abogados asignados</span>
          )}
        </div>
        
        <h4>Clientes:</h4>
        <div className="participants-list">
          {clientes.length > 0 ? (
            clientes.map((cliente, index) => (
              <span 
                key={`cliente-${index}`} 
                className="participant-name"
                onClick={() => handleParticipantClick(cliente)}
              >
                <strong>{cliente.nombre}</strong>
                {index < clientes.length - 1 ? ', ' : ''}
              </span>
            ))
          ) : (
            <span className="no-participants">No hay clientes asignados</span>
          )}
        </div>
      </div>

      {showModal && (
        <ParticipantModal
          participant={selectedParticipant}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ViewCaseInformation;