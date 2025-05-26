import React, { useState, useEffect } from 'react';
import { FaComment } from 'react-icons/fa';
import LoadingSpinner from '../loading/LoadingSpinner';
import './Comentarios.css';

// Accept 'initialCaso' as a prop
const Comentarios = ({ initialCaso }) => {
  const [caso, setCaso] = useState(initialCaso); // Initialize 'caso' with the prop
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState({
    asunto: '',
    descripcion: ''
  });
  const [cuentaUsuario, setCuentaUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useEffect to update 'caso' if 'initialCaso' prop changes
  // This is important if the parent component can update the case dynamically
  useEffect(() => {
    setCaso(initialCaso);
  }, [initialCaso]);


  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Validate if 'caso' is available from the prop
        if (!caso || !caso.codigo) { // Check for caso and its essential properties
          throw new Error('No se recibió el caso seleccionado como prop.');
        }

        // 2. Obtener cuenta del usuario actual
        const email = localStorage.getItem('userEmail');
        const jwt = localStorage.getItem('jwt');

        if (!email || !jwt) {
          throw new Error('Faltan credenciales. Por favor inicie sesión nuevamente.');
        }

        const userResponse = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!userResponse.ok) throw new Error('Error al obtener información del usuario');
        const userData = await userResponse.json();
        setCuentaUsuario(userData.respuesta);

        // 3. Cargar comentarios con información de cuentas
        // Use the 'caso' state which is derived from 'initialCaso' prop
        await cargarComentarios(caso);
      } catch (err) {
        setError(err.message);
        console.error("Error in Comentarios fetchData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run fetchData if 'caso' is not null (meaning initialCaso was provided)
    // and if 'caso' has the necessary 'codigo' for fetching comments
    if (caso && caso.codigo) {
      fetchData();
    } else if (!initialCaso) { // If initialCaso itself is null/undefined
        setIsLoading(false);
        setError('No se recibió el caso seleccionado.');
    }
  }, [caso, initialCaso]); // Depend on 'caso' state and 'initialCaso' prop

  // Función para cargar comentarios con información de cuentas
  const cargarComentarios = async (casoData) => {
    if (!casoData.comentarios || casoData.comentarios.length === 0) {
      setComentarios([]);
      return;
    }

    try {
      const comentariosConCuentas = await Promise.all(
        casoData.comentarios.map(async comentario => {
          // If already has account data, or if it's the current user, avoid refetching
          if (comentario.cuenta || (cuentaUsuario && comentario.idCuenta === cuentaUsuario.idCuenta)) {
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

    if (!cuentaUsuario || !caso || !caso.codigo) {
      setError('No se pudo identificar su cuenta o el caso');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const comentarioDTO = {
        idCaso: caso.codigo, // Use caso.codigo from state/prop
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

      const responseData = await response.json();

      // Create the new comment with all information, including the current user's account
      const newlyCreatedComment = {
        ...responseData.comentario, // Assuming the backend returns the created comment
        cuenta: cuentaUsuario, // Attach the current user's account data
      };

      // Update state
      const comentariosActualizados = [...comentarios, newlyCreatedComment];
      setComentarios(comentariosActualizados);
      setNuevoComentario({ asunto: '', descripcion: '' });

      // Important: Update the 'caso' state with the new comments array
      // This ensures the component's internal 'caso' state is consistent
      const casoActualizado = {
        ...caso,
        comentarios: comentariosActualizados
      };
      setCaso(casoActualizado);

      // Optionally, you might want to call a prop function here
      // if the parent component also needs to know about the updated case
      // e.g., onCaseUpdate(casoActualizado);

    } catch (err) {
      setError(err.message);
      console.error("Error submitting comment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoComentario(prev => ({ ...prev, [name]: value }));
  };

  // Display loading spinner or error if initialCase is not provided or still loading
  if (isLoading && !caso) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // If caso is still null after loading, display a fallback message
  if (!caso) {
    return <div className="error-message">No se encontró el caso para mostrar comentarios.</div>;
  }

  return (
    <div className="comentarios-container">
      <div className="comentarios-header">
        <FaComment className="icon" />
        <h2>Comentarios ({comentarios.length})</h2>
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

      
      {error && <div className="error-message">{error}</div>}

      <div className="comentarios-list">
        {isLoading && comentarios.length === 0 ? (
          <LoadingSpinner />
        ) : comentarios.length === 0 ? (
          <p className="no-comentarios">No hay comentarios aún</p>
        ) : (
          comentarios.map((comentario, index) => (
            <div
              key={comentario.id || index} // Use a unique ID if available, otherwise index
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

    </div>
  );
};

export default Comentarios;