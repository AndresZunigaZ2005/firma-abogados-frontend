import React, { useState, useEffect } from 'react';
import './SignupClientForm.css';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { useEmailValidator } from '../../../hook/useEmailValidator';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const SignupClientForm = () => {
  const [cedula, setCedula] = useState('');
  const [cedulaError, setCedulaError] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoError, setTelefonoError] = useState(''); // Nuevo estado para error de teléfono
  const [email, setEmail] = useState('');
  const emailValido = useEmailValidator(email);
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
    if (value.length < 7) {
      setPasswordError('La contraseña debe tener al menos 7 caracteres.');
    } else if (!/[a-z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una letra minúscula.');
    } else if (!/[A-Z]/.test(value)) {
      setPasswordError('La contraseña debe contener al menos una letra mayúscula.');
    } else if (!/[0-9]/.test(value)) {
      setPasswordError('Debe contener al menos un número');
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

  const handleTelefonoChange = (e) => {
    const value = e.target.value;
    // Solo permite números y actualiza el estado si es válido
    if (/^\d*$/.test(value)) {
      setTelefono(value);
      setTelefonoError(''); // Limpiar error si había uno
    } else {
      setTelefonoError('El teléfono solo puede contener números');
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCedulaError('');
    setTelefonoError('');

    // Validación de cédula
    if (cedula.length < 4) {
      setCedulaError('La cédula debe tener al menos 4 dígitos');
      setIsLoading(false);
      return;
    }

        // Validación de teléfono
    if (!/^\d+$/.test(telefono)) {
      setTelefonoError('El teléfono solo puede contener números');
      setIsLoading(false);
      return;
    }
  
    // Validación de contraseña
    if (passwordError || confirmarContraseniaError) {
      setError('Por favor, corrige los errores en las contraseñas.');
      setIsLoading(false);
      return;
    }
  
    // Validar que las contraseñas coincidan (doble verificación)
    if (password !== confirmarContrasenia) {
      setConfirmarContraseniaError('Las contraseñas no coinciden.');
      setIsLoading(false);
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
      confirmarContrasenia,
      rol: 'CLIENTE',
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la cuenta');
      }
  
      const data = await response.json();
      console.log('Cuenta creada:', data);
      
      // Limpiar estados y redirigir
      setError('');
      setCedulaError('');
      alert('Cuenta creada exitosamente');
      navigate('/');
      localStorage.removeItem('formData');
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Hubo un error al crear la cuenta. Inténtalo de nuevo.');
      
      // Manejo específico para errores de cédula duplicada
      if (error.message.includes('cédula') || error.message.includes('Cédula')) {
        setCedulaError(error.message);
      }
      
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
            type="text"
            id="telefono"
            name="telefono"
            placeholder="Teléfono"
            value={telefono}
            onChange={handleTelefonoChange}
            disabled={isLoading}
            required
            inputMode="numeric" // Muestra teclado numérico en móviles
            pattern="\d*" // Patrón HTML5 para solo números
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
          {!emailValido && email.length > 0 && <span>Correo no válido</span>}
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