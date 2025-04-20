import React, { useState, useEffect } from 'react';
import './SignupClientForm.css'; // Archivo de estilos para el Registro
import LoadingSpinner from '../../loading/LoadingSpinner'; // Importar el spinner
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importamos los iconos de ojo

const SignupClientForm = () => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para el loading
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showRepeatPassword, setShowRepeatPassword] = useState(false); // Estado para mostrar/ocultar repetir contraseña

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('formData')) || {};
    setCedula(savedData.cedula || '');
    setNombre(savedData.nombre || '');
    setTelefono(savedData.telefono || '');
    setEmail(savedData.email || '');
    setDireccion(savedData.direccion || '');
    setPassword(savedData.password || '');
    setRepeatPassword(savedData.repeatPassword || '');
  }, []);

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    const formData = {
      cedula,
      nombre,
      telefono,
      email,
      direccion,
      password,
      repeatPassword,
    };
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [cedula, nombre, telefono, email, direccion, password, repeatPassword]);

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
    if (repeatPassword) validateRepeatPassword(repeatPassword);
  };

  // Manejar cambios en el campo de repetir contraseña
  const handleRepeatPasswordChange = (e) => {
    const value = e.target.value;
    setRepeatPassword(value);
    validateRepeatPassword(value);
  };

    // Alternar visibilidad de la contraseña
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    // Alternar visibilidad de repetir contraseña
    const toggleRepeatPasswordVisibility = () => {
      setShowRepeatPassword(!showRepeatPassword);
    };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Activar loading al iniciar
    setError('');
    // Validar que no haya errores en las contraseñas
    if (passwordError || repeatPasswordError) {
      setError('Por favor, corrige los errores en las contraseñas.');
      return;
    }
  
    // Crear el objeto con los datos del formulario
    const datosCuenta = {
      cedula,
      nombre,
      telefono,
      email,
      direccion,
      password,
      rol: 'CLIENTE', // Este valor es estático
    };
  
    try {
      // Hacer la solicitud POST al endpoint
      const response = await fetch(process.env.REACT_APP_CREAR_CUENTA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosCuenta),
      });
  
      if (!response.ok) {
        throw new Error('Error al crear la cuenta');
      }
  
      const data = await response.json();
      console.log('Cuenta creada:', data);
      setError(''); // Limpiar errores
      alert('Cuenta creada exitosamente'); // Mostrar mensaje de éxito
      localStorage.removeItem('formData'); // Limpiar datos guardados después de éxito
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al crear la cuenta. Inténtalo de nuevo.');
    } finally{
      setIsLoading(false); // Desactivar loading al finalizar
    }
  };

  return (
    <div className="registro-container">
      {/* Encabezado */}
      <div className="registro-header">
        <h1>Registrarse</h1>
      </div>

      {/* Formulario de registro */}
      <form className="registro-form" onSubmit={handleSubmit}>
        {/* Campo de cédula */}
        <div className="form-group">
          <label htmlFor="cedula">Cédula</label>
          <input
            type="text"
            id="cedula"
            name="cedula"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            disabled={isLoading}
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
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={isLoading}
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
            disabled={isLoading}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
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
            disabled={isLoading}
            required
          />
        </div>

        {/* Campo de contraseña con botón de visibilidad */}
        <div className="form-group password-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="toggle-password-button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>

        {/* Campo de repetir contraseña con botón de visibilidad */}
        <div className="form-group password-group">
          <label htmlFor="repeat-password">Repetir Contraseña</label>
          <div className="password-input-container">
            <input
              type={showRepeatPassword ? 'text' : 'password'}
              id="repeat-password"
              name="repeat-password"
              placeholder="Repetir Contraseña"
              value={repeatPassword}
              onChange={handleRepeatPasswordChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="toggle-password-button"
              onClick={toggleRepeatPasswordVisibility}
              disabled={isLoading}
            >
              {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {repeatPasswordError && <p className="error-message">{repeatPasswordError}</p>}
        </div>

        {/* Mostrar errores de la API */}
        {error && <p className="error-message">{error}</p>}

        {/* Botón de registro */}
        <button
          type="submit" 
          className="registro-button"
          disabled={isLoading} // Deshabilitar durante carga
        >
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner />
            </div>
          ) : (
            'Registrarse'
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupClientForm;