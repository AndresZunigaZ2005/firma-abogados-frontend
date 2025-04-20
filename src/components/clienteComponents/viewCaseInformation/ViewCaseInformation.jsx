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
  const [abogados, setAbogados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('informacion');
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar los participantes del caso
  const fetchParticipants = async (casoData) => {
    try {
      setLoadingParticipants(true);
      
      // Verificar y asegurar que abogados y clients sean arrays
      const abogadosList = Array.isArray(casoData.abogados) ? casoData.abogados : [];
      const clientsList = Array.isArray(casoData.clients) ? casoData.clients : [];

      // Obtener detalles de abogados
      const abogadosPromises = abogadosList.map(async (cedula) => {
        const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        if (!response.ok) throw new Error('Error al cargar abogado');
        return await response.json();
      });

      // Obtener detalles de clientes
      const clientesPromises = clientsList.map(async (cedula) => {
        const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        if (!response.ok) throw new Error('Error al cargar cliente');
        return await response.json();
      });

      const [abogadosData, clientesData] = await Promise.all([
        Promise.all(abogadosPromises),
        Promise.all(clientesPromises)
      ]);

      setAbogados(abogadosData.map(a => a?.respuesta || { nombre: 'Desconocido', cedula: 'N/A' }));
      setClientes(clientesData.map(c => c?.respuesta || { nombre: 'Desconocido', cedula: 'N/A' }));
      
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

  const handleAddComentario = async (comentario) => {
    setIsLoading(true);
    try {
      // Aquí iría la lógica para guardar en el backend si es necesario
      const response = await fetch(`${process.env.REACT_APP_AGREGAR_COMENTARIO}/${caso.codigo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(comentario)
      });

      if (!response.ok) throw new Error('Error al guardar comentario');

      const data = await response.json();
      
      setCaso(prev => ({
        ...prev,
        comentarios: [...(prev.comentarios || []), data.comentario]
      }));
    } catch (err) {
      setError(err.message);
      throw err; // Para que el componente Comentarios pueda manejarlo
    } finally {
      setIsLoading(false);
    }
  };

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
          await fetchParticipants(casoData);
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
            </div>
            
            <div className="case-description">
              <h2>Descripción</h2>
              <p>{caso.descripcionCaso || 'No hay descripción disponible'}</p>
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

        {activeTab === 'comentarios' && (
          <Comentarios 
            comentarios={caso.comentarios} 
            onAddComentario={handleAddComentario}
            isLoading={isLoading}
          />
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