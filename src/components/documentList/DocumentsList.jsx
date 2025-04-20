import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload } from 'react-icons/fa';
import LoadingSpinner from '../loading/LoadingSpinner';
import './DocumentsList.css';

const DocumentsList = ({ documentosIds }) => {
  const [documentos, setDocumentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [nuevoDocumento, setNuevoDocumento] = useState(null);

  useEffect(() => {
    const fetchNombresDocumentos = async () => {
      if (!documentosIds || documentosIds.length === 0) return;
      
      setIsLoading(true);
      try {
        const nombres = await Promise.all(
          documentosIds.map(async (id) => {
            const response = await fetch(`${process.env.REACT_APP_OBTENER_NOMBRE_DOCUMENTO}/${id}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              }
            });
            
            if (!response.ok) throw new Error('Error al obtener nombre del documento');
            
            const data = await response.json();
            return {
              id,
              nombre: data.nombreDocumento || `Documento ${id}`
            };
          })
        );
        
        setDocumentos(nombres);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNombresDocumentos();
  }, [documentosIds]);

  const descargarDocumento = async (idDocumento) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_DESCARGAR_DOCUMENTO}/${idDocumento}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Error al descargar documento');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Buscar el nombre del documento correspondiente
      const documento = documentos.find(doc => doc.id === idDocumento);
      link.download = documento?.nombre || `documento-${idDocumento}`;
      
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubirDocumento = async (e) => {
    e.preventDefault();
    if (!nuevoDocumento) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('documento', nuevoDocumento);

      const response = await fetch(process.env.REACT_APP_SUBIR_DOCUMENTO, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir documento');

      const data = await response.json();
      setDocumentos(prev => [...prev, {
        id: data.idDocumento,
        nombre: nuevoDocumento.name
      }]);
      setNuevoDocumento(null);
      setShowUpload(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="documents-container">
      {isLoading && <LoadingSpinner />}
      
      {error && <div className="error-message">{error}</div>}

      <div className="documents-header">
        <h3>Documentos del Caso</h3>
        <button 
          className="upload-button"
          onClick={() => setShowUpload(!showUpload)}
        >
          <FaUpload /> Subir Documento
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleSubirDocumento} className="upload-form">
          <div className="form-group">
            <label>Seleccionar archivo:</label>
            <div className="file-input">
              <input 
                type="file" 
                id="documento" 
                onChange={(e) => setNuevoDocumento(e.target.files[0])} 
                disabled={isLoading} 
              />
              <label htmlFor="documento" className="file-label">
                {nuevoDocumento ? nuevoDocumento.name : 'Seleccionar archivo'}
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setShowUpload(false);
                setNuevoDocumento(null);
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !nuevoDocumento}
            >
              {isLoading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </form>
      )}

      <div className="documents-list">
        {documentos.length === 0 ? (
          <p className="no-documents">No hay documentos disponibles</p>
        ) : (
          <ul>
            {documentos.map((documento) => (
              <li 
                key={documento.id} 
                className="document-item"
                onClick={() => descargarDocumento(documento.id)}
              >
                <span className="document-name">{documento.nombre}</span>
                <button 
                  className="download-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    descargarDocumento(documento.id);
                  }}
                >
                  <FaDownload /> Descargar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;