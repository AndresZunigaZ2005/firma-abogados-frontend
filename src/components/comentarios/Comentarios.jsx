import React, { useState, useEffect } from 'react';
import { FaComment } from 'react-icons/fa';
import LoadingSpinner from '../loading/LoadingSpinner';
import './Comentarios.css';

const Comentarios = () => {
  const [caso, setCaso] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState({
    asunto: '',
    descripcion: ''
  });
  const [cuentaUsuario, setCuentaUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 1. Obtener caso del localStorage
        const casoLocal = JSON.parse(localStorage.getItem('casoSeleccionado'));
        if (!casoLocal) throw new Error('No se encontró el caso seleccionado');
        setCaso(casoLocal);
        
        // 2. Obtener cuenta del usuario actual
        const email = localStorage.getItem('userEmail');
        if (!email) throw new Error('No se encontró el email del usuario');
        
        const userResponse = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        
        if (!userResponse.ok) throw new Error('Error al obtener información del usuario');
        const userData = await userResponse.json();
        setCuentaUsuario(userData.respuesta);

        // 3. Cargar comentarios con información de cuentas
        await cargarComentarios(casoLocal);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para cargar comentarios con información de cuentas
  const cargarComentarios = async (casoData) => {
    if (!casoData.comentarios || casoData.comentarios.length === 0) {
      setComentarios([]);
      return;
    }

    try {
      const comentariosConCuentas = await Promise.all(
        casoData.comentarios.map(async comentario => {
          // Si ya tiene la cuenta cargada, no hacemos otra petición
          if (comentario.cuenta) {
            return comentario;
          }
          
          // Obtener información de la cuenta
          const cuentaResponse = await fetch(`${process.env.REACT_APP_BUSCAR_POR_IDCUENTA}/${comentario.idCuenta}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
          });
          
          return {
            ...comentario,
            cuenta: cuentaResponse.ok 
              ? (await cuentaResponse.json()).respuesta 
              : { nombre: 'Usuario desconocido', tipoCuenta: 'DESCONOCIDO' }
          };
        })
      );
      
      setComentarios(comentariosConCuentas);
    } catch (err) {
      setError('Error al cargar información de los comentarios');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevoComentario.asunto.trim() || !nuevoComentario.descripcion.trim()) {
      setError('Asunto y descripción son requeridos');
      return;
    }
    
    if (!cuentaUsuario || !caso) {
      setError('No se pudo identificar su cuenta o el caso');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const comentarioDTO = {
        idCaso: caso.codigo,
        asunto: nuevoComentario.asunto,
        descripcion: nuevoComentario.descripcion,
        idCuenta: cuentaUsuario.idCuenta
      };

      // Enviar comentario al backend
      const response = await fetch(process.env.REACT_APP_COMENTAR_CASO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(comentarioDTO)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar comentario');
      }

      // Crear el nuevo comentario con toda la información
      const nuevoComentarioConCuenta = {
        ...(await response.json()).comentario,
        cuenta: cuentaUsuario,
      };

      // Actualizar estado y localStorage
      const comentariosActualizados = [...comentarios, nuevoComentarioConCuenta];
      setComentarios(comentariosActualizados);
      setNuevoComentario({ asunto: '', descripcion: '' });
      
      const casoActualizado = {
        ...caso,
        comentarios: comentariosActualizados
      };
      localStorage.setItem('casoSeleccionado', JSON.stringify(casoActualizado));
      setCaso(casoActualizado);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoComentario(prev => ({ ...prev, [name]: value }));
  };

  if (!caso) {
    return isLoading ? <LoadingSpinner /> : <div className="error-message">{error || 'No se encontró el caso'}</div>;
  }

  return (
    <div className="comentarios-container">
      <div className="comentarios-header">
        <FaComment className="icon" />
        <h2>Comentarios ({comentarios.length})</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="comentarios-list">
        {isLoading && comentarios.length === 0 ? (
          <LoadingSpinner />
        ) : comentarios.length === 0 ? (
          <p className="no-comentarios">No hay comentarios aún</p>
        ) : (
          comentarios.map((comentario, index) => (
            <div 
              key={index} 
              className={`comentario-item ${comentario.cuenta?.tipoCuenta === 'ABOGADO' ? 'abogado' : 'cliente'}`}
            >
              <div className="comentario-header">
                <div>
                  <h3 className="comentario-asunto">{comentario.asunto}</h3>
                  <span className="comentario-autor">
                    {comentario.cuenta?.nombre} ({comentario.cuenta?.tipoCuenta?.toLowerCase() || 'desconocido'})
                  </span>
                </div>
                <span className="comentario-fecha">
                  {comentario.fecha ? new Date(comentario.fecha).toLocaleString() : 'Fecha no disponible'}
                </span>
              </div>
              <div className="comentario-contenido">
                {comentario.descripcion}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="comentario-form">
        <div className="form-group">
          <label htmlFor="asunto">Asunto:</label>
          <input
            type="text"
            id="asunto"
            name="asunto"
            value={nuevoComentario.asunto}
            onChange={handleChange}
            placeholder="Título del comentario"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="descripcion">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={nuevoComentario.descripcion}
            onChange={handleChange}
            placeholder="Escribe tu comentario aquí..."
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !nuevoComentario.asunto.trim() || !nuevoComentario.descripcion.trim()} 
          className="submit-button"
        >
          {isLoading ? <LoadingSpinner small /> : 'Enviar Comentario'}
        </button>
      </form>
    </div>
  );
};

export default Comentarios;