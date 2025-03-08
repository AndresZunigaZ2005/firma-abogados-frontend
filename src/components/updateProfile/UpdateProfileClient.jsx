import React, { useState } from 'react';
import './UpdateProfileClient.css'; // Archivo de estilos para el componente

const UpdateProfileClient = () => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Obtener el token JWT del localStorage (o de donde lo tengas almacenado)
    const token = localStorage.getItem('jwt');

    // Datos que se enviarán en el cuerpo de la solicitud
    const datosActualizacion = {
      cedula: '123456789', // Aquí deberías obtener la cédula del usuario desde el token o el estado
      nombre,
      telefono,
      email: correo,
      direccion,
      password: 'password', // Aquí deberías obtener la contraseña del usuario desde el token o el estado
      rol: 'CLIENTE'
    };

    try {
      const response = await fetch(process.env.REACT_APP_ACTUALIZAR_CUENTA, {
        method: 'PUT', // o 'POST' dependiendo de tu API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluir el token JWT en la cabecera
        },
        body: JSON.stringify(datosActualizacion)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Perfil actualizado:', data);
        alert('Perfil actualizado con éxito');
      } else {
        console.error('Error al actualizar el perfil:', response.statusText);
        alert('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      alert('Error al realizar la solicitud');
    }
  };

  return (
    <div className="actualizar-perfil-container">
      {/* Encabezado */}
      <div className="actualizar-perfil-header">
        <h1>Actualizar Perfil</h1>
      </div>

      {/* Formulario de actualización de perfil */}
      <form className="actualizar-perfil-form" onSubmit={handleSubmit}>
        {/* Campo de nombre */}
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* Campo de teléfono */}
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>

        {/* Campo de dirección */}
        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>

        {/* Campo de correo electrónico */}
        <div className="form-group">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            name="correo"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        {/* Botón de actualizar */}
        <button type="submit" className="actualizar-button">
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default UpdateProfileClient;