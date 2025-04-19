import React, { useState, useEffect } from 'react';
import {
  FaPaperclip,
  FaComment,
  FaInfoCircle,
  FaUpload
} from 'react-icons/fa';
import LoadingSpinner from '../../loading/LoadingSpinner';
import './UpdateCase.css';

const UpdateCase = ({ codigo }) => {
  const [casoId, setCasoId] = useState(codigo || localStorage.getItem('idCasoSeleccionado'));

  const [caso, setCaso] = useState({
    nombreCaso: '',
    descripcionCaso: '',
    fechaInicio: '',
    fechaFin: '',
    idCliente: [],
    idAbogados: [],
    estadoCaso: 'INACTIVO',
    comentarios: [],
    documentos: []
  });

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevoDocumento, setNuevoDocumento] = useState(null);
  const [activeTab, setActiveTab] = useState('datos');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const cargarCaso = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_OBTENER_CASO}/${casoId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });

        if (!response.ok) throw new Error('Error al cargar el caso');

        const data = await response.json();
        setCaso(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (casoId) {
      cargarCaso();
    } else {
      setError('ID del caso no encontrado.');
    }
  }, [casoId]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('idCasoSeleccionado');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaso(prev => ({ ...prev, [name]: value }));
  };

  const actualizarCaso = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_ACTUALIZAR_CASO, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(caso)
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

  const agregarComentario = async () => {
    if (!nuevoComentario.trim()) return;

    setIsLoading(true);
    try {
      const comentario = {
        contenido: nuevoComentario,
        fecha: new Date().toISOString(),
        autor: localStorage.getItem('userId')
      };

      const response = await fetch(`${process.env.REACT_APP_AGREGAR_COMENTARIO}/${casoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(comentario)
      });

      if (!response.ok) throw new Error('Error al agregar comentario');

      setCaso(prev => ({
        ...prev,
        comentarios: [...prev.comentarios, comentario]
      }));
      setNuevoComentario('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const subirDocumento = async (e) => {
    e.preventDefault();
    if (!nuevoDocumento) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('documento', nuevoDocumento);

      const response = await fetch(`${process.env.REACT_APP_SUBIR_DOCUMENTO}/${casoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir documento');

      const data = await response.json();
      setCaso(prev => ({
        ...prev,
        documentos: [...prev.documentos, data.nombreDocumento]
      }));
      setNuevoDocumento(null);
      setSuccess('Documento subido correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const descargarDocumento = async (nombreDocumento) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_DESCARGAR_DOCUMENTO}/${casoId}/${nombreDocumento}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Error al descargar documento');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreDocumento;
      link.click();
    } catch (err) {
      setError(err.message);
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
            <FaComment /> Comentarios ({caso.comentarios.length})
          </button>
          <button className={`tab-button ${activeTab === 'documentos' ? 'active' : ''}`} onClick={() => setActiveTab('documentos')}>
            <FaPaperclip /> Documentos ({caso.documentos.length})
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="tab-content">
          {activeTab === 'datos' && (
              <form onSubmit={actualizarCaso} className="case-form">
                <div className="form-group">
                  <label>Nombre del Caso:</label>
                  <input type="text" name="nombreCaso" value={caso.nombreCaso} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea name="descripcionCaso" value={caso.descripcionCaso} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Inicio:</label>
                    <input type="date" name="fechaInicio" value={caso.fechaInicio?.split('T')[0] || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Fin:</label>
                    <input type="date" name="fechaFin" value={caso.fechaFin?.split('T')[0] || ''} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado del Caso:</label>
                  <select name="estadoCaso" value={caso.estadoCaso} onChange={handleChange}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Clientes:</label>
                  <div className="items-list">
                    {caso.idCliente.map((cliente, index) => (
                        <div key={index} className="item-tag">{cliente}</div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Abogados:</label>
                  <div className="items-list">
                    {caso.idAbogados.map((abogado, index) => (
                        <div key={index} className="item-tag">{abogado}</div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
          )}

          {activeTab === 'comentarios' && (
              <div className="comments-section">
                <div className="comments-list">
                  {caso.comentarios.length === 0 ? (
                      <p className="no-items">No hay comentarios aún</p>
                  ) : (
                      caso.comentarios.map((comentario, index) => (
                          <div key={index} className="comment">
                            <div className="comment-header">
                              <span className="comment-author">{comentario.autor}</span>
                              <span className="comment-date">
                        {new Date(comentario.fecha).toLocaleString()}
                      </span>
                            </div>
                            <div className="comment-content">{comentario.contenido}</div>
                          </div>
                      ))
                  )}
                </div>

                <div className="add-comment">
                  <textarea placeholder="Escribe un nuevo comentario..." value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} disabled={isLoading} />
                  <button onClick={agregarComentario} disabled={isLoading || !nuevoComentario.trim()} className="submit-button">
                    Enviar Comentario
                  </button>
                </div>
              </div>
          )}

          {activeTab === 'documentos' && (
              <div className="documents-section">
                <form onSubmit={subirDocumento} className="upload-form">
                  <div className="form-group">
                    <label>Subir Nuevo Documento:</label>
                    <div className="file-input">
                      <input type="file" id="documento" onChange={(e) => setNuevoDocumento(e.target.files[0])} disabled={isLoading} />
                      <label htmlFor="documento" className="file-label">
                        <FaUpload /> Seleccionar Archivo
                      </label>
                      {nuevoDocumento && <span className="file-name">{nuevoDocumento.name}</span>}
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading || !nuevoDocumento} className="submit-button">
                    {isLoading ? 'Subiendo...' : 'Subir Documento'}
                  </button>
                </form>

                <div className="documents-list">
                  <h3>Documentos del Caso</h3>
                  {caso.documentos.length === 0 ? (
                      <p className="no-items">No hay documentos subidos</p>
                  ) : (
                      <ul>
                        {caso.documentos.map((documento, index) => (
                            <li key={index} className="document-item">
                              <span>{documento}</span>
                              <button onClick={() => descargarDocumento(documento)} className="download-button">
                                Descargar
                              </button>
                            </li>
                        ))}
                      </ul>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default UpdateCase;