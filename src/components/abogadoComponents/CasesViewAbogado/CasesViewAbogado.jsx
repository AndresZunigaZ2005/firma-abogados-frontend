import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CasesViewAbogado.css";
import LoadingSpinner from "../../loading/LoadingSpinner";

const CasesViewAbogado = () => {
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const navigate = useNavigate();

  const fetchCasos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const email = localStorage.getItem("userEmail");
      const jwt = localStorage.getItem("jwt");

      if (!email || !jwt) {
        throw new Error("Faltan credenciales. Por favor inicie sesión nuevamente.");
      }

      // Obtener abogado por email
      const abogadoResponse = await fetch(
        `${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(email)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!abogadoResponse.ok) {
        throw new Error("Error al obtener información del abogado.");
      }

      const abogadoData = await abogadoResponse.json();
      const cedulaAbogado = abogadoData.respuesta.cedula;

      // Obtener casos del abogado
      const casosResponse = await fetch(
        `${process.env.REACT_APP_LISTAR_CASOS_ABOGADO}/${cedulaAbogado}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!casosResponse.ok) {
        throw new Error("Error al obtener los casos asignados.");
      }

      const casosData = await casosResponse.json();
      setCasos(casosData.respuesta || []);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCasos();
  }, []);

  const redirigirActualizar = (caso) => {
    try {
      // Validar estructura básica del caso antes de guardar
      if (!caso.codigo || !caso.nombreCaso) {
        throw new Error('El caso no tiene la estructura esperada');
      }
      
      // Guardar el caso completo en localStorage
      localStorage.setItem("casoSeleccionado", JSON.stringify(caso));
      navigate("/abogado/updateCase");
    } catch (err) {
      console.error('Error al redirigir:', err);
      setError('Error al cargar el caso seleccionado');
    }
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