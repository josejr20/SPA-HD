import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { getUserOrders } from '../../api/ordersApi';
import { getUserIdFromToken, getUserFromToken } from '../../api/authApi';
import apiClient from '../../api/axiosConfig';
import { getToken } from '../../api/authApi';
import { toast } from 'react-toastify';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [hoverStars, setHoverStars] = useState(0);
  const userId = getUserIdFromToken();
  const currentUser = getUserFromToken();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserOrders(userId);
      setOrders(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      toast.error('No se pudieron cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

  // ✅ Calcular columnas del grid dinámicamente
  const getGridColumns = () => {
    const count = filteredOrders.length;
    if (count === 1) return '1fr';
    if (count === 2) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(350px, 1fr))'; // Máximo 3 columnas
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleRequestCancellation = (order) => {
    const phoneNumber = '51987654321'; // ⚠️ CAMBIAR
    
    const message = `Hola, soy ${currentUser?.username || 'cliente'}. 
    
Deseo solicitar la cancelación de mi reserva:

📋 *Número de Orden:* ${order.orderNumber}
📅 *Fecha de Cita:* ${order.appointmentDateFormatted}
🕐 *Hora:* ${order.appointmentTimeFormatted}
💆 *Servicio:* ${order.services && order.services.length > 0 ? order.services[0].name : 'N/A'}
💰 *Monto:* ${order.payment ? formatCurrency(order.payment.amount) : 'N/A'}

*Motivo de cancelación:* 
[Por favor escribe aquí tu motivo]

Quedo atento a su confirmación. Gracias.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleRequestInvoice = (order) => {
    const phoneNumber = '51987654321'; // ⚠️ CAMBIAR
    
    const message = `Hola, soy ${currentUser?.username || 'cliente'}.

Necesito consultar sobre mi comprobante de pago:

📋 *Número de Orden:* ${order.orderNumber}
📧 *Email registrado:* ${currentUser?.email || 'No disponible'}
💳 *Comprobante:* ${order.payment?.invoiceType} - ${order.payment?.invoiceNumber}

¿Podrían reenviar el comprobante a mi correo?

Gracias.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // ✅ ABRIR MODAL DE CALIFICACIÓN
  const handleOpenRating = (order) => {
    setSelectedOrder(order);
    setRatingStars(0);
    setRatingComment('');
    setShowRatingModal(true);
  };

  // ✅ ENVIAR CALIFICACIÓN
  const handleSubmitRating = async () => {
    if (ratingStars === 0) {
      toast.warning('Por favor selecciona al menos 1 estrella');
      return;
    }

    try {
      const token = getToken();
      await apiClient.post('/ratings', {
        appointmentId: selectedOrder.orderId,
        stars: ratingStars,
        comment: ratingComment,
        userId: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('¡Gracias por tu calificación!');
      setShowRatingModal(false);
      fetchOrders(); // Recargar para actualizar
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al enviar calificación');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tus pedidos...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="my-orders-container">
        <div className="my-orders-header">
          <h1>📋 Mis Reservas</h1>
          <p>Historial completo de tus servicios reservados</p>
        </div>

        <div className="orders-filters">
          <div className="filter-buttons">
            <button 
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              Todas ({orders.length})
            </button>
            <button 
              className={filterStatus === 'pending' ? 'active' : ''}
              onClick={() => setFilterStatus('pending')}
            >
              Pendientes ({orders.filter(o => o.status === 'PENDING').length})
            </button>
            <button 
              className={filterStatus === 'confirmed' ? 'active' : ''}
              onClick={() => setFilterStatus('confirmed')}
            >
              Confirmadas ({orders.filter(o => o.status === 'CONFIRMED').length})
            </button>
            <button 
              className={filterStatus === 'completed' ? 'active' : ''}
              onClick={() => setFilterStatus('completed')}
            >
              Completadas ({orders.filter(o => o.status === 'COMPLETED').length})
            </button>
          </div>
        </div>

        {/* ✅ GRID DINÁMICO */}
        <div 
          className="orders-list"
          style={{ 
            display: 'grid',
            gridTemplateColumns: getGridColumns(),
            gap: '20px'
          }}
        >
          {filteredOrders.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon">📭</div>
              <h3>No tienes pedidos en esta categoría</h3>
              <p>Cuando reserves un servicio, aparecerá aquí</p>
              <a href="/servicios/masajes" className="btn-cta">Explorar servicios</a>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.orderId} className="order-card-compact">
                <div className="compact-header">
                  <div className="order-id-badge">
                    <span className="order-number">🎫 {order.orderNumber}</span>
                    <span className={`status-badge-small ${getStatusBadgeClass(order.status)}`}>
                      {order.statusLabel}
                    </span>
                  </div>
                  <span className="order-date-small">{order.createdAtFormatted}</span>
                </div>

                <div className="compact-body">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="icon">📅</span>
                      <div className="info-text">
                        <span className="label">Fecha y Hora</span>
                        <span className="value">{order.appointmentTimeFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="icon">💆</span>
                      <div className="info-text">
                        <span className="label">Servicio</span>
                        <span className="value">
                          {order.services && order.services.length > 0 
                            ? order.services[0].name 
                            : 'No especificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="icon">💰</span>
                      <div className="info-text">
                        <span className="label">Monto Total</span>
                        <span className="value price">
                          {order.payment ? formatCurrency(order.payment.amount) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="compact-footer">
                  <button 
                    className="btn-view-details"
                    onClick={() => handleViewDetails(order)}
                  >
                    Ver Detalles Completos
                  </button>
                  
                  {/* ✅ BOTÓN DE CALIFICAR (solo si está completado) */}
                  {order.status === 'COMPLETED' && (
                    <button 
                      className="btn-rate-service"
                      onClick={() => handleOpenRating(order)}
                    >
                      ⭐ Calificar Servicio
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL DE DETALLES */}
        {showModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalles del Pedido</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <div className="detail-header-info">
                    <span className="detail-order-number">🎫 {selectedOrder.orderNumber}</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                      {selectedOrder.statusLabel}
                    </span>
                  </div>
                  <span className="detail-created-date">{selectedOrder.createdAtFormatted}</span>
                </div>

                <div className="detail-section">
                  <h4>📅 Fecha y Hora de la Cita</h4>
                  <div className="detail-box">
                    <p className="detail-date">{selectedOrder.appointmentDateFormatted}</p>
                    <p className="detail-time">{selectedOrder.appointmentTimeFormatted}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>💆 Servicios Contratados</h4>
                  <div className="detail-box">
                    {selectedOrder.services && selectedOrder.services.length > 0 ? (
                      selectedOrder.services.map((service, idx) => (
                        <div key={idx} className="service-detail-item">
                          <div className="service-detail-info">
                            <span className="service-detail-name">{service.name}</span>
                            <span className="service-detail-duration">{service.duration} min</span>
                          </div>
                          <span className="service-detail-price">{formatCurrency(service.price)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">Servicio no especificado</p>
                    )}
                  </div>
                </div>

                {selectedOrder.worker && (
                  <div className="detail-section">
                    <h4>👨‍⚕️ Especialista Asignado</h4>
                    <div className="detail-box worker-box">
                      <div className="worker-avatar-detail">
                        {selectedOrder.worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="worker-detail-info">
                        <p className="worker-detail-name">{selectedOrder.worker.name}</p>
                        <p className="worker-detail-specialty">{selectedOrder.worker.specialty}</p>
                        {selectedOrder.worker.experienceYears && (
                          <p className="worker-detail-experience">
                            {selectedOrder.worker.experienceYears} años de experiencia
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.payment && (
                  <div className="detail-section">
                    <h4>💳 Información de Pago</h4>
                    <div className="detail-box payment-box">
                      <div className="payment-detail-row">
                        <span className="payment-detail-label">Monto Total:</span>
                        <span className="payment-detail-value total">
                          {formatCurrency(selectedOrder.payment.amount)}
                        </span>
                      </div>
                      <div className="payment-detail-row">
                        <span className="payment-detail-label">Método de Pago:</span>
                        <span className="payment-detail-value">{selectedOrder.payment.methodLabel}</span>
                      </div>
                      <div className="payment-detail-row">
                        <span className="payment-detail-label">Comprobante:</span>
                        <span className="payment-detail-value">
                          {selectedOrder.payment.invoiceType} - {selectedOrder.payment.invoiceNumber}
                        </span>
                      </div>
                      <div className="payment-detail-row">
                        <span className="payment-detail-label">Estado del Pago:</span>
                        <span className={`payment-status ${selectedOrder.payment.status?.toLowerCase()}`}>
                          {selectedOrder.payment.statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="info-note">
                  <div className="info-note-icon">📧</div>
                  <div className="info-note-text">
                    <strong>Tu comprobante fue enviado automáticamente</strong>
                    <p>Revisa tu correo: <strong>{currentUser?.email}</strong></p>
                    <p className="info-note-small">Si no lo encuentras, revisa tu carpeta de spam o solicita reenvío por WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-modal-whatsapp-invoice"
                  onClick={() => handleRequestInvoice(selectedOrder)}
                >
                  <span className="whatsapp-icon">📄</span>
                  Solicitar Comprobante
                </button>

                {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
                  <button 
                    className="btn-modal-whatsapp-cancel"
                    onClick={() => handleRequestCancellation(selectedOrder)}
                  >
                    <span className="whatsapp-icon">❌</span>
                    Solicitar Cancelación
                  </button>
                )}

                <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODAL DE CALIFICACIÓN */}
        {showRatingModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
            <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>⭐ Califica tu Experiencia</h2>
                <button className="modal-close" onClick={() => setShowRatingModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                <div className="rating-service-info">
                  <p><strong>Servicio:</strong> {selectedOrder.services?.[0]?.name}</p>
                  <p><strong>Especialista:</strong> {selectedOrder.worker?.name}</p>
                </div>

                <div className="stars-container">
                  <p className="stars-label">¿Cómo calificarías el servicio?</p>
                  <div className="stars-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= (hoverStars || ratingStars) ? 'active' : ''}`}
                        onClick={() => setRatingStars(star)}
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(0)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="stars-text">
                    {ratingStars === 0 && 'Selecciona tu calificación'}
                    {ratingStars === 1 && '😞 Muy malo'}
                    {ratingStars === 2 && '😐 Malo'}
                    {ratingStars === 3 && '😊 Regular'}
                    {ratingStars === 4 && '😄 Bueno'}
                    {ratingStars === 5 && '🤩 Excelente'}
                  </p>
                </div>

                <div className="comment-container">
                  <label>Cuéntanos más sobre tu experiencia (opcional)</label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
                    maxLength={500}
                    rows={4}
                  />
                  <small>{ratingComment.length}/500 caracteres</small>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-submit-rating" onClick={handleSubmitRating}>
                  Enviar Calificación
                </button>
                <button className="btn-modal-close" onClick={() => setShowRatingModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyOrders;