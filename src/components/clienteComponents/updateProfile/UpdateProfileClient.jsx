import React, { useState, useEffect } from 'react';
import './UpdateProfileClient.css';
import LoadingSpinner from '../../loading/LoadingSpinner'; // Asegúrate de tener esta ruta correcta

const UpdateProfileClient = () => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el loading

  const fetchUserData = async () => {
    setIsLoading(true); // Activar loading al iniciar
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`${process.env.REACT_APP_BUSCAR_POR_EMAIL}/${userEmail}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      const data = await response.json();
      const infoUser = data.respuesta;

      setNombre(infoUser.nombre);
      setCedula(infoUser.cedula);
      setTelefono(infoUser.telefono);
      setDireccion(infoUser.direccion);
      setCorreo(infoUser.email);
      setPassword(infoUser.password);
    } catch (error) {
      console.error(error);
      alert('Error al cargar los datos del perfil');
    } finally {
      setIsLoading(false); // Desactivar loading al finalizar
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Activar loading al iniciar actualización
    
    const datosActualizacion = {
      cedula,
      nombre,
      telefono,
      email: correo,
      direccion,
      password,
      rol: 'CLIENTE'
    };

    try {
      const response = await fetch(process.env.REACT_APP_ACTUALIZAR_CUENTA, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify(datosActualizacion),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos del usuario');
      }

      alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsLoading(false); // Desactivar loading al finalizar
    }
  };

  return (
    <div className="actualizar-perfil-container">
      {isLoading && <LoadingSpinner />} {/* Mostrar spinner cuando isLoading es true */}
      
      <div className="actualizar-perfil-header">
        <h1>Actualizar Perfil</h1>
      </div>
      
      <form className="actualizar-perfil-form" onSubmit={handleUpdate}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input 
            type="text" 
            id="nombre" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cedula">Cédula:</label>
          <input 
            type="text" 
            id="cedula" 
            value={cedula} 
            disabled
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input 
            type="text" 
            id="telefono" 
            value={telefono} 
            onChange={(e) => setTelefono(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="direccion">Dirección:</label>
          <input 
            type="text" 
            id="direccion" 
            value={direccion} 
            onChange={(e) => setDireccion(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="correo">Correo:</label>
          <input 
            type="email" 
            id="correo" 
            value={correo} 
            disabled 
          />
        </div>
        
        <button 
          type="submit" 
          className="actualizar-button"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfileClient;