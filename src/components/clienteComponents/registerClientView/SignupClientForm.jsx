import React, { useState, useEffect } from 'react';
import './SignupClientForm.css';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const SignupClientForm = () => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setdireccion] = useState(''); // Cambiado de direccion a direccion
  const [password, setPassword] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState(''); // Cambiado de repeatPassword
  const [passwordError, setPasswordError] = useState('');
  const [confirmarContraseniaError, setConfirmarContraseniaError] = useState(''); // Cambiado de repeatPasswordError
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmarContrasenia, setShowConfirmarContrasenia] = useState(false); // Cambiado de showRepeatPassword
  const navigate = useNavigate(); // Hook para navegación

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('formData')) || {};
    setCedula(savedData.cedula || '');
    setNombre(savedData.nombre || '');
    setTelefono(savedData.telefono || '');
    setEmail(savedData.email || '');
    setdireccion(savedData.direccion || ''); // Cambiado
    setPassword(savedData.password || '');
    setConfirmarContrasenia(savedData.confirmarContrasenia || ''); // Cambiado
  }, []);

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    const formData = {
      cedula,
      nombre,
      telefono,
      email,
      direccion, // Cambiado
      password,
      confirmarContrasenia, // Cambiado
    };
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [cedula, nombre, telefono, email, direccion, password, confirmarContrasenia]);

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
  const validateConfirmarContrasenia = (value) => {
    if (value !== password) {
      setConfirmarContraseniaError('Las contraseñas no coinciden.');
    } else {
      setConfirmarContraseniaError('');
    }
  };

  // Manejar cambios en el campo de contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    if (confirmarContrasenia) validateConfirmarContrasenia(confirmarContrasenia);
  };

  // Manejar cambios en el campo de confirmar contraseña
  const handleConfirmarContraseniaChange = (e) => {
    const value = e.target.value;
    setConfirmarContrasenia(value);
    validateConfirmarContrasenia(value);
  };

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Alternar visibilidad de confirmar contraseña
  const toggleConfirmarContraseniaVisibility = () => {
    setShowConfirmarContrasenia(!showConfirmarContrasenia);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (passwordError || confirmarContraseniaError) {
      setError('Por favor, corrige los errores en las contraseñas.');
      return;
    }
  
    // Crear el objeto con los datos del formulario, usando los nombres del DTO
    const datosCuenta = {
      cedula,
      nombre,
      telefono,
      email,
      direccion,
      password,
      confirmarContrasenia, // Cambiado para coincidir con el DTO
      rol: 'CLIENTE', // Cambiado de rol a rol para coincidir con el DTO
    };
  
    try {
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
      setError('');
      alert('Cuenta creada exitosamente');
      navigate('/');
      localStorage.removeItem('formData');
    } catch (error) {
      console.error('Error:', error);
      setError('Hubo un error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-header">
        <h1>Registrarse</h1>
      </div>

      <form className="registro-form" onSubmit={handleSubmit}>
        {/* Campos del formulario (sin cambios en la estructura, solo nombres de variables) */}
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

        <div className="form-group">
          <label htmlFor="direccion">Dirección</label> {/* Cambiado de direccion a direccion */}
          <input
            type="text"
            id="direccion"
            name="direccion"
            placeholder="Dirección"
            value={direccion} 
            onChange={(e) => setdireccion(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

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

        <div className="form-group password-group">
          <label htmlFor="confirmar-contrasenia">Confirmar Contraseña</label> 
          <div className="password-input-container">
            <input
              type={showConfirmarContrasenia ? 'text' : 'password'} 
              id="confirmar-contrasenia"
              name="confirmarContrasenia"
              placeholder="Confirmar Contraseña"
              value={confirmarContrasenia}
              onChange={handleConfirmarContraseniaChange} 
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="toggle-password-button"
              onClick={toggleConfirmarContraseniaVisibility}
              disabled={isLoading}
            >
              {showConfirmarContrasenia ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {confirmarContraseniaError && <p className="error-message">{confirmarContraseniaError}</p>}
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit" 
          className="registro-button"
          disabled={isLoading}
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