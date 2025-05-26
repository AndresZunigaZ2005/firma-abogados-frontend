import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ParticipantModal from '../../participantModals/ParticipantModal';
import DocumentsList from '../../documentList/DocumentsList';
import Comentarios from '../../comentarios/Comentarios';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import './ViewCaseInformation.css';

const ViewCaseInformation = ({ initialCaso }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [caso, setCaso] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clientesInfo, setClientesInfo] = useState([]);
  const [abogadosInfo, setAbogadosInfo] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('informacion');
  const [isLoading, setIsLoading] = useState(false);

  const [hasFactura, setHasFactura] = useState(false);
  const [factura, setFactura] = useState(null);
  const [checkingFactura, setCheckingFactura] = useState(true);

  const cargarInformacionParticipantes = async (clientesIds = [], abogadosIds = []) => {
    setLoadingParticipants(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación');

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

  const checkFactura = async (idCaso) => {
    setCheckingFactura(true);
    setHasFactura(false); // Reset before check
    setFactura(null); // Reset before check

    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación.');

      const response = await fetch(`${process.env.REACT_APP_GET_FACTURA_POR_CASO}/${idCaso}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });

      if (response.ok) {
        const respuesta = await response.json();
        const factura = respuesta.respuesta;
        // Check if the response is a non-empty object
        if (factura && typeof factura === 'object' && Object.keys(factura).length > 0) {
          setFactura(factura);
          setHasFactura(true);
        } else {
          // If response is OK but empty/null, explicitly set no factura
          setHasFactura(false);
        }
      } else if (response.status === 404) {
        // Specifically handle 404 as "no factura found"
        setHasFactura(false);
      } else {
        // For other error statuses, attempt to read error message
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error checking factura:', errorData.message || response.statusText);
        setHasFactura(false); // Do not show button on other API errors
      }
    } catch (err) {
      console.error('Fetch Error checking factura:', err);
      setHasFactura(false);
    } finally {
      setCheckingFactura(false);
    }
  };

  const handleParticipantClick = (participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  const handleViewFacturaClick = () => {
    if (factura) {
      console.log(factura);
      navigate('/viewReceiptCase', { state: { factura: factura } });
    }
  };

  // Effect to load case data, prioritizing initialCaso prop
  useEffect(() => {
    const loadCaseData = async () => {
      setIsLoading(true);
      try {
        let casoData = initialCaso; // Prioritize initialCaso prop

        // Fallback to navigation state if initialCaso is not provided
        if (!casoData && state?.caso) {
          casoData = state.caso;
        }

        // Removed localStorage fallback here as requested

        if (casoData) {
          // Ensure arrays exist and handle potential 'clients' vs 'clientes' property
          casoData = {
            ...casoData,
            abogados: Array.isArray(casoData.abogados) ? casoData.abogados : [],
            // Use 'clientes' if it exists, otherwise try 'clients'. Default to empty array.
            clientes: Array.isArray(casoData.clientes)
              ? casoData.clientes
              : (Array.isArray(casoData.clients) ? casoData.clients : []),
            documentos: Array.isArray(casoData.documentos) ? casoData.documentos : [],
            comentarios: Array.isArray(casoData.comentarios) ? casoData.comentarios : []
          };

          setCaso(casoData);
          // Pass the corrected 'clientes' property to cargarInformacionParticipantes
          await cargarInformacionParticipantes(casoData.clientes, casoData.abogados);
          await checkFactura(casoData.codigo);
        } else {
          throw new Error('No se encontró información del caso. Por favor, intente de nuevo.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCaseData();

    // No localStorage cleanup needed here as it's no longer used as a primary source.
  }, [initialCaso, state]); // Add initialCaso to dependencies

  // Combined loading state
  if (isLoading || loadingParticipants || checkingFactura) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // If caso is still null after loading attempts and no error
  if (!caso) {
    return <p>Cargando información del caso o el caso no fue encontrado.</p>;
  }

  return (
    <div className="view-case-container">
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
        {/* Only show the button if hasFactura is true and checkingFactura is false */}
        {hasFactura && !checkingFactura && (
          <button
            className="tab-button"
            onClick={handleViewFacturaClick}
          >
            <FaFileInvoiceDollar /> Ver Factura
          </button>
        )}
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
          <Comentarios initialCaso={caso} />
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