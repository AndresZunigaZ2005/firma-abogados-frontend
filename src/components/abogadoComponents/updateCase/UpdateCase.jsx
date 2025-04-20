import React, { useState, useEffect } from 'react';
import { FaComment, FaInfoCircle, FaUserPlus, FaTrash, FaPaperclip } from 'react-icons/fa';
import LoadingSpinner from '../../loading/LoadingSpinner';
import DocumentsList from '../../documentList/DocumentsList';
import Comentarios from '../../comentarios/Comentarios';
import './UpdateCase.css';

const UpdateCase = () => {
  const [caso, setCaso] = useState({
    codigo: '',
    nombreCaso: '',
    descriptionCaso: '', // Cambiado de descripcionCaso
    estadoCaso: 'INACTIVO',
    clientes: [], // Cambiado de idCliente
    abogados: [], // Cambiado de idAbogados
    documentos: []
  });
  const [clientesInfo, setClientesInfo] = useState([]);
  const [abogadosInfo, setAbogadosInfo] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [activeTab, setActiveTab] = useState('datos');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nuevaCedulaCliente, setNuevaCedulaCliente] = useState('');
  const [nuevaCedulaAbogado, setNuevaCedulaAbogado] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    const casoGuardado = localStorage.getItem('casoSeleccionado');
    if (casoGuardado) {
      const parsedCaso = JSON.parse(casoGuardado);
      setCaso({
        codigo: parsedCaso.codigo,
        nombreCaso: parsedCaso.nombreCaso,
        descripcionCaso: parsedCaso.descripcionCaso, // Mapeo de nombre diferente
        estadoCaso: parsedCaso.estadoCaso || 'INACTIVO',
        clientes: parsedCaso.idCliente || [], // Mapeo de nombre diferente
        abogados: parsedCaso.idAbogados || [], // Mapeo de nombre diferente
        documentos: parsedCaso.documentos || []
      });
      
      // Cargar información de participantes
      cargarInformacionParticipantes(parsedCaso.idCliente, parsedCaso.idAbogados);
    } else {
      setError('No se encontró el caso en el almacenamiento local');
    }

    return () => {
      localStorage.removeItem('casoSeleccionado');
    };
  }, []);

  const cargarInformacionParticipantes = async (clientesIds, abogadosIds) => {
    setLoadingParticipants(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación');

      // Obtener información de clientes
      const clientesData = await Promise.all(
        clientesIds.map(async (cedula) => {
          const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });
          if (!response.ok) throw new Error('Error al buscar cliente');
          const data = await response.json();
          return { cedula, nombre: data.respuesta.nombre };
        })
      );

      // Obtener información de abogados
      const abogadosData = await Promise.all(
        abogadosIds.map(async (cedula) => {
          const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });
          if (!response.ok) throw new Error('Error al buscar abogado');
          const data = await response.json();
          return { cedula, nombre: data.respuesta.nombre };
        })
      );

      setClientesInfo(clientesData);
      setAbogadosInfo(abogadosData);
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

  const agregarCliente = async () => {
    if (!nuevaCedulaCliente.trim()) return;
    
    setIsLoading(true);
    const cedula = nuevaCedulaCliente;
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) throw new Error('Cliente no encontrado');

      const data = await response.json();
      const nombreCliente = data.respuesta.nombre;

      // Actualizar estado del caso y la información de clientes
      setCaso(prev => ({
        ...prev,
        clients: [...prev.clients, nuevaCedulaCliente] // Cambiado de idCliente a clients
      }));

      setClientesInfo(prev => [...prev, { cedula: nuevaCedulaCliente, nombre: nombreCliente }]);
      setNuevaCedulaCliente('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const agregarAbogado = async () => {
    if (!nuevaCedulaAbogado.trim()) return;
    
    setIsLoading(true);
    const cedula = nuevaCedulaAbogado;
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!response.ok) throw new Error('Abogado no encontrado');

      const data = await response.json();
      const nombreAbogado = data.respuesta.nombre;

      // Actualizar estado del caso y la información de abogados
      setCaso(prev => ({
        ...prev,
        abogados: [...prev.abogados, nuevaCedulaAbogado] // Cambiado de idAbogados a abogados
      }));

      setAbogadosInfo(prev => [...prev, { cedula: nuevaCedulaAbogado, nombre: nombreAbogado }]);
      setNuevaCedulaAbogado('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarCliente = (cedula) => {
    setCaso(prev => ({
      ...prev,
      clients: prev.clients.filter(id => id !== cedula) // Cambiado de idCliente a clients
    }));
    setClientesInfo(prev => prev.filter(cliente => cliente.cedula !== cedula));
  };

  const eliminarAbogado = (cedula) => {
    setCaso(prev => ({
      ...prev,
      abogados: prev.abogados.filter(id => id !== cedula) // Cambiado de idAbogados a abogados
    }));
    setAbogadosInfo(prev => prev.filter(abogado => abogado.cedula !== cedula));
  };

  const actualizarCaso = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const casoDTO = {
        idCaso: caso.codigo,
        nombreCaso: caso.nombreCaso,
        descripcionCaso: caso.descripcionCaso, 
        estadoCaso: caso.estadoCaso.toUpperCase(),
        clientes: caso.idCliente, 
        abogados: caso.idAbogados 
      };

      const response = await fetch(process.env.REACT_APP_ACTUALIZAR_CASO, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(casoDTO)
      });

      if (!response.ok) throw new Error('Error al actualizar el caso');

      setSuccess('Caso actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComentario = async (comentario) => {
    setIsLoading(true);
    try {
      // Aquí iría la lógica para guardar en el backend si es necesario
      setCaso(prev => ({
        ...prev,
        comentarios: [...(prev.comentarios || []), comentario]
      }));
    } catch (err) {
      setError('Error al guardar el comentario');
      throw err; // Para que el componente Comentarios pueda manejarlo
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="update-case-container">
      {isLoading && <LoadingSpinner />}

      <div className="update-case-header">
        <h1>Actualizar Caso: {caso.nombreCaso}</h1>
        <div className="case-status">
          Estado: <span className={`status-${caso.estadoCaso.toLowerCase()}`}>
            {caso.estadoCaso}
          </span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-button ${activeTab === 'datos' ? 'active' : ''}`} onClick={() => setActiveTab('datos')}>
          <FaInfoCircle /> Datos del Caso
        </button>
        <button className={`tab-button ${activeTab === 'comentarios' ? 'active' : ''}`} onClick={() => setActiveTab('comentarios')}>
          <FaComment /> Comentarios ({caso.comentarios?.length || 0})
        </button>
        <button className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`} onClick={() => setActiveTab('documentos')}>
          <FaPaperclip /> Documentos ({caso.documentos?.length || 0})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

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
              />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea 
                name="descripcionCaso" 
                value={caso.descripcionCaso} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Estado del Caso:</label>
              <select 
                name="estadoCaso" 
                value={caso.estadoCaso} 
                onChange={handleChange}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="CERRADO">Cerrado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Clientes:</label>
              <div className="participant-management">
                <div className="add-participant">
                  <input
                    type="text"
                    placeholder="Ingrese cédula del cliente"
                    value={nuevaCedulaCliente}
                    onChange={(e) => setNuevaCedulaCliente(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    onClick={agregarCliente}
                    disabled={isLoading || !nuevaCedulaCliente.trim()}
                    className="add-button"
                  >
                    <FaUserPlus /> Agregar
                  </button>
                </div>
                <div className="items-list">
                  {loadingParticipants ? (
                    <p>Cargando clientes...</p>
                  ) : clientesInfo.length > 0 ? (
                    clientesInfo.map((cliente, index) => (
                      <div key={index} className="item-tag">
                        {cliente.nombre} ({cliente.cedula})
                        <button 
                          type="button" 
                          onClick={() => eliminarCliente(cliente.cedula)}
                          className="remove-button"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-items">No hay clientes asignados</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Abogados:</label>
              <div className="participant-management">
                <div className="add-participant">
                  <input
                    type="text"
                    placeholder="Ingrese cédula del abogado"
                    value={nuevaCedulaAbogado}
                    onChange={(e) => setNuevaCedulaAbogado(e.target.value)}
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    onClick={agregarAbogado}
                    disabled={isLoading || !nuevaCedulaAbogado.trim()}
                    className="add-button"
                  >
                    <FaUserPlus /> Agregar
                  </button>
                </div>
                <div className="items-list">
                  {loadingParticipants ? (
                    <p>Cargando abogados...</p>
                  ) : abogadosInfo.length > 0 ? (
                    abogadosInfo.map((abogado, index) => (
                      <div key={index} className="item-tag">
                        {abogado.nombre} ({abogado.cedula})
                        <button 
                          type="button" 
                          onClick={() => eliminarAbogado(abogado.cedula)}
                          className="remove-button"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-items">No hay abogados asignados</p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
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
    </div>
  );
};

export default UpdateCase;