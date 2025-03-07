import React, { useState, useEffect } from "react";
import "./CasesView.css"; // Importa los estilos

const CasesView = () => {
  const [casos, setCasos] = useState([]); // Estado para almacenar los casos
  const [abogados, setAbogados] = useState([]); // Estado para almacenar los abogados

  // Función para obtener los casos desde un endpoint
  const fetchCasos = async () => {
    try {
      const response = await fetch("https://api.ejemplo.com/casos"); // Reemplaza con tu endpoint real
      const data = await response.json();
      setCasos(data);
    } catch (error) {
      console.error("Error al obtener los casos:", error);
    }
  };

  // Función para obtener los abogados desde un endpoint
  const fetchAbogados = async () => {
    try {
      const response = await fetch("https://api.ejemplo.com/abogados"); // Reemplaza con tu endpoint real
      const data = await response.json();
      setAbogados(data);
    } catch (error) {
      console.error("Error al obtener los abogados:", error);
    }
  };

  // Llamar a las funciones para obtener los datos cuando el componente se monta
  useEffect(() => {
    fetchCasos();
    fetchAbogados();
  }, []);

  // Función para obtener el nombre del abogado por su ID
  const obtenerNombreAbogado = (idAbogado) => {
    const abogado = abogados.find((abogado) => abogado.id === idAbogado);
    return abogado ? abogado.nombre : "Abogado no encontrado";
  };

  return (
    <div className="cases-container">
      {casos.map((caso) => (
        <div key={caso.id} className="card">
          <div className="card-content">
            <h2 className="title">Caso {caso.id}</h2>
            <p className="description">
              <strong>Descripción:</strong> {caso.descripcion}
            </p>
            <p className="lawyer">
              <strong>Abogado:</strong> {obtenerNombreAbogado(caso.idAbogado)}
            </p>
          </div>
          <div className="card-actions">
            <button className="button">Ver más</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CasesView;