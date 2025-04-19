import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./casesView.css";
import LoadingSpinner from '../../loading/LoadingSpinner';

const CasesView = () => {
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Hook para navegación

  const fetchCasos = async () => {
    setIsLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const jwt = localStorage.getItem("jwt");

      if (!userEmail || !jwt) {
        throw new Error("Faltan credenciales.");
      }

      // 1. Obtener el cliente por email
      const clienteResponse = await fetch(
        `${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!clienteResponse.ok) throw new Error("Error al obtener el cliente.");

      const clienteData = await clienteResponse.json();
      const idCuenta = clienteData.respuesta.idCuenta;

      // 2. Obtener los casos del cliente
      const casosResponse = await fetch(
        `${process.env.REACT_APP_LISTAR_CASOS_CLIENTE}/${idCuenta}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!casosResponse.ok) throw new Error("Error al obtener los casos.");

      const casosData = await casosResponse.json();
      setCasos(casosData.respuesta);
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudieron cargar los casos. Por favor, recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el clic en "Ver más"
  const handleVerMas = (caso) => {
    // Navegar a la ruta /caso-detalle con el estado del caso
    navigate('/', { state: { caso } }); //TODO Definir una ruta
  };

  useEffect(() => {
    fetchCasos();
  }, []);

  return (
    <div className="cases-container">
      {isLoading && <LoadingSpinner />}

      {!isLoading && casos.length === 0 ? (
        <p>No hay casos disponibles.</p>
      ) : (
        casos.map((caso, index) => (
          <div key={caso.codigo} className="card">
            <div className="card-content">
              <h2 className="title">Caso: {index + 1}</h2>
              <h3>{caso.nombreCaso}</h3>
              <p className="description">
                <strong>Descripción:</strong> {caso.descripcionCaso}
              </p>
            </div>
            <div className="card-actions">
              <button 
                className="button"
                onClick={() => handleVerMas(caso)} // Pasar el caso completo
              >
                Ver más
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CasesView;