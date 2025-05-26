import React, { useState, useEffect } from 'react';
import './crearAbogado.css';
import { useNavigate } from 'react-router-dom';
import { useEmailValidator } from '../../../hook/useEmailValidator';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FaArrowRight, FaTimes } from 'react-icons/fa'; // Importar los íconos que estás usando

const CrearAbogado = () => {
    const [cedula, setCedula] = useState('');
    const [cedulaError, setCedulaError] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [telefonoError, setTelefonoError] = useState('');
    const [email, setEmail] = useState('');
    const emailValido = useEmailValidator(email);
    const [direccion, setDireccion] = useState('');
    const [especializaciones, setEspecializaciones] = useState([]);
    const [especializacion, setEspecializacion] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState({
        especializaciones: false
    });
    const navigate = useNavigate();

    const [opcionesEspecializacion] = useState(['CIVIL', 'PENAL', 'FAMILIA']); // Opciones predefinidas

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

    const handleCedulaChange = (e) => {
        const value = e.target.value;
        // Solo permite números y actualiza el estado si es válido
        if (/^\d*$/.test(value)) {
          setCedulaError(value);
          setCedulaError(''); // Limpiar error si había uno
        } else {
            setCedulaError('El teléfono solo puede contener números');
        }
    };
    
    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('formData')) || {};
        setCedula(savedData.cedula || '');
        setNombre(savedData.nombre || '');
        setTelefono(savedData.telefono || '');
        setEmail(savedData.email || '');
        setDireccion(savedData.direccion || '');
        setEspecializaciones(savedData.especializaciones || []);
    }, []);

    useEffect(() => {
        const formData = {
            cedula,
            especializaciones,
            nombre,
            telefono,
            email,
            direccion,
        };
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [cedula, especializaciones, nombre, telefono, email, direccion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTelefonoError('');
        setError('');
        
        // Validación del teléfono
        if (!/^\d+$/.test(telefono)) {
            setTelefonoError('El teléfono solo puede contener números');
            setIsLoading(false);
            return;
        }

        if(telefono < 10 || telefono > 10){
            setTelefonoError('El teléfono debe de ser de 10 númeor');
            setIsLoading(false);
            return;
        }

        const datosCuenta = {
            cedula,
            especializaciones,
            nombre,
            telefono,
            email,
            direccion,
        };
        
        try {
            const response = await fetch(process.env.REACT_APP_CREAR_ABOGADO, {
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

    const agregarEspecializacion = () => {
        setError('');
        if (especializacion && !especializaciones.includes(especializacion)) {
            setEspecializaciones([...especializaciones, especializacion]);
            setEspecializacion('');
        }
    };

    const eliminarEspecializacion = (index) => {
        const nuevasEspecializaciones = [...especializaciones];
        nuevasEspecializaciones.splice(index, 1);
        setEspecializaciones(nuevasEspecializaciones);
    };

    return (
        <div className="registro-container">
            <div className="registro-header">
                <h1>Registrar Abogado</h1>
            </div>

            <form className="registro-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cedula">Cédula</label>
                    <input
                        type="text"
                        id="cedula"
                        name="cedula"
                        placeholder="Cédula"
                        value={cedula}
                        onChange={handleCedulaChange}
                        disabled={isLoading}
                        required
                        inputMode="numeric"  // Muestra teclado numérico en móviles
                        pattern="\d*" // Patrón HTML5 para solo números
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
                        onChange={handleTelefonoChange}
                        disabled={isLoading}
                        required
                        inputMode="numeric"  // Muestra teclado numérico en móviles
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

                <div className="form-group">
                    <label>Especializaciones:</label>
                    <div className="add-items-container">
                        <div className="add-item-input">
                            <select
                                value={especializacion}
                                onChange={(e) => setEspecializacion(e.target.value)}
                                disabled={isLoading || searchLoading.especializaciones}
                                className="combo-box"
                            >
                                <option value="">Seleccione una especialización</option>
                                {opcionesEspecializacion.map((opcion) => (
                                    <option key={opcion} value={opcion}>
                                        {opcion}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={agregarEspecializacion}
                                className="add-button"
                                disabled={isLoading || searchLoading.especializaciones || !especializacion}
                            >
                                {searchLoading.especializaciones ? (
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
                                {especializaciones.length === 0 ? (
                                    <div className="empty-list-message">No hay especializaciones añadidas</div>
                                ) : (
                                    especializaciones.map((esp, index) => (
                                        <div key={index} className="item-tag">
                                            {esp}
                                            <button 
                                                type="button" 
                                                onClick={() => eliminarEspecializacion(index)} 
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
                        'Registrar abogado'
                    )}
                </button>
            </form>
        </div>
    );
};

export default CrearAbogado;