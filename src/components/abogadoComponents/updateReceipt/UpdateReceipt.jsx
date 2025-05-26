import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpdateReceipt.css'; // Ensure your CSS file is correctly linked and has the popup styles

const UpdateReceipt = ({ factura }) => {
    const [concepto, setConcepto] = useState(factura?.concepto || '');
    const [descripcion, setDescripcion] = useState(factura?.descripcion || '');
    const [valor, setValor] = useState(factura?.valor || 0);
    const [abonos, setAbonos] = useState([]);
    const [currentFactura, setCurrentFactura] = useState(factura);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const navigate = useNavigate();

    // useCallback for fetching abonos to prevent unnecessary re-creations
    const fetchAbonos = useCallback(async (facturaId) => {
        setPopupMessage('');
        setShowErrorPopup(false);
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) throw new Error('No hay token de autenticación.');

            const response = await axios.get(
                `${process.env.REACT_APP_LISTAR_ABONOS}${facturaId}`,
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            );
            // Log the response data to understand its structure
            console.log('Abonos API Response:', response.data);

            // Adjust this line based on your actual API response structure
            // Assuming 'respuesta' holds the array of abonos, or it's directly in data
            const listaAbonos = response.data.respuesta || response.data || [];
            setAbonos(listaAbonos);
        } catch (err) {
            console.error('Error al obtener los abonos:', err);
            setPopupMessage(err.message || 'Error al obtener los abonos.');
            setShowErrorPopup(true);
        }
    }, []); // Empty dependency array as this function itself doesn't depend on component state/props

    useEffect(() => {
        if (!factura || !factura.idFactura) {
            setPopupMessage('No se ha proporcionado una factura válida para actualizar.');
            setShowErrorPopup(true);
            return;
        }

        setCurrentFactura(factura);
        setConcepto(factura.concepto || '');
        setDescripcion(factura.descripcion || '');
        setValor(factura.valor || 0);

        // Call fetchAbonos only if factura.idFactura exists
        fetchAbonos(factura.idFactura);
    }, [factura, fetchAbonos]); // Add fetchAbonos to dependency array

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPopupMessage('');
        setShowErrorPopup(false);
        setShowSuccessPopup(false);

        // Basic validation for required fields and positive value
        if (!concepto.trim() || !descripcion.trim() || valor <= 0) {
            setPopupMessage('Por favor, complete todos los campos y asegúrese que el valor sea mayor a cero.');
            setShowErrorPopup(true);
            return;
        }

        // New validation: valor must be greater than or equal to saldoPendiente
        // Ensure currentFactura.saldoPendiente is a number for comparison
        if (valor < (currentFactura.saldoPendiente || 0)) {
            setPopupMessage('El valor de la factura no puede ser menor al saldo pendiente.');
            setShowErrorPopup(true);
            return;
        }

        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) throw new Error('No hay token de autenticación.');

            const payload = {
                idFactura: currentFactura.idFactura,
                concepto,
                descripcion,
                estado: currentFactura.estadoFactura, // Keep existing state
                valor,
            };

            const response = await axios.put(process.env.REACT_APP_ACTUALIZAR_FACTURA, payload, {
                headers: { Authorization: `Bearer ${jwt}` },
            });

            console.log('Update Factura Response:', response.data);

            setPopupMessage('La factura se ha actualizado correctamente.');
            setShowSuccessPopup(true);

        } catch (err) {
            console.error('Error al actualizar la factura:', err);
            setPopupMessage(err.response?.data?.message || err.message || 'Error al actualizar la factura');
            setShowErrorPopup(true);
        }
    };

    const handleCloseSuccessPopup = () => {
        setShowSuccessPopup(false);
        navigate(-1); // Navigate back to the previous page
    };

    const handleCloseErrorPopup = () => {
        setShowErrorPopup(false);
        setPopupMessage('');
    };

    // Conditional rendering for initial loading/error state
    if (!currentFactura || !currentFactura.idFactura) {
        return (
            <div className="container">
                {showErrorPopup ? (
                    <div className="popup-overlay">
                        <div className="popup-content error-popup">
                            <p>{popupMessage}</p>
                            <button onClick={handleCloseErrorPopup} className="button">Cerrar</button>
                        </div>
                    </div>
                ) : (
                    <p>Cargando detalles de la factura...</p>
                )}
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Detalle de Factura</h2>

            {/* Error Popup */}
            {showErrorPopup && (
                <div className="popup-overlay">
                    <div className="popup-content error-popup">
                        <p>{popupMessage}</p>
                        <button onClick={handleCloseErrorPopup} className="button">Cerrar</button>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content success-popup">
                        <p>{popupMessage}</p>
                        <button onClick={handleCloseSuccessPopup} className="button">Cerrar</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label">Concepto</label>
                    <input
                        type="text"
                        value={concepto}
                        onChange={(e) => setConcepto(e.target.value)}
                        className="input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="label">Descripción</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="textarea"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="label">Valor</label>
                    <input
                        type="number"
                        value={valor}
                        onChange={(e) => setValor(parseFloat(e.target.value))}
                        className="input"
                        min="0.01"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="label">Estado de Factura</label>
                    <p className="static-field status-display status-factura">
                        {currentFactura.estadoFactura || 'Desconocido'}
                    </p>
                </div>

                <div className="form-group">
                    <label className="label">Fecha de Emisión</label>
                    <p className="static-field">
                        {currentFactura.fecha ? new Date(currentFactura.fecha).toLocaleString() : 'N/A'}
                    </p>
                </div>

                <div className="form-group">
                    <label className="label">Saldo Pendiente</label>
                    <p className="static-field saldo-pendiente-display">
                        ${currentFactura.saldoPendiente?.toFixed(2) || '0.00'}
                    </p>
                </div>

                <div className="form-group">
                    <label className="label">Abonos</label>
                    {abonos.length > 0 ? (
                        <ul className="abonos-list">
                            {abonos.map((abono, idx) => (
                                <li key={idx}>
                                    ${abono.monto?.toFixed(2)} -{' '}
                                    {new Date(abono.fecha).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="static-field info-message">El/Los cliente/s no han hecho ningún abono.</p>
                    )}
                </div>

                <button type="submit" className="button">
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
};

export default UpdateReceipt;