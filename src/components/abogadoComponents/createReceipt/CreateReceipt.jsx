import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateReceipt.css'; // Ensure your CSS file is correctly linked

const CreateReceipt = ({ idCaso }) => {
    const [formData, setFormData] = useState({
        concepto: '',
        descripcion: '',
        valor: ''
    });

    const [errores, setErrores] = useState({});
    const [jwt, setJwt] = useState('');
    const [popupMessage, setPopupMessage] = useState(''); // Unified message for popups
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            setJwt(token);
        } else {
            setPopupMessage('No se encontró un token válido. Por favor, inicie sesión.');
            setShowErrorPopup(true);
        }

        if (!idCaso) {
            setPopupMessage('Error: No se ha proporcionado un ID de caso válido para crear la factura.');
            setShowErrorPopup(true);
        }
    }, [idCaso]);

    const validar = () => {
        const newErrores = {};
        if (!formData.concepto.trim()) newErrores.concepto = 'El concepto es obligatorio';
        if (!formData.descripcion.trim()) newErrores.descripcion = 'La descripción es obligatoria';
        // Ensure valor is a positive number
        if (!formData.valor || isNaN(formData.valor) || Number(formData.valor) <= 0) {
            newErrores.valor = 'El valor debe ser un número válido mayor a cero';
        }
        setErrores(newErrores);
        return Object.keys(newErrores).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPopupMessage(''); // Clear previous messages
        setShowSuccessPopup(false);
        setShowErrorPopup(false);

        if (!validar()) {
            // Errors are already set by validar(), so they'll be displayed below the fields
            // No need for a general popup here as field-specific errors are better
            return;
        }

        if (!idCaso) {
            setPopupMessage('Error: No hay un ID de caso disponible para crear la factura.');
            setShowErrorPopup(true);
            return;
        }
        if (!jwt) {
            setPopupMessage('Error: No se encontró el token JWT. Por favor, inicie sesión.');
            setShowErrorPopup(true);
            return;
        }

        try {
            const url = process.env.REACT_APP_CREAR_FACTURA;
            const facturaPayload = {
                concepto: formData.concepto,
                descripcion: formData.descripcion,
                valor: Number(formData.valor),
                idCaso: idCaso
            };

            await axios.post(url, facturaPayload, {
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });

            setPopupMessage('Factura creada exitosamente.');
            setShowSuccessPopup(true);
            setFormData({ concepto: '', descripcion: '', valor: '' }); // Clear form
            setErrores({}); // Clear errors
            // Navigation will happen when success popup is closed
            alert('Factura creada exitosamente.');
            navigate(-1);
        } catch (error) {
            console.error('Error al crear la factura:', error);
            setPopupMessage(error.response?.data?.message || 'Error al crear la factura. Intente de nuevo.');
            setShowErrorPopup(true);
        }
    };

    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
        navigate(-1); // Navigate back to the main page (or wherever appropriate)
    };

    const handleCloseErrorPopup = () => {
        setShowErrorPopup(false);
        setPopupMessage(''); // Clear the message
    };

    return (
        <div className="factura-container">
            <h2 className="factura-title">Crear Factura</h2>

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="popup-overlay">
                    <div className="popup-content error-popup">
                        <p>{popupMessage}</p>
                        <button onClick={handleCloseErrorPopup} className="factura-button popup-button-error">Cerrar</button>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content success-popup">
                        <p>{popupMessage}</p>
                        <button onClick={handleCloseSuccessPopup} className="factura-button popup-button-success">Cerrar</button>
                    </div>
                </div>
            )}

            {/* Only render the form if idCaso is available from props */}
            {idCaso ? (
                <form onSubmit={handleSubmit} className="factura-form">
                    <div>
                        <label className="factura-label">Concepto</label>
                        <input
                            name="concepto"
                            className="factura-input"
                            value={formData.concepto}
                            onChange={handleChange}
                            placeholder="Ingrese el concepto"
                            required
                        />
                        {errores.concepto && <p className="factura-error">{errores.concepto}</p>}
                    </div>

                    <div>
                        <label className="factura-label">Descripción</label>
                        <textarea
                            name="descripcion"
                            className="factura-textarea"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Ingrese la descripción"
                            required
                        />
                        {errores.descripcion && <p className="factura-error">{errores.descripcion}</p>}
                    </div>

                    <div>
                        <label className="factura-label">Valor</label>
                        <input
                            type="number"
                            name="valor"
                            className="factura-input"
                            value={formData.valor}
                            onChange={handleChange}
                            placeholder="Ingrese el valor"
                            min="0.01"
                            step="0.01"
                            required
                        />
                        {errores.valor && <p className="factura-error">{errores.valor}</p>}
                    </div>

                    <button type="submit" className="factura-button">Crear Factura</button>
                </form>
            ) : (
                <p className="factura-info">
                    {/* Display message based on popupMessage if an error occurred early */}
                    {popupMessage || "Cargando información del caso o no se encontró un ID de caso."}
                </p>
            )}
        </div>
    );
};

export default CreateReceipt;