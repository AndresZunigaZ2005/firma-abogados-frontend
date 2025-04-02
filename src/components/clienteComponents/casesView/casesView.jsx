import React, { useState, useEffect } from "react";
import "./casesView.css";
import LoadingSpinner from '../../loading/LoadingSpinner'; // Importa el spinner

const CasesView = () => {
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial

  const fetchCasos = async () => {
    setIsLoading(true); // Activar spinner al iniciar
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
      setIsLoading(false); // Desactivar spinner al finalizar
    }
  };

  useEffect(() => {
    fetchCasos();
  }, []);

  return (
    <div className="cases-container">
      {/* Spinner con fondo oscuro */}
      {isLoading && <LoadingSpinner />}

      {/* Contenido principal */}
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
              <button className="button">Ver más</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CasesView;