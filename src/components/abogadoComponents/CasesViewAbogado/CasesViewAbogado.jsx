import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CasesViewAbogado.css";
import LoadingSpinner from "../../loading/LoadingSpinner";

const CasesViewAbogado = () => {
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCasos = async () => {
    setIsLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const jwt = localStorage.getItem("jwt");

      if (!userEmail || !jwt) {
        throw new Error("Faltan credenciales.");
      }

      // Obtener abogado por email
      const abogadoResponse = await fetch(
        `${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!abogadoResponse.ok) throw new Error("Error al obtener el abogado.");

      const abogadoData = await abogadoResponse.json();
      const idCuenta = abogadoData.respuesta.idCuenta;

      // Obtener casos del abogado
      const casosResponse = await fetch(
        `${process.env.REACT_APP_LISTAR_CASOS_ABOGADO}/${idCuenta}`,
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

  useEffect(() => {
    fetchCasos();
  }, []);

  const redirigirActualizar = (caso) => {
    // Guardar el caso completo en localStorage
    localStorage.setItem("casoSeleccionado", JSON.stringify(caso));
    navigate("/abogado/updateCase");
  };

  return (
    <div className={`cases-container ${isLoading ? "loading-disabled" : ""}`}>
      {isLoading && <LoadingSpinner />}

      {!isLoading && casos.length === 0 ? (
        <p>No hay casos asignados.</p>
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
                onClick={() => redirigirActualizar(caso)}
              >
                Actualizar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CasesViewAbogado;