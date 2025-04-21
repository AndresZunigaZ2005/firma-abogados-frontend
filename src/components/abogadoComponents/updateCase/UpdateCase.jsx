import React, { useState, useEffect } from 'react';
import { FaComment, FaInfoCircle, FaUserPlus, FaTrash, FaPaperclip, FaEnvelope } from 'react-icons/fa';
import LoadingSpinner from '../../loading/LoadingSpinner';
import DocumentsList from '../../documentList/DocumentsList';
import Comentarios from '../../comentarios/Comentarios';
import EmailForm from '../../emailForm/EmailForm';
import './UpdateCase.css';

const UpdateCase = () => {
  const [caso, setCaso] = useState({
    codigo: '',
    nombreCaso: '',
    descripcionCaso: '',
    estadoCaso: 'INACTIVO',
    clientes: [],
    abogados: [],
    documentos: [],
    comentarios: []
  });
  const [clientesInfo, setClientesInfo] = useState([]);
  const [abogadosInfo, setAbogadosInfo] = useState([]);
  const [activeTab, setActiveTab] = useState('datos');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nuevaCedulaCliente, setNuevaCedulaCliente] = useState('');
  const [nuevaCedulaAbogado, setNuevaCedulaAbogado] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Cargar caso del localStorage y verificar estructura
  useEffect(() => {
    const loadCase = async () => {
      try {
        setIsLoading(true);
        const casoGuardado = localStorage.getItem('casoSeleccionado');
        
        if (!casoGuardado) {
          throw new Error('No se encontró el caso en el almacenamiento local');
        }

        const parsedCaso = JSON.parse(casoGuardado);
        
        // Validar estructura básica del caso
        if (!parsedCaso.codigo || !parsedCaso.nombreCaso) {
          throw new Error('El caso no tiene la estructura esperada');
        }

        const formattedCase = {
          codigo: parsedCaso.codigo,
          nombreCaso: parsedCaso.nombreCaso,
          descripcionCaso: parsedCaso.descripcionCaso || '',
          estadoCaso: parsedCaso.estadoCaso || 'INACTIVO',
          clientes: parsedCaso.idCliente || [],
          abogados: parsedCaso.idAbogados || [],
          comentarios: parsedCaso.comentarios || [],
          documentos: parsedCaso.documentos || []
        };

        setCaso(formattedCase);
        await cargarInformacionParticipantes(formattedCase.clientes, formattedCase.abogados);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar el caso:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCase();

    return () => {
      localStorage.removeItem('casoSeleccionado');
    };
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaso(prev => ({ ...prev, [name]: value }));
  };

  const agregarParticipante = async (cedula, esAbogado = false) => {
    if (!cedula.trim()) return;
    
    setIsLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });

      if (!response.ok) throw new Error(esAbogado ? 'Abogado no encontrado' : 'Cliente no encontrado');

      const data = await response.json();
      const nombre = data.respuesta?.nombre || 'Nombre no disponible';

      // Actualizar estado
      const key = esAbogado ? 'abogados' : 'clientes';
      
      setCaso(prev => ({
        ...prev,
        [key]: [...prev[key], cedula]
      }));

      if (esAbogado) {
        setAbogadosInfo(prev => [...prev, { cedula, nombre }]);
        setNuevaCedulaAbogado('');
      } else {
        setClientesInfo(prev => [...prev, { cedula, nombre }]);
        setNuevaCedulaCliente('');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarParticipante = (cedula, esAbogado = false) => {
    const key = esAbogado ? 'abogados' : 'clientes';
    
    setCaso(prev => ({
      ...prev,
      [key]: prev[key].filter(id => id !== cedula)
    }));
    
    if (esAbogado) {
      setAbogadosInfo(prev => prev.filter(a => a.cedula !== cedula));
    } else {
      setClientesInfo(prev => prev.filter(c => c.cedula !== cedula));
    }
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
        clientes: caso.clientes.map(c => c.toString().trim()),
        abogados: caso.abogados.map(a => a.toString().trim())
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
      
      // Actualizar localStorage con los nuevos datos
      const updatedCase = { ...caso, ...casoDTO };
      localStorage.setItem('casoSeleccionado', JSON.stringify(updatedCase));

    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar caso:', err);
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
            disabled={isLoading}
          />
          <button 
            type="button" 
            onClick={() => agregarParticipante(nuevaCedula, esAbogado)}
            disabled={isLoading || !nuevaCedula.trim()}
            className="add-button"
          >
            <FaUserPlus /> Agregar
          </button>
        </div>
        <div className="participants-list">
          {loadingParticipants ? (
            <p>Cargando {esAbogado ? 'abogados' : 'clientes'}...</p>
          ) : data.length > 0 ? (
            data.map((participante, index) => (
              <div key={index} className="participant-tag">
                {participante.nombre} ({participante.cedula})
                {!(esAbogado && index === 0) && (
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

  return (
    <div className="update-case-container">
      {isLoading && <LoadingSpinner fullPage />}

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

            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        )}

        {activeTab === 'comentarios' && (
          <Comentarios caso={caso}
          />
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