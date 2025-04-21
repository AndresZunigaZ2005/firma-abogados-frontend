import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload } from 'react-icons/fa';
import LoadingSpinner from '../loading/LoadingSpinner';
import './DocumentsList.css';

const DocumentsList = ({ documentosIds }) => {
  const [documentos, setDocumentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caso, setCaso] = useState(null);

  // Cargar el caso del localStorage al montar el componente
  useEffect(() => {
    const casoGuardado = localStorage.getItem('casoSeleccionado');
    if (casoGuardado) {
      try {
        const parsedCaso = JSON.parse(casoGuardado);
        if (parsedCaso.codigo) {
          setCaso(parsedCaso);
        }
      } catch (error) {
        console.error('Error al parsear caso:', error);
      }
    }
  }, []);

  // Función para cargar nombres de documentos (reutilizable)
  const fetchNombresDocumentos = async (ids) => {
    if (!ids || ids.length === 0) {
      setDocumentos([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const nombres = await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(`${process.env.REACT_APP_OBTENER_NOMBRE_DOCUMENTO}/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Error al obtener nombre del documento');
          }
          
          // Leer la respuesta como texto plano
          const nombreDocumento = await response.text();
          
          return {
            id,
            nombre: nombreDocumento || `Documento ${id}`
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

  // Cargar nombres de documentos al montar el componente o cuando cambian los IDs
  useEffect(() => {
    fetchNombresDocumentos(documentosIds);
  }, [documentosIds]);

  const descargarDocumento = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_DESCARGAR_DOCUMENTO}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });

      if (!response.ok) throw new Error('Error al descargar documento');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener el nombre del documento para el nombre de archivo de descarga
      const documento = documentos.find(doc => doc.id === id);
      link.download = documento?.nombre || `documento-${id}`;
      
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubirDocumento = async (e) => {
    e.preventDefault();
    if (!selectedFile || !caso?.codigo) return;

    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('archivo', selectedFile);
      formData.append('idCaso', caso.codigo);

      const response = await fetch(process.env.REACT_APP_SUBIR_DOCUMENTO, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al subir documento');
      }

      let idDocumentoNuevo;

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        idDocumentoNuevo = data.idDocumento;
      } else {
        const text = await response.text();
        console.warn('Respuesta no JSON:', text);
        
        // Aquí podrías intentar extraer el ID del documento si viene incluido en el texto,
        // pero si no se puede, muestra error:
        throw new Error('El servidor no devolvió datos válidos para continuar.');
      }

      if (!idDocumentoNuevo) {
        throw new Error('No se pudo obtener el ID del nuevo documento');
      }

      // Actualizar el caso en localStorage
      const casoActualizado = {
        ...caso,
        documentos: [...(caso.documentos || []), idDocumentoNuevo]
      };
      localStorage.setItem('casoSeleccionado', JSON.stringify(casoActualizado));
      
      // Forzar recarga de todos los documentos (incluyendo el nuevo)
      await fetchNombresDocumentos(casoActualizado.documentos);
      
      // Resetear el formulario
      setSelectedFile(null);
      setShowUpload(false);
      window.location.reload();
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
          disabled={!caso?.codigo}
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
                onChange={(e) => setSelectedFile(e.target.files[0])} 
                disabled={isLoading} 
              />
              <label htmlFor="documento" className="file-label">
                {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setShowUpload(false);
                setSelectedFile(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !selectedFile || !caso?.codigo}
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