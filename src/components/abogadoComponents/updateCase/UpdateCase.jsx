import React, { useState, useEffect, useCallback } from 'react';
import { FaComment, FaInfoCircle, FaUserPlus, FaTrash, FaPaperclip, FaEnvelope, FaFileInvoiceDollar } from 'react-icons/fa';
import LoadingSpinner from '../../loading/LoadingSpinner';
import DocumentsList from '../../documentList/DocumentsList';
import Comentarios from '../../comentarios/Comentarios';
import EmailForm from '../../emailForm/EmailForm';
import { useNavigate } from 'react-router-dom';
import './UpdateCase.css';

// Accept 'initialCaso' as a prop
const UpdateCase = ({ initialCaso }) => {
  const [caso, setCaso] = useState({
    codigo: '',
    nombreCaso: '',
    descripcionCaso: '',
    estadoCaso: 'INACTIVO',
    clientes: [], // These will hold just the IDs (cédulas)
    abogados: [], // These will hold just the IDs (cédulas)
    documentos: [],
    comentarios: []
  });
  const [clientesInfo, setClientesInfo] = useState([]); // This will hold objects with { cedula, nombre }
  const [abogadosInfo, setAbogadosInfo] = useState([]); // This will hold objects with { cedula, nombre }
  const [activeTab, setActiveTab] = useState('datos');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nuevaCedulaCliente, setNuevaCedulaCliente] = useState('');
  const [nuevaCedulaAbogado, setNuevaCedulaAbogado] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const navigate = useNavigate();

  // Helper function to fetch participant details
  const fetchParticipantDetails = useCallback(async (cedula) => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación.');

      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${encodeURIComponent(cedula)}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });

      if (!response.ok) {
                // If not found (e.g., 404), return a placeholder instead of throwing
                if (response.status === 404) {
                  console.warn(`Participante con cédula ${cedula} no encontrado.`);
                  return { cedula, nombre: 'No encontrado' };
                }
                // Corrected: You were trying to access 'respuesta' on the 'response' object directly
                // before parsing the JSON. Also, the error handling should await the JSON.
                const errorData = await response.json(); // Await the JSON parsing
                throw new Error(errorData.message || `Error al buscar participante con cédula ${cedula}`);
              }
      const data = await response.json();
      return { cedula, nombre: data.respuesta?.nombre || 'Nombre no disponible' };
    } catch (err) {
      console.error(`Error fetching details for ${cedula}:`, err);
      // Return a placeholder for error cases as well to not block Promise.allSettled
      return { cedula, nombre: 'Error al cargar' };
    }
  }, []); // useCallback with empty dependency array as it doesn't depend on component state/props

  // Load caso from props and fetch associated participant details
  useEffect(() => {
    const loadCaseAndParticipants = async () => {
      try {
        setIsLoading(true);
        setError(''); // Clear previous errors

        if (!initialCaso || !initialCaso.codigo) {
          throw new Error('No se ha proporcionado un caso válido para actualizar.');
        }

        // Format the initialCaso prop for the component's state
        // Ensure that 'clientes' and 'abogados' directly hold the IDs (cédulas)
        const formattedCase = {
          codigo: initialCaso.codigo,
          nombreCaso: initialCaso.nombreCaso || '',
          descripcionCaso: initialCaso.descripcionCaso || '',
          estadoCaso: initialCaso.estadoCaso || 'INACTIVO',
          clientes: Array.isArray(initialCaso.clientes) ? initialCaso.clientes : [],
          abogados: Array.isArray(initialCaso.abogados) ? initialCaso.abogados : [],
          comentarios: Array.isArray(initialCaso.comentarios) ? initialCaso.comentarios : [],
          documentos: Array.isArray(initialCaso.documentos) ? initialCaso.documentos : []
        };

        setCaso(formattedCase);

        setLoadingParticipants(true);
        const jwt = localStorage.getItem('jwt');
        if (!jwt) throw new Error('No hay token de autenticación.');

        // Fetch details for clients and lawyers in parallel
        const [clientesDetails, abogadosDetails] = await Promise.all([
          Promise.allSettled(formattedCase.clientes.map(fetchParticipantDetails)),
          Promise.allSettled(formattedCase.abogados.map(fetchParticipantDetails))
        ]);

        // Filter out rejections and map to the value for clientsInfo
        setClientesInfo(
          clientesDetails
            .filter(result => result.status === 'fulfilled' &&
                             result.value.nombre !== 'No encontrado' &&
                             result.value.nombre !== 'Error al cargar') // Filter out placeholders for better UI
            .map(result => result.value)
        );

        // Filter out rejections and map to the value for abogadosInfo
        setAbogadosInfo(
          abogadosDetails
            .filter(result => result.status === 'fulfilled' &&
                             result.value.nombre !== 'No encontrado' &&
                             result.value.nombre !== 'Error al cargar') // Filter out placeholders for better UI
            .map(result => result.value)
        );

      } catch (err) {
        setError(err.message);
        console.error('Error al cargar el caso y sus participantes:', err);
      } finally {
        setIsLoading(false);
        setLoadingParticipants(false);
      }
    };

    loadCaseAndParticipants();
  }, [initialCaso, fetchParticipantDetails]); // Dependency array: re-run effect if initialCaso or fetchParticipantDetails changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaso(prev => ({ ...prev, [name]: value }));
  };

  const agregarParticipante = async (cedula, esAbogado = false) => {
    if (!cedula.trim()) {
      setError(esAbogado ? 'Ingrese una cédula de abogado válida.' : 'Ingrese una cédula de cliente válida.');
      return;
    }

    // Prevent adding duplicates by checking against the 'caso' state (which holds IDs)
    const currentIds = esAbogado ? caso.abogados : caso.clientes;
    if (currentIds.includes(cedula.trim())) {
      setError(esAbogado ? 'Este abogado ya está asignado al caso.' : 'Este cliente ya está asignado al caso.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const participantInfo = await fetchParticipantDetails(cedula.trim());

      if (participantInfo.nombre === 'No encontrado' || participantInfo.nombre === 'Error al cargar') {
        throw new Error(esAbogado ? `Abogado con cédula ${cedula} no encontrado.` : `Cliente con cédula ${cedula} no encontrado.`);
      }

      const key = esAbogado ? 'abogados' : 'clientes';
      const setInfo = esAbogado ? setAbogadosInfo : setClientesInfo;
      const setNuevaCedula = esAbogado ? setNuevaCedulaAbogado : setNuevaCedulaCliente;

      // Update the 'caso' state which holds the array of IDs
      setCaso(prev => ({
        ...prev,
        [key]: [...prev[key], cedula.trim()]
      }));

      // Update the 'Info' state which holds objects with { cedula, nombre }
      setInfo(prev => {
        const newParticipants = [...prev, participantInfo];
        // Ensure uniqueness by cedula when updating info lists
        const uniqueParticipants = Array.from(new Map(newParticipants.map(item => [item.cedula, item])).values());
        return uniqueParticipants;
      });

      setNuevaCedula(''); // Clear input field
      setSuccess(`${participantInfo.nombre} agregado correctamente.`);
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarParticipante = (cedula, esAbogado = false) => {
    const key = esAbogado ? 'abogados' : 'clientes';
    const setInfo = esAbogado ? setAbogadosInfo : setClientesInfo;

    // Prevent removing the last lawyer if there's only one
    if (esAbogado && caso.abogados.length === 1 && caso.abogados.includes(cedula)) {
      setError('Debe haber al menos un abogado asignado al caso.');
      return;
    }

    setCaso(prev => ({
      ...prev,
      [key]: prev[key].filter(id => id !== cedula)
    }));

    setInfo(prev => prev.filter(p => p.cedula !== cedula));
    setSuccess('Participante eliminado.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const actualizarCaso = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const casoDTO = {
        idCaso: caso.codigo,
        nombreCaso: caso.nombreCaso,
        descripcionCaso: caso.descripcionCaso,
        estadoCaso: caso.estadoCaso.toUpperCase(),
        // Ensure to send just the Cédulas/IDs to the backend
        clientes: caso.clientes, // 'caso.clientes' already holds the IDs
        abogados: caso.abogados // 'caso.abogados' already holds the IDs
      };

      const response = await fetch(process.env.REACT_APP_ACTUALIZAR_CASO, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(casoDTO)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el caso');
      }

      setSuccess('Caso actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);

      // Update the local state of 'caso' with potentially updated data
      // This is important if the backend sends back any modified fields
      setCaso(prevCaso => ({ ...prevCaso, ...casoDTO }));

    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar caso:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacturaClick = async () => {
    setIsLoading(true);
    setError('');
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación');
      const id = caso.codigo;

      // Make sure REACT_APP_GET_FACTURA_POR_CASO is defined in your .env file
      // and points to the correct API endpoint that returns a factura object for a given case ID.
      const response = await fetch(`${process.env.REACT_APP_GET_FACTURA_POR_CASO}/${id}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (response.ok) {
        const facturaResponse = await response.json();
        // Assuming your API returns the factura object directly or wrapped in a 'respuesta' field
        const factura = facturaResponse.respuesta;
        // Factura found, navigate to update it
        navigate('/abogado/updateReceipt', { state: { factura: factura } });
      } 
      else {
        // If 404 or any other non-OK status, assume no existing factura and redirect to create
        console.warn('No se encontró una factura válida para este caso, se redirige a creación.');
        navigate('/abogado/createReceipt', { state: { idCaso: caso.codigo } });
      } 
    } catch (err) {
      setError(err.message);
      console.error('Error al manejar clic en factura:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderParticipantSection = (esAbogado = false) => {
    const data = esAbogado ? abogadosInfo : clientesInfo;
    const nuevaCedula = esAbogado ? nuevaCedulaAbogado : nuevaCedulaCliente;
    const setNuevaCedula = esAbogado ? setNuevaCedulaAbogado : setNuevaCedulaCliente;
    const placeholder = esAbogado ? 'Ingrese cédula del abogado' : 'Ingrese cédula del cliente';

    return (
      <div className="participant-management">
        <div className="add-participant">
          <input
            type="text"
            placeholder={placeholder}
            value={nuevaCedula}
            onChange={(e) => setNuevaCedula(e.target.value)}
            disabled={isLoading || loadingParticipants}
            onKeyPress={(e) => { // Allow adding by pressing Enter
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                agregarParticipante(nuevaCedula, esAbogado);
              }
            }}
          />
          <button
            type="button"
            onClick={() => agregarParticipante(nuevaCedula, esAbogado)}
            disabled={isLoading || loadingParticipants || !nuevaCedula.trim()}
            className="add-button"
          >
            <FaUserPlus /> Agregar
          </button>
        </div>
        <div className="participants-list">
          {loadingParticipants ? (
            <p>Cargando {esAbogado ? 'abogados' : 'clientes'}...</p>
          ) : data.length > 0 ? (
            data.map((participante) => (
              <div key={participante.cedula} className="participant-tag">
                {participante.nombre} ({participante.cedula})
                {esAbogado && caso.abogados.length === 1 && caso.abogados[0] === participante.cedula ? (
                  <span className="info-text"> (Mín. 1 abogado)</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => eliminarParticipante(participante.cedula, esAbogado)}
                    className="remove-button"
                    disabled={isLoading}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="no-items">No hay {esAbogado ? 'abogados' : 'clientes'} asignados</p>
          )}
        </div>
      </div>
    );
  };

  // Show full page spinner if initial load is happening and no case data yet
  if (isLoading && !caso.codigo) {
    return <LoadingSpinner fullPage />;
  }

  // If no case data is loaded (and not loading), show an error message
  if (!caso.codigo && !isLoading) {
    return (
      <div className="update-case-container">
        <div className="alert error-message">
          {error || 'No se pudo cargar la información del caso. Asegúrese de que el caso sea válido.'}
        </div>
      </div>
    );
  }

  return (
    <div className="update-case-container">
      {isLoading && <LoadingSpinner />} {/* Show a smaller spinner for ongoing operations */}

      <div className="update-case-header">
        <h1>Actualizar Caso: {caso.nombreCaso}</h1>
        <div className="case-status">
          Estado: <span className={`status-${caso.estadoCaso.toLowerCase()}`}>
            {caso.estadoCaso}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'datos' ? 'active' : ''}`}
          onClick={() => setActiveTab('datos')}
        >
          <FaInfoCircle /> Datos del Caso
        </button>
        <button
          className={`tab-button ${activeTab === 'comentarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('comentarios')}
        >
          <FaComment /> Comentarios ({caso.comentarios?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('documentos')}
        >
          <FaPaperclip /> Documentos ({caso.documentos?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'correo' ? 'active' : ''}`}
          onClick={() => setActiveTab('correo')}
        >
          <FaEnvelope /> Enviar Correo
        </button>
        <button
          type="button"
          className="tab-button"
          onClick={handleFacturaClick}
          disabled={isLoading}
        >
          <FaFileInvoiceDollar /> Factura
        </button>
      </div>

      {error && (
        <div className="alert error-message" onClick={() => setError('')}>
          {error}
        </div>
      )}
      {success && (
        <div className="alert success-message" onClick={() => setSuccess('')}>
          {success}
        </div>
      )}

      <div className="tab-content">
        {activeTab === 'datos' && (
          <form onSubmit={actualizarCaso} className="case-form">
            <div className="form-group">
              <label>Nombre del Caso:</label>
              <input
                type="text"
                name="nombreCaso"
                value={caso.nombreCaso}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcionCaso"
                value={caso.descripcionCaso}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Estado del Caso:</label>
              <select
                name="estadoCaso"
                value={caso.estadoCaso}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Clientes:</label>
              {renderParticipantSection(false)}
            </div>

            <div className="form-group">
              <label>Abogados:</label>
              {renderParticipantSection(true)}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'comentarios' && (
          // Pass the 'caso' object to the Comentarios component
          <Comentarios initialCaso={caso} />
        )}

        {activeTab === 'documentos' && (
          <div className="documents-section">
            <DocumentsList documentosIds={caso.documentos} />
          </div>
        )}

        {activeTab === 'correo' && (
          <div className="email-section">
            <EmailForm idCaso={caso.codigo} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCase;