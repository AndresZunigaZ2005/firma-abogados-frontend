import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ParticipantModal from '../../participantModals/ParticipantModal';
import DocumentsList from '../../documentList/DocumentsList';
import LoadingSpinner from '../../loading/LoadingSpinner';
import Comentarios from '../../comentarios/Comentarios';
import './ViewCaseInformation.css';

const ViewCaseInformation = () => {
  const { state } = useLocation();
  const [caso, setCaso] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clientesInfo, setClientesInfo] = useState([]);
  const [abogadosInfo, setAbogadosInfo] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('informacion');
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar la información de los participantes
  const cargarInformacionParticipantes = async (clientesIds = [], abogadosIds = []) => {
    setLoadingParticipants(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación');

      // Usar Promise.allSettled para manejar errores individuales
      const [clientesData, abogadosData] = await Promise.all([
        Promise.allSettled(
          clientesIds.map(async (cedula) => {
            const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
              headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (!response.ok) throw new Error('Error al buscar cliente');
            const data = await response.json();
            return { cedula, nombre: data.respuesta?.nombre || 'Nombre no disponible' };
          })
        ),
        Promise.allSettled(
          abogadosIds.map(async (cedula) => {
            const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
              headers: { 'Authorization': `Bearer ${jwt}` }
            });
            if (!response.ok) throw new Error('Error al buscar abogado');
            const data = await response.json();
            return { cedula, nombre: data.respuesta?.nombre || 'Nombre no disponible' };
          })
        )
      ]);

      // Filtrar resultados exitosos
      setClientesInfo(clientesData
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
      );
      
      setAbogadosInfo(abogadosData
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Función para manejar el clic en un participante
  const handleParticipantClick = (participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  // Cargar datos del caso al montar el componente
  useEffect(() => {
    const loadCaseData = async () => {
      try {
        setLoadingParticipants(true);
        
        // Priorizar el estado de navegación
        let casoData = state?.caso;
        
        // Si no viene por estado, intentar con localStorage
        if (!casoData) {
          const casoGuardado = localStorage.getItem('casoSeleccionado');
          if (casoGuardado) {
            casoData = JSON.parse(casoGuardado);
          }
        }
  
        if (casoData) {
          // Asegurar que los arrays existan
          casoData = {
            ...casoData,
            abogados: Array.isArray(casoData.abogados) ? casoData.abogados : [],
            clients: Array.isArray(casoData.clients) ? casoData.clients : [],
            documentos: Array.isArray(casoData.documentos) ? casoData.documentos : [],
            comentarios: Array.isArray(casoData.comentarios) ? casoData.comentarios : []
          };
          
          setCaso(casoData);
          await cargarInformacionParticipantes(casoData.clients, casoData.abogados);
        } else {
          throw new Error('No se encontró información del caso');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingParticipants(false);
      }
    };
  
    loadCaseData();
  
    return () => {
      // Limpiar solo si no estamos navegando hacia atrás
      if (!state?.from) {
        localStorage.removeItem('casoSeleccionado');
      }
    };
  }, [state]);

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
      {isLoading && <LoadingSpinner />}

      <div className="case-tabs">
        <button 
          className={`tab-button ${activeTab === 'informacion' ? 'active' : ''}`}
          onClick={() => setActiveTab('informacion')}
        >
          Información del Caso
        </button>
        <button 
          className={`tab-button ${activeTab === 'comentarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('comentarios')}
        >
          Comentarios ({caso.comentarios?.length || 0})
        </button>
        <button 
          className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('documentos')}
        >
          Documentos ({caso.documentos?.length || 0})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tab-content">
        {activeTab === 'informacion' && (
          <>
            <div className="case-header">
              <h1>{caso.nombreCaso}</h1>
              <div className={`case-status ${caso.estadoCaso}`}>
                Estado: {caso.estadoCaso}
              </div>
            </div>
            
            <div className="case-description">
              <h2>Descripción</h2>
              <p>{caso.descripcionCaso || 'No hay descripción disponible'}</p>
            </div>
              
            <div className="participants-section">
              <h2>Participantes</h2>
              
              <h3>Abogados:</h3>
              <div className="participants-list">
                {abogadosInfo.length > 0 ? (
                  abogadosInfo.map((abogado, index) => (
                    <div 
                      key={`abogado-${index}`} 
                      className="participant-tag"
                      onClick={() => handleParticipantClick(abogado)}
                    >
                      {abogado.nombre} ({abogado.cedula})
                    </div>
                  ))
                ) : (
                  <span className="no-participants">No hay abogados asignados</span>
                )}
              </div>
              
              <h3>Clientes:</h3>
              <div className="participants-list">
                {clientesInfo.length > 0 ? (
                  clientesInfo.map((cliente, index) => (
                    <div 
                      key={`cliente-${index}`} 
                      className="participant-tag"
                      onClick={() => handleParticipantClick(cliente)}
                    >
                      {cliente.nombre} ({cliente.cedula})
                    </div>
                  ))
                ) : (
                  <span className="no-participants">No hay clientes asignados</span>
                )}
              </div>
            </div>
          </>
        )}
        {activeTab === 'comentarios' && (
          <Comentarios caso={caso} />
        )}

        {activeTab === 'documentos' && (
          <div className="documents-section">
            <DocumentsList documentosIds={caso.documentos} />
          </div>
        )}
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