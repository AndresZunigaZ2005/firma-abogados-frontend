import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../loading/LoadingSpinner';
import './ReceiptClientView.css';

const ReceiptClientView = ({ initialFactura }) => { // Changed prop name to initialFactura
  const { state } = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [abonos, setAbonos] = useState([]);
  const [montoAbono, setMontoAbono] = useState('');
  const [currentFactura, setCurrentFactura] = useState(null);

  // Pop-up states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    let facturaData = initialFactura; // Use initialFactura prop first

    if (!facturaData && state?.factura) {
      facturaData = state.factura;
    }

    if (facturaData) {
      setCurrentFactura(facturaData);
    } else {
      setPopupMessage('No se ha proporcionado una factura válida.');
      setPopupType('error');
      setShowPopup(true);
      setIsLoading(false);
      // Optional: If no factura, you might want to redirect
      // navigate('/some-fallback-route');
    }
  }, [initialFactura, state, navigate]); // Depend on initialFactura

  useEffect(() => {
    // Only fetch abonos if currentFactura is available and not 'PAGADA'
    if (currentFactura && currentFactura.idFactura && currentFactura.estadoFactura !== 'PAGADA') {
      fetchAbonos(currentFactura.idFactura);
    } else if (currentFactura && currentFactura.estadoFactura === 'PAGADA') {
      setAbonos([]); // Clear abonos if factura is paid
    }
  }, [currentFactura]);

  const fetchAbonos = async (idFactura) => {
    setIsLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No hay token de autenticación.');

      const response = await fetch(`${process.env.REACT_APP_LISTAR_ABONOS}/${idFactura}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAbonos([]); // No abonos yet, which is fine
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al listar los abonos.');
      }

      const data = await response.json();
      setAbonos(data.respuesta || []);
    } catch (err) {
      console.error('Error fetching abonos:', err);
      setPopupMessage(err.message);
      setPopupType('error');
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMontoAbonoChange = (e) => {
    const value = e.target.value;
    // Allow empty string to clear the input, otherwise validate
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMontoAbono(value);
    }
  };

  const handleAgregarAbono = async () => {
    setShowPopup(false); // Close any existing pop-up
    setPopupMessage(''); // Clear previous message
  
    // --- Client-Side Validations ---
    if (!montoAbono || parseFloat(montoAbono) <= 0) {
      setPopupMessage('Por favor, ingrese un monto de abono válido mayor que cero.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }
    if (parseFloat(montoAbono) > currentFactura.saldoPendiente) {
      setPopupMessage('El monto del abono no puede ser mayor que el saldo pendiente.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }
    // Check for too many decimal places
    const parts = montoAbono.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      setPopupMessage('Por favor, ingrese un monto con no más de dos decimales.');
      setPopupType('error');
      setShowPopup(true);
      return;
    }
    // --- End Client-Side Validations ---
  
    setIsLoading(true); // Indicate loading state
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión de nuevo.');
      }
  
      // 1. Add Abono (POST request)
      const addAbonoResponse = await fetch(process.env.REACT_APP_AGREGAR_ABONO, {
        method: 'POST', // Correct: POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          monto: parseFloat(montoAbono),
          idFactura: currentFactura.idFactura
        })
      });
  
      if (!addAbonoResponse.ok) {
        const errorData = await addAbonoResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al agregar el abono. Por favor, intente de nuevo más tarde.');
      }
  
      const abonoData = await addAbonoResponse.json();
      // Assuming MensajeDTO<String> for agregarAbono and it returns the idAbono in 'respuesta'
      const idAbono = abonoData.respuesta;
  
      if (!idAbono) {
        throw new Error('No se recibió el ID del abono para realizar el pago. Por favor, contacte a soporte.');
      }
      console.log(idAbono);
      // 2. Realizar Pago (POST request, even though it processes a payment, your backend defined it as POST)
      const realizarPagoResponse = await fetch(`${process.env.REACT_APP_REALIZAR_PAGO}/${idAbono}`, {
        method: 'POST', // Correct: POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
        // No body needed for POST if idAbono is in path and server handles payment logic
        // If your backend POST expects a body, you would add it here.
        // Based on your Spring Boot `@PathVariable("idAbono")String idAbono`, no body is expected.
      });
  
      if (!realizarPagoResponse.ok) {
        const errorData = await realizarPagoResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al iniciar el pago para el abono ${idAbono}. Por favor, verifique el estado del abono o intente de nuevo.`);
      }
  
      const pagoResponseData = await realizarPagoResponse.json();
      // Based on your Spring Boot MensajeDTO<Preference>, the actual preference object will be in .respuesta
      const preference = pagoResponseData.respuesta;
  
      if (preference && preference.id && preference.init_point) {
        setPopupMessage('Abono agregado y pago iniciado correctamente. Se le redirigirá para completar el pago.');
        setPopupType('success');
        setShowPopup(true);
        setMontoAbono(''); // Clear the input field
  
        // Redirect to Mercado Pago checkout URL
        window.location.href = preference.init_point;
  
        // Re-fetch the entire factura to update its saldoPendiente and estadoFactura
        // This will happen after redirection, or if the user returns to the app.
        await fetchUpdatedFactura(currentFactura.idFactura);
      } else {
        throw new Error('No se pudo obtener la URL de pago de Mercado Pago. Intente de nuevo.');
      }
  
    } catch (err) {
      setPopupMessage(err.message || 'Ocurrió un error inesperado. Por favor, intente de nuevo.');
      setPopupType('error');
      setShowPopup(true);
      console.error('Error adding abono or processing payment:', err);
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  const fetchUpdatedFactura = async (idFactura) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_GET_FACTURA_BY_ID}/${idFactura}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      if (response.ok) {
        const updatedFacturaData = await response.json();
        setCurrentFactura(updatedFacturaData.respuesta || updatedFacturaData);
        // If factura becomes PAGADA, clear abonos to ensure UI consistency
        if ((updatedFacturaData.respuesta || updatedFacturaData).estadoFactura === 'PAGADA') {
          setAbonos([]);
        } else {
          // If it's not PAGADA, re-fetch abonos after a successful update
          fetchAbonos(idFactura);
        }
      } else {
        console.warn('Could not re-fetch updated factura details. Status:', response.status);
      }
    } catch (error) {
      console.error('Error re-fetching factura:', error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
    setPopupType('');
  };

  if (!currentFactura) {
    return (
      <div className="factura-details-container">
        {isLoading && <LoadingSpinner fullPage />}
        {showPopup && (
          <div className={`popup-overlay ${showPopup ? 'show' : ''}`}>
            <div className={`popup-content ${popupType}-popup`}>
              <p>{popupMessage}</p>
              <button onClick={handleClosePopup} className="button">Cerrar</button>
            </div>
          </div>
        )}
        {!showPopup && !isLoading && (
          <p>Cargando detalles de la factura...</p>
        )}
      </div>
    );
  }

  return (
    <div className="factura-details-container">
      {isLoading && <LoadingSpinner fullPage />}

      {showPopup && (
        <div className={`popup-overlay ${showPopup ? 'show' : ''}`}>
          <div className={`popup-content ${popupType}-popup`}>
            <p>{popupMessage}</p>
            <button onClick={handleClosePopup} className="button">Cerrar</button>
          </div>
        </div>
      )}

      <div className="factura-details-header">
        <h1>Detalles de la Factura</h1>
      </div>

      <div className="factura-card">
        <div className="form-group">
          <p className="label">Concepto:</p>
          <p className="static-field">{currentFactura.concepto}</p>
        </div>

        <div className="form-group">
          <p className="label">Descripción:</p>
          <p className="static-field">{currentFactura.descripcion}</p>
        </div>

        <div className="form-group">
          <p className="label">Estado:</p>
          <p className={`static-field status-${currentFactura.estadoFactura?.toLowerCase() || 'desconocido'}`}>{currentFactura.estadoFactura}</p>
        </div>

        <div className="form-group">
          <p className="label">Valor Total:</p>
          <p className="static-field">${currentFactura.valor?.toFixed(2)}</p>
        </div>

        <div className="form-group">
          <p className="label">Fecha de Emisión:</p>
          <p className="static-field">{new Date(currentFactura.fecha).toLocaleString()}</p>
        </div>

        <div className="form-group">
          <p className="label">Saldo Pendiente:</p>
          <p className="static-field saldo-pendiente-display">${currentFactura.saldoPendiente?.toFixed(2)}</p>
        </div>

        {/* Conditionally render abonos section based on factura status */}
        {currentFactura.estadoFactura !== 'PAGADA' && (
          <>
            <div className="abonos-section form-group">
              <p className="label">Abonos Realizados:</p>
              {abonos.length > 0 ? (
                <ul className="abonos-list">
                  {abonos.map((abono, index) => (
                    <li key={index}>
                      ${abono.monto?.toFixed(2)} - {new Date(abono.fecha).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="static-field info-message">No hay abonos registrados para esta factura.</p>
              )}
            </div>

            <div className="add-abono-section form-group">
              <p className="label">Registrar Nuevo Abono:</p>
              <input
                type="text"
                value={montoAbono}
                onChange={handleMontoAbonoChange}
                placeholder="Monto del abono"
                className="input"
                disabled={isLoading}
              />
              <button
                onClick={handleAgregarAbono}
                className="button"
                disabled={isLoading || !montoAbono.trim() || parseFloat(montoAbono) <= 0 || parseFloat(montoAbono) > currentFactura.saldoPendiente}
              >
                {isLoading ? 'Procesando...' : 'Agregar Abono y Pagar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptClientView;