import React, { useState } from 'react';
import './UpdateProfileClient.css'; // Archivo de estilos para el componente

const UpdateProfileClient = () => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [correo, setCorreo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para actualizar el perfil
    console.log('Perfil actualizado:', { nombre, telefono, direccion, correo });
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