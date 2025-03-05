import React, {useState} from 'react';
import './SignupClientForm.css'; // Archivo de estilos para el Registro

const SignupClientForm = () => {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');

  // Validar la contraseña
  const validatePassword = (value) => {
    if (value.length < 5) {
      setPasswordError('La contraseña debe tener al menos 5 caracteres.');
    } else if (!/[a-z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una letra minúscula.');
    } else if (!/[A-Z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una letra mayúscula.');
    } else {
      setPasswordError('');
    }
  };

  // Validar que las contraseñas coincidan
  const validateRepeatPassword = (value) => {
    if (value !== password) {
      setRepeatPasswordError('Las contraseñas no coinciden.');
    } else {
      setRepeatPasswordError('');
    }
  };

  // Manejar cambios en el campo de contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (repeatPassword) validateRepeatPassword(repeatPassword); // Validar repetir contraseña si ya tiene valor
  };

  // Manejar cambios en el campo de repetir contraseña
  const handleRepeatPasswordChange = (e) => {
    const value = e.target.value;
    setRepeatPassword(value);
    validateRepeatPassword(value);
  };

  return (
    <div className="registro-container">
      {/* Encabezado */}
      <div className="registro-header">
        <h1>Registrarse</h1>
      </div>

      {/* Formulario de registro */}
      <form className="registro-form">
        {/* Campo de cédula */}
        <div className="form-group">
          <label htmlFor="cedula">Cédula</label>
          <input
            type="text"
            id="cedula"
            name="cedula"
            placeholder="Cédula"
            required
          />
        </div>

        {/* Campo de nombre */}
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Nombre"
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
            required
          />
        </div>

        {/* Campo de correo electrónico */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
          />
        </div>

        {/* Campo de contraseña */}
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>

        {/* Campo de repetir contraseña */}
        <div className="form-group">
          <label htmlFor="repeat-password">Repetir Contraseña</label>
          <input
            type="password"
            id="repeat-password"
            name="repeat-password"
            placeholder="Repetir Contraseña"
            value={repeatPassword}
            onChange={handleRepeatPasswordChange}
            required
          />
          {repeatPasswordError && <p className="error-message">{repeatPasswordError}</p>}
        </div>

        {/* Botón de registro */}
        <button type="submit" className="registro-button">
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default SignupClientForm;