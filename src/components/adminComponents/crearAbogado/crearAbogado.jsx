import React, { useState, useEffect } from 'react';
import './crearAbogado.css';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FaArrowRight, FaTimes } from 'react-icons/fa'; // Importar los íconos que estás usando

const CrearAbogado = () => {
    const [cedula, setCedula] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [especializaciones, setEspecializaciones] = useState([]);
    const [especializacion, setEspecializacion] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState({
        especializaciones: false
    });
    const navigate = useNavigate();

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
        if (especializacion.trim()) {
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
                            <input
                                type="text"
                                value={especializacion}
                                onChange={(e) => setEspecializacion(e.target.value)}
                                disabled={isLoading || searchLoading.especializaciones}
                                placeholder="Ingrese las especializaciones del abogado"
                            />
                            <button
                                type="button"
                                onClick={agregarEspecializacion}
                                className="add-button"
                                disabled={isLoading || searchLoading.especializaciones || !especializacion.trim()}
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