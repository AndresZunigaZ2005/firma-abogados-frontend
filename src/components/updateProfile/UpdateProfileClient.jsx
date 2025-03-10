import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  // Estados para cada campo del cliente
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // Función para obtener los datos del cliente
  const fetchUserData = async () => {
    try {
      // Obtener el email del localStorage
      const userEmail = localStorage.getItem('userEmail');

      // Realizar la solicitud al endpoint con el email
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

      // Setear los campos con los datos del cliente (excluyendo el correo electrónico)
      setNombre(infoUser.nombre);
      setCedula(infoUser.cedula);
      setTelefono(infoUser.telefono);
      setDireccion(infoUser.direccion);
    } catch (error) {
      console.error(error);
    }
  };

  // Llamar a la función para obtener los datos del cliente cuando el componente se monta
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="user-profile">
      <h1>Perfil del Usuario</h1>
      <form>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cedula">Cédula:</label>
          <input
            type="text"
            id="cedula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Dirección:</label>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default UserProfile;