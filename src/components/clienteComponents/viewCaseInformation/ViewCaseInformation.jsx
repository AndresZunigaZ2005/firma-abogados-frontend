import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ParticipantModal from '../../participantModals/ParticipantModal';
import DocumentsList from '../documentsList/DocumentsList'; // Importa el nuevo componente
import LoadingSpinner from '../../loading/LoadingSpinner';
import './ViewCaseInformation.css';

const ViewCaseInformation = () => {
  const { state } = useLocation();
  const [caso, setCaso] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [abogados, setAbogados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('informacion'); // Nuevo estado para pestañas

  useEffect(() => {
    const casoGuardado = localStorage.getItem('casoSeleccionado');
    let casoData = state?.caso;
    
    if (!casoData && casoGuardado) {
      casoData = JSON.parse(casoGuardado);
    }

    if (casoData) {
      setCaso(casoData);
      fetchParticipants(casoData);
    } else {
      setError('No se encontró información del caso');
      setLoadingParticipants(false);
    }

    return () => {
      localStorage.removeItem('casoSeleccionado');
    };
  }, [state?.caso]);

  // ... (fetchParticipants y handleParticipantClick permanecen igual)

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
      {/* Pestañas para alternar entre información y documentos */}
      <div className="case-tabs">
        <button 
          className={`tab-button ${activeTab === 'informacion' ? 'active' : ''}`}
          onClick={() => setActiveTab('informacion')}
        >
          Información del Caso
        </button>
        <button 
          className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('documentos')}
        >
          Documentos
        </button>
      </div>

      {activeTab === 'informacion' && (
        <>
          <div className="case-header">
            <h1>{caso.nombreCaso}</h1>
          </div>
          
          <div className="case-description">
            <h2>Descripción</h2>
            <p>{caso.descripcionCaso}</p>
          </div>
          
          <div className="participants-section">
            <h2>Participantes</h2>
            <h3>Abogados:</h3>
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
            
            <h3>Clientes:</h3>
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
        </>
      )}

      {activeTab === 'documentos' && (
        <div className="documents-section">
          <DocumentsList documentosIds={caso.documentos || []} />
        </div>
      )}

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