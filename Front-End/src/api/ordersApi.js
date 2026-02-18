import apiClient from "./axiosConfig";
import { getToken } from "./authApi";

// Obtener todos los pedidos del usuario
export const getUserOrders = async (userId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const response = await apiClient.get(`/api/my-orders?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    throw error;
  }
};

// Cancelar pedido
export const cancelOrder = async (appointmentId, userId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const response = await apiClient.put(
      `/appointments/${appointmentId}/status?status=CANCELLED`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error cancelando pedido:", error);
    throw error;
  }
};

// Descargar comprobante (genera y descarga PDF)
export const downloadInvoice = async (paymentId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const response = await apiClient.get(
      `/payments/${paymentId}/invoice/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Importante para archivos
      }
    );
    
    // Crear descarga automática
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `comprobante_${paymentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error descargando comprobante:", error);
    throw error;
  }
};