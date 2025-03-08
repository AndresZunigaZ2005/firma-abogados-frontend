import React, { useState, useEffect } from "react";
import "./CasesView.css"; // Importa los estilos

const CasesView = () => {
  const [casos, setCasos] = useState([]); // Estado para almacenar los casos

  // Función para obtener los casos desde el endpoint
  const fetchCasos = async () => {
    try {
      // Obtener el JWT desde el localStorage
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("No se encontró el token de autenticación.");
      }

      // Hacer la solicitud al endpoint con el JWT en los headers
      const response = await fetch(process.env.REACT_APP_LISTAR_CASOS_CLIENTE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`, // Incluir el JWT en el header
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los casos");
      }

      const data = await response.json();
      setCasos(data); // Guardar los casos en el estado
    } catch (error) {
      console.error("Error al obtener los casos:", error);
      alert("No se pudieron cargar los casos. Por favor, inicia sesión."); // Mostrar mensaje de error al usuario
    }
  };

  // Llamar a la función para obtener los casos cuando el componente se monta
  useEffect(() => {
    fetchCasos();
  }, []);

  return (
    <div className="cases-container">
      {casos.length === 0 ? (
        <p>No hay casos disponibles.</p> // Mensaje si no hay casos
      ) : (
        casos.map((caso) => (
          <div key={caso.id} className="card">
            <div className="card-content">
              <h2 className="title">{caso.nombreCaso}</h2> {/* Muestra el nombre del caso */}
              <p className="description">
                <strong>Descripción:</strong> {caso.descripcionCaso} {/* Muestra la descripción del caso */}
              </p>
            </div>
            <div className="card-actions">
              <button className="button">Ver más</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CasesView;