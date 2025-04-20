import React, { useState } from 'react';
import { FaComment } from 'react-icons/fa';
import LoadingSpinner from '../loading/LoadingSpinner';

const Comentarios = ({ comentarios: initialComentarios, onAddComentario, isLoading }) => {
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarios, setComentarios] = useState(initialComentarios || []);

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    
    try {
      const comentario = {
        contenido: nuevoComentario,
        fecha: new Date().toISOString(),
        autor: localStorage.getItem('userId') || 'Usuario anónimo'
      };

      // Actualizar estado local primero para feedback inmediato
      setComentarios(prev => [...prev, comentario]);
      setNuevoComentario('');
      
      // Llamar a la función prop para guardar en el servidor
      if (onAddComentario) {
        await onAddComentario(comentario);
      }
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      // Revertir si falla
      setComentarios(initialComentarios || []);
    }
  };

  return (
    <div className="comments-section">
      <div className="section-header">
        <FaComment /> Comentarios ({comentarios.length})
      </div>
      
      <div className="comments-list">
        {comentarios.length === 0 ? (
          <p className="no-items">No hay comentarios aún</p>
        ) : (
          comentarios.map((comentario, index) => (
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
        <textarea 
          placeholder="Escribe un nuevo comentario..." 
          value={nuevoComentario} 
          onChange={(e) => setNuevoComentario(e.target.value)} 
          disabled={isLoading} 
        />
        <button 
          onClick={handleAgregarComentario} 
          disabled={isLoading || !nuevoComentario.trim()} 
          className="submit-button"
        >
          {isLoading ? <LoadingSpinner small /> : 'Enviar Comentario'}
        </button>
      </div>
    </div>
  );
};

export default Comentarios;