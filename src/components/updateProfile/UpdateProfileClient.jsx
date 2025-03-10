import React, { useState, useEffect } from 'react';
import './UpdateProfileClient.css';

const UpdateProfileClient = () => {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const fetchUserData = async () => {
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
      setPassword(infoUser.password); // Establecer el valor original de la contraseña
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const datosActualizacion = {
      cedula, // La cédula siempre será la original (infoUser.cedula)
      nombre,
      telefono,
      email: correo, // El correo siempre será el original (infoUser.email)
      direccion,
      password, // La contraseña siempre será la original (infoUser.password)
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
    }
  };

  return (
    <div className="actualizar-perfil-container">
      <div className="actualizar-perfil-header">
        <h1>Actualizar Perfil</h1>
      </div>
      <form className="actualizar-perfil-form" onSubmit={handleUpdate}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="cedula">Cédula:</label>
          <input type="text" id="cedula" value={cedula} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input type="text" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Dirección:</label>
          <input type="text" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="correo">Correo:</label>
          <input type="email" id="correo" value={correo} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input type="password" id="password" value={password} disabled />
        </div>
        <button type="submit" className="actualizar-button">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default UpdateProfileClient;