import React, { useState, useEffect } from 'react';
import { SectionHeader } from './ui/Card';
import { Modal } from './ui/Modal';
import { FormInput, FormSelect, FormRow } from './ui/Form';
import {
  getAllAppointments,
  getAllServices,
  getAllClients,
  getAllWorkers,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  enviarExcelReservas,
  descargarExcelReservas
} from './JS/reservaService';

const Reservas = ({ onReservationCreated }) => {
  const tableHeaders = ["Cliente", "Servicio", "Fecha", "Hora", "Estado", "Acciones"];

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: null,
    clienteId: null,
    workerId: null,
    servicioId: null,
    fecha: '',
    hora: '',
    estado: 'PENDING'
  });
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointments, services, clients, workers] = await Promise.all([
        getAllAppointments(),
        getAllServices(),
        getAllClients(),
        getAllWorkers()
      ]);

      console.log("getAllAppointments devolvió:", appointments);

      setReservas(Array.isArray(appointments) ? appointments : []);
      setServicios(Array.isArray(services) ? services : []);
      setClientes(Array.isArray(clients) ? clients : []);
      setTrabajadores(Array.isArray(workers) ? workers : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setReservas([]);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!form.clienteId || !form.servicioId || !form.fecha || !form.hora || !form.workerId) {
        alert("Completa todos los campos obligatorios.");
        return;
      }

      const appointmentStart = `${form.fecha}T${form.hora}:00`;

      const appointmentData = {
        userId: form.clienteId,
        workerId: form.workerId,
        serviceId: form.servicioId,
        appointmentStart: appointmentStart,
        status: form.estado,
      };

      console.log('Datos enviados a la API:', appointmentData);

      if (form.id) {
        await updateAppointment(form.id, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }

      await fetchData();

      if (onReservationCreated) {
        console.log("Notificando al dashboard de la nueva reserva...");
        onReservationCreated();
      }

      setShowModal(false);
      setForm({
        id: null,
        clienteId: null,
        workerId: null,
        servicioId: null,
        fecha: '',
        hora: '',
        estado: 'PENDING'
      });

      alert('✅ Reserva guardada exitosamente');

    } catch (error) {
      console.error('Error guardando la reserva:', error.response?.data || error);
      alert('❌ Error guardando la reserva. Revisa la consola.');
    }
  };

  const handleEdit = (reserva) => {
    const appointmentStart = reserva.appointmentStart || '';
    const [fecha, horaCompleta] = appointmentStart.split('T');
    const hora = horaCompleta ? horaCompleta.substring(0, 5) : '';
    setForm({
      id: reserva.id,
      clienteId: reserva.user?.id || null,
      workerId: reserva.worker?.id || null,
      servicioId: reserva.service?.id || null,
      fecha: fecha || '',
      hora: hora || '',
      estado: reserva.status || 'PENDING'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reserva?")) return;
    try {
      await deleteAppointment(id);
      await fetchData();

      if (onReservationCreated) {
        onReservationCreated();
      }

      alert('✅ Reserva eliminada');
    } catch (error) {
      console.error('Error eliminando la reserva:', error);
      alert('❌ No se pudo eliminar la reserva.');
    }
  };

  // ✅ NUEVA FUNCIÓN: Cambiar estado rápidamente
  const handleQuickStatusChange = async (reservaId, newStatus) => {
    try {
      await updateAppointment(reservaId, { status: newStatus });
      await fetchData();

      if (onReservationCreated) {
        onReservationCreated();
      }

      const statusLabels = {
        CONFIRMED: 'confirmada',
        COMPLETED: 'completada',
        CANCELLED: 'cancelada'
      };

      alert(`✅ Reserva ${statusLabels[newStatus] || 'actualizada'}`);
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('❌ Error al actualizar el estado');
    }
  };

  // ✅ Filtrar reservas
  const filteredReservas = filterStatus === 'all' 
    ? reservas 
    : reservas.filter(r => r.status === filterStatus);

  // ✅ Función para obtener la clase CSS del estado
  const getStatusClass = (status) => {
    const classes = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return classes[status] || 'status-pending';
  };

  // ✅ Función para obtener el label del estado
  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada'
    };
    return labels[status] || status;
  };

  return (
    <div className="reservas">
      <SectionHeader 
        title="Gestión de Reservas" 
        buttonText="Nueva Reserva" 
        onButtonClick={() => setShowModal(true)} 
      />
      
      <div className="reservas-actions-bar">
        <button className="btn-excel-download" onClick={descargarExcelReservas}>
          ⬇ Descargar Excel
        </button>
        <button className="btn-excel-send" onClick={enviarExcelReservas}>
          📊 Enviar Reporte
        </button>
      </div>

      {/* ✅ FILTROS DE ESTADO */}
      <div className="reservas-filters">
        <button 
          className={filterStatus === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilterStatus('all')}
        >
          Todas ({reservas.length})
        </button>
        <button 
          className={filterStatus === 'PENDING' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilterStatus('PENDING')}
        >
          Pendientes ({reservas.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
          className={filterStatus === 'CONFIRMED' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilterStatus('CONFIRMED')}
        >
          Confirmadas ({reservas.filter(r => r.status === 'CONFIRMED').length})
        </button>
        <button 
          className={filterStatus === 'COMPLETED' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilterStatus('COMPLETED')}
        >
          Completadas ({reservas.filter(r => r.status === 'COMPLETED').length})
        </button>
        <button 
          className={filterStatus === 'CANCELLED' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilterStatus('CANCELLED')}
        >
          Canceladas ({reservas.filter(r => r.status === 'CANCELLED').length})
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReservas.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '40px' }}>
                  📭 No hay reservas en esta categoría
                </td>
              </tr>
            ) : (
              filteredReservas.map(reserva => {
                const fecha = reserva.appointmentStart ? new Date(reserva.appointmentStart) : null;
                return (
                  <tr key={reserva.id}>
                    <td>{reserva.user?.username || "Sin cliente"}</td>
                    <td>{reserva.service?.name || "Sin servicio"}</td>
                    <td>{fecha ? fecha.toLocaleDateString('es-PE') : "Sin fecha"}</td>
                    <td>{fecha ? fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</td>
                    <td>
                      <span className={getStatusClass(reserva.status)}>
                        {getStatusLabel(reserva.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        {/* Botones según el estado */}
                        {reserva.status === 'PENDING' && (
                          <>
                            <button 
                              className="btn-quick-confirm"
                              onClick={() => handleQuickStatusChange(reserva.id, 'CONFIRMED')}
                              title="Confirmar reserva"
                            >
                              ✅
                            </button>
                            <button 
                              className="btn-quick-cancel"
                              onClick={() => handleQuickStatusChange(reserva.id, 'CANCELLED')}
                              title="Cancelar reserva"
                            >
                              ❌
                            </button>
                          </>
                        )}

                        {reserva.status === 'CONFIRMED' && (
                          <>
                            <button 
                              className="btn-quick-complete"
                              onClick={() => handleQuickStatusChange(reserva.id, 'COMPLETED')}
                              title="Marcar como completada"
                            >
                              ✔️
                            </button>
                            <button 
                              className="btn-quick-cancel"
                              onClick={() => handleQuickStatusChange(reserva.id, 'CANCELLED')}
                              title="Cancelar reserva"
                            >
                              ❌
                            </button>
                          </>
                        )}

                        {/* Botones siempre disponibles */}
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEdit(reserva)}
                          title="Editar reserva"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(reserva.id)}
                          title="Eliminar reserva"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={form.id ? "✏ Editar Reserva" : "➕ Nueva Reserva"}
        onSave={handleSave}
        saveButtonText="💾 Guardar Reserva"
      >
        <div className="reserva-form">
          <FormRow>
            <FormSelect
              label="Cliente"
              value={form.clienteId || ''}
              onChange={e => handleInputChange('clienteId', parseInt(e.target.value))}
              options={clientes.map(c => ({ value: c.id, label: c.username }))}
              defaultOption="Seleccionar cliente"
              required
            />
            <FormSelect
              label="Servicio"
              value={form.servicioId || ''}
              onChange={e => handleInputChange('servicioId', parseInt(e.target.value))}
              options={servicios.map(s => ({ value: s.id, label: s.name }))}
              defaultOption="Seleccionar servicio"
              required
            />
            <FormSelect
              label="Trabajador"
              value={form.workerId || ''}
              onChange={e => handleInputChange('workerId', parseInt(e.target.value))}
              options={trabajadores.map(t => ({ value: t.id, label: t.username }))}
              defaultOption="Seleccionar trabajador"
              required
            />
          </FormRow>
          <FormRow>
            <FormInput
              type="date"
              label="Fecha"
              value={form.fecha}
              onChange={e => handleInputChange('fecha', e.target.value)}
              required
            />
            <FormInput
              type="time"
              label="Hora"
              value={form.hora}
              onChange={e => handleInputChange('hora', e.target.value)}
              required
            />
          </FormRow>
          <FormSelect
            label="Estado"
            value={form.estado}
            onChange={e => handleInputChange('estado', e.target.value)}
            options={[
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'CONFIRMED', label: 'Confirmada' },
              { value: 'COMPLETED', label: 'Completada' },
              { value: 'CANCELLED', label: 'Cancelada' }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Reservas;