import React, { useState, useEffect } from 'react';
import './CreateCase.css';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FaArrowRight, FaTimes } from 'react-icons/fa'; // Importar iconos

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

  // Función para buscar clientes (simulada - reemplazar con endpoint real)
  const buscarCliente = async () => {
    if (!clienteCedula.trim()) return;
    
    setSearchLoading(prev => ({ ...prev, clientes: true }));
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validar si la cédula ya está en la lista
      if (clientes.includes(clienteCedula)) {
        throw new Error('Este cliente ya fue añadido');
      }
      
      // Simulación de respuesta
      return { cedula: clienteCedula, nombre: `Cliente ${clienteCedula}` };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSearchLoading(prev => ({ ...prev, clientes: false }));
    }
  };

  // Función para buscar abogados (simulada - reemplazar con endpoint real)
  const buscarAbogado = async () => {
    if (!abogadoCedula.trim()) return;
    
    setSearchLoading(prev => ({ ...prev, abogados: true }));
    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validar si la cédula ya está en la lista
      if (abogados.includes(abogadoCedula)) {
        throw new Error('Este abogado ya fue añadido');
      }
      
      // Simulación de respuesta
      return { cedula: abogadoCedula, nombre: `Abogado ${abogadoCedula}` };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSearchLoading(prev => ({ ...prev, abogados: false }));
    }
  };

  const agregarCliente = async () => {
    setError('');
    const cliente = await buscarCliente();
    if (cliente) {
      setClientes([...clientes, cliente.cedula]);
      setClienteCedula('');
    }
  };

  const agregarAbogado = async () => {
    setError('');
    const abogado = await buscarAbogado();
    if (abogado) {
      setAbogados([...abogados, abogado.cedula]);
      setAbogadoCedula('');
    }
  };

  const eliminarCliente = (index) => {
    const nuevosClientes = [...clientes];
    nuevosClientes.splice(index, 1);
    setClientes(nuevosClientes);
  };

  const eliminarAbogado = (index) => {
    const nuevosAbogados = [...abogados];
    nuevosAbogados.splice(index, 1);
    setAbogados(nuevosAbogados);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (clientes.length === 0 || abogados.length === 0) {
      setError('Debe agregar al menos un cliente y un abogado');
      setIsLoading(false);
      return;
    }

    try {
      const casoData = {
        nombreCaso,
        descripcionCaso,
        fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        idCliente: clientes,
        idAbogados: abogados,
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

      if (!response.ok) {
        throw new Error('Error al crear el caso');
      }

      setSuccess('Caso creado exitosamente');
      // Limpiar formulario
      setNombreCaso('');
      setDescripcionCaso('');
      setFechaInicio('');
      setClientes([]);
      setAbogados([]);
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
            <label>Fecha de Inicio</label>
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
                    clientes.map((cedula, index) => (
                      <div key={index} className="item-tag">
                        {cedula}
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
                    abogados.map((cedula, index) => (
                      <div key={index} className="item-tag">
                        {cedula}
                        <button 
                          type="button" 
                          onClick={() => eliminarAbogado(index)} 
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