import React, { useState, useEffect } from "react";
import "./comment.css"; 

const ComentarioCaso = ({ casoId, idCuenta, onComentarioAgregado }) => {
    const [asunto, setAsunto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mensaje, setMensaje] = useState('');
  
    const manejarEnvio = async () => {
      
      if (!asunto.trim() || !descripcion.trim()) {
        setMensaje("Por favor completa todos los campos.");
        return;
      }
  
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          throw new Error("No se encontró el token de autenticación.");
        }
  
        const comentario = {
          idCaso: casoId,
          asunto,
          descripcion,
          fecha: new Date().toISOString(),
          idCuenta: idCuenta,
        };
  
        const response = await fetch(`${process.env.REACT_APP_AGREGAR_COMENTARIO}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(comentario),
        });
  
        if (!response.ok) {
          throw new Error("Error al agregar el comentario.");
        }
  
        setAsunto('');
        setDescripcion('');
        setMensaje("Comentario agregado exitosamente.");
        
        if (onComentarioAgregado) onComentarioAgregado();
      } catch (error) {
        console.error("Error:", error);
        setMensaje("Ocurrió un error al enviar el comentario.");
      }
    };

  return (
    <div className="comentario-container">
      <h2>Agregar Comentario</h2>

      <label>Asunto</label>
      <input
        type="text"
        value={asunto}
        onChange={(e) => setAsunto(e.target.value)}
        placeholder="Asunto del comentario"
      />

      <label>Descripción</label>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción del comentario"
        rows={4}
      />

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <button onClick={manejarEnvio}>Agregar Comentario</button>
    </div>
  );
};

export default ComentarioCaso;