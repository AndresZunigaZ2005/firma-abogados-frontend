import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../loading/LoadingSpinner';
import './ReceiptClientView.css';

const ReceiptClientView = ({ initialFactura }) => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [abonos, setAbonos] = useState([]);
  const [montoAbono, setMontoAbono] = useState('');
  const [currentFactura, setCurrentFactura] = useState(null);

  useEffect(() => {
    let facturaData = initialFactura;

    if (!facturaData && state?.factura) {
      facturaData = state.factura;
    }

    if (facturaData) {
      setCurrentFactura(facturaData);
    } else {
      alert('No se ha proporcionado una factura válida.'); // Changed to alert
      setIsLoading(false);
      // Optional: If no factura, you might want to redirect
      // navigate('/some-fallback-route');
    }
  }, [initialFactura, state, navigate]);

  useEffect(() => {
    if (currentFactura && currentFactura.idFactura && currentFactura.estadoFactura !== 'PAGADA') {
      fetchAbonos(currentFactura.idFactura);
    } else if (currentFactura && currentFactura.estadoFactura === 'PAGADA') {
      setAbonos([]);
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
          setAbonos([]);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al listar los abonos.');
      }

      const data = await response.json();
      setAbonos(data.respuesta || []);
    } catch (err) {
      console.error('Error fetching abonos:', err);
      alert(err.message); // Changed to alert
    } finally {
      setIsLoading(false);
    }
  };

  const handleMontoAbonoChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMontoAbono(value);
    }
  };

  const handleAgregarAbono = async () => {
    // --- Client-Side Validations ---
    if (!montoAbono || parseFloat(montoAbono) <= 0) {
      alert('Por favor, ingrese un monto de abono válido mayor que cero.'); // Changed to alert
      return;
    }
    if (parseFloat(montoAbono) > currentFactura.saldoPendiente) {
      alert('El monto del abono no puede ser mayor que el saldo pendiente.'); // Changed to alert
      return;
    }
    const parts = montoAbono.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      alert('Por favor, ingrese un monto con no más de dos decimales.'); // Changed to alert
      return;
    }
    // --- End Client-Side Validations ---

    setIsLoading(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión de nuevo.');
      }

      // 1. Add Abono (POST request)
      const addAbonoResponse = await fetch(process.env.REACT_APP_AGREGAR_ABONO, {
        method: 'POST',
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
      const idAbono = abonoData.respuesta;

      if (!idAbono) {
        throw new Error('No se recibió el ID del abono para realizar el pago. Por favor, contacte a soporte.');
      }
      console.log(idAbono);

      // 2. Realizar Pago (POST request)
      const realizarPagoResponse = await fetch(`${process.env.REACT_APP_REALIZAR_PAGO}/${idAbono}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!realizarPagoResponse.ok) {
        const errorData = await realizarPagoResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al iniciar el pago para el abono ${idAbono}. Por favor, verifique el estado del abono o intente de nuevo.`);
      }

      const pagoResponseData = await realizarPagoResponse.json();
      console.log('Respuesta de realizar pago:', pagoResponseData);
      const preference = pagoResponseData.respuesta;
      console.log('Preference:', preference);

      if (preference && preference.id && preference.initPoint) {
        alert('Abono agregado y pago iniciado correctamente. Se le redirigirá para completar el pago.'); // Changed to alert
        setMontoAbono('');

        window.location.href = preference.initPoint;

        await fetchUpdatedFactura(currentFactura.idFactura);
      } else {
        throw new Error('No se pudo obtener la URL de pago de Mercado Pago. Intente de nuevo.');
      }

    } catch (err) {
      alert(err.message || 'Ocurrió un error inesperado. Por favor, intente de nuevo.'); // Changed to alert
      console.error('Error adding abono or processing payment:', err);
    } finally {
      setIsLoading(false);
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
        if ((updatedFacturaData.respuesta || updatedFacturaData).estadoFactura === 'PAGADA') {
          setAbonos([]);
        } else {
          fetchAbonos(idFactura);
        }
      } else {
        console.warn('Could not re-fetch updated factura details. Status:', response.status);
      }
    } catch (error) {
      console.error('Error re-fetching factura:', error);
    }
  };

  if (!currentFactura) {
    return (
      <div className="factura-details-container">
        {isLoading && <LoadingSpinner fullPage />}
        {/* No custom popup JSX here */}
        {!isLoading && (
          <p>Cargando detalles de la factura...</p>
        )}
      </div>
    );
  }

  return (
    <div className="factura-details-container">
      {isLoading && <LoadingSpinner fullPage />}

      {/* No custom popup JSX here */}

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