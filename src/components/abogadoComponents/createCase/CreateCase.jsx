import React, { useState, useEffect } from 'react';
import './CreateCase.css';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FaArrowRight, FaTimes, FaLock } from 'react-icons/fa';

const CreateCase = () => {
  const [nombreCaso, setNombreCaso] = useState('');
  const [descripcionCaso, setDescripcionCaso] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [clienteCedula, setClienteCedula] = useState('');
  const [abogadoCedula, setAbogadoCedula] = useState('');
  const [clientes, setClientes] = useState([]);
  const [abogados, setAbogados] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState({
    clientes: false,
    abogados: false
  });

  // Cargar abogado logueado automáticamente
  useEffect(() => {
    const cargarAbogadoLogueado = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${encodeURIComponent(userEmail)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        
        if (!response.ok) throw new Error('Error al cargar datos del abogado');
        
        const data = await response.json();
        const abogado = data.respuesta;
        
        // Agregar abogado logueado como primer elemento
        setAbogados([{ cedula: abogado.cedula, nombre: abogado.nombre }]);
      } catch (err) {
        console.error(err);
      }
    };
    
    cargarAbogadoLogueado();
  }, []);

  // Función para buscar por cédula (común para clientes y abogados)
  const buscarPorCedula = async (cedula, tipo) => {
    if (!cedula.trim()) return null;
    
    setSearchLoading(prev => ({ ...prev, [tipo]: true }));
    try {
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_CEDULA}/${cedula}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      
      if (!response.ok) throw new Error('No se encontró la cédula');
      
      const data = await response.json();
      return {
        cedula: data.respuesta.cedula,
        nombre: data.respuesta.nombre
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSearchLoading(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const agregarCliente = async () => {
    setError('');
    const cliente = await buscarPorCedula(clienteCedula, 'clientes');
    if (cliente) {
      // Verificar si ya existe
      if (clientes.some(c => c.cedula === cliente.cedula)) {
        setError('Este cliente ya fue añadido');
        return;
      }
      setClientes([...clientes, cliente]);
      setClienteCedula('');
    }
  };

  const agregarAbogado = async () => {
    setError('');
    const abogado = await buscarPorCedula(abogadoCedula, 'abogados');
    if (abogado) {
      // Verificar si ya existe (incluyendo el abogado logueado)
      if (abogados.some(a => a.cedula === abogado.cedula)) {
        setError('Este abogado ya fue añadido');
        return;
      }
      setAbogados([...abogados, abogado]);
      setAbogadoCedula('');
    }
  };

  const eliminarCliente = (index) => {
    const nuevosClientes = [...clientes];
    nuevosClientes.splice(index, 1);
    setClientes(nuevosClientes);
  };

  const eliminarAbogado = (index) => {
    // No permitir eliminar al abogado logueado (siempre está en índice 0)
    if (index === 0) return;
    
    const nuevosAbogados = [...abogados];
    nuevosAbogados.splice(index, 1);
    setAbogados(nuevosAbogados);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (clientes.length === 0 || abogados.length < 1) {
      setError('Debe agregar al menos un cliente y un abogado');
      setIsLoading(false);
      return;
    }

    try {
      const casoData = {
        nombreCaso,
        descripcionCaso,
        fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        idCliente: clientes.map(c => c.cedula),
        idAbogados: abogados.map(a => a.cedula),
        estadoCaso: 'INACTIVO'
      };

      const response = await fetch(process.env.REACT_APP_CREAR_CASO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(casoData)
      });

      if (!response.ok) throw new Error('Error al crear el caso');

      setSuccess('Caso creado exitosamente');
      // Limpiar formulario (excepto abogado logueado)
      setNombreCaso('');
      setDescripcionCaso('');
      setFechaInicio('');
      setClientes([]);
      setAbogados(abogados.slice(0, 1)); // Mantener solo el abogado logueado
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-case-container">
      <div className="create-case-content">
        <h1>Crear Nuevo Caso</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Caso:</label>
            <input
              type="text"
              value={nombreCaso}
              onChange={(e) => setNombreCaso(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              value={descripcionCaso}
              onChange={(e) => setDescripcionCaso(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label>Clientes:</label>
            <div className="add-items-container">
              <div className="add-item-input">
                <input
                  type="text"
                  value={clienteCedula}
                  onChange={(e) => setClienteCedula(e.target.value)}
                  disabled={isLoading || searchLoading.clientes}
                  placeholder="Ingrese cédula del cliente"
                />
                <button
                  type="button"
                  onClick={agregarCliente}
                  className="add-button"
                  disabled={isLoading || searchLoading.clientes || !clienteCedula.trim()}
                >
                  {searchLoading.clientes ? (
                    <LoadingSpinner small white />
                  ) : (
                    'Añadir'
                  )}
                </button>
              </div>
              
              <div className="separator-arrow">
                <FaArrowRight />
              </div>
              
              <div className="items-list-container">
                <div className="items-list">
                  {clientes.length === 0 ? (
                    <div className="empty-list-message">No hay clientes añadidos</div>
                  ) : (
                    clientes.map((cliente, index) => (
                      <div key={index} className="item-tag">
                        {cliente.nombre} ({cliente.cedula})
                        <button 
                          type="button" 
                          onClick={() => eliminarCliente(index)} 
                          className="remove-button"
                          disabled={isLoading}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Abogados:</label>
            <div className="add-items-container">
              <div className="add-item-input">
                <input
                  type="text"
                  value={abogadoCedula}
                  onChange={(e) => setAbogadoCedula(e.target.value)}
                  disabled={isLoading || searchLoading.abogados}
                  placeholder="Ingrese cédula del abogado"
                />
                <button
                  type="button"
                  onClick={agregarAbogado}
                  className="add-button"
                  disabled={isLoading || searchLoading.abogados || !abogadoCedula.trim()}
                >
                  {searchLoading.abogados ? (
                    <LoadingSpinner small white />
                  ) : (
                    'Añadir'
                  )}
                </button>
              </div>
              
              <div className="separator-arrow">
                <FaArrowRight />
              </div>
              
              <div className="items-list-container">
                <div className="items-list">
                  {abogados.length === 0 ? (
                    <div className="empty-list-message">No hay abogados añadidos</div>
                  ) : (
                    abogados.map((abogado, index) => (
                      <div key={index} className="item-tag">
                        {abogado.nombre} ({abogado.cedula})
                        {index === 0 ? (
                          <span className="locked-icon" title="Abogado responsable">
                            <FaLock />
                          </span>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => eliminarAbogado(index)} 
                            className="remove-button"
                            disabled={isLoading}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            disabled={isLoading} 
            className="submit-button"
          >
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : (
              'Crear Caso'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCase;