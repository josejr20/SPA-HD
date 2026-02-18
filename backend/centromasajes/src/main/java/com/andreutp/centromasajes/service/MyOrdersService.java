package com.andreutp.centromasajes.service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.andreutp.centromasajes.dao.IAppointmentRepository;
import com.andreutp.centromasajes.dao.IPaymentRepository;
import com.andreutp.centromasajes.dto.MyOrderDTO;
import com.andreutp.centromasajes.dto.MyOrderDTO.PaymentDetailDTO;
import com.andreutp.centromasajes.dto.MyOrderDTO.ServiceDetailDTO;
import com.andreutp.centromasajes.dto.MyOrderDTO.WorkerDetailDTO;
import com.andreutp.centromasajes.model.AppointmentModel;
import com.andreutp.centromasajes.model.PaymentModel;
import com.andreutp.centromasajes.model.ServiceModel;
import com.andreutp.centromasajes.model.UserModel;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyOrdersService {

    private final IAppointmentRepository appointmentRepository;
    private final IPaymentRepository paymentRepository;

    // Formateadores de fecha
    private static final DateTimeFormatter DATE_FORMATTER = 
        DateTimeFormatter.ofPattern("EEEE, dd 'de' MMMM yyyy", Locale.of("es", "ES"));
    private static final DateTimeFormatter TIME_FORMATTER = 
        DateTimeFormatter.ofPattern("hh:mm a", Locale.of("es", "ES"));
    private static final DateTimeFormatter DATETIME_FORMATTER = 
        DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.of("es", "ES"));

    /**
     * Obtiene todos los pedidos del usuario ordenados por fecha descendente
     */
    public List<MyOrderDTO> getMyOrders(Long userId) {
        List<AppointmentModel> appointments = appointmentRepository
                .findByUserIdOrderByAppointmentStartDesc(userId);

        return appointments.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene pedidos filtrados por estado
     */
    public List<MyOrderDTO> getMyOrdersByStatus(Long userId, String status) {
        List<AppointmentModel> appointments = appointmentRepository
                .findByUserIdOrderByAppointmentStartDesc(userId);

        return appointments.stream()
                .filter(apt -> apt.getStatus().name().equalsIgnoreCase(status))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un pedido específico
     */
    public MyOrderDTO getOrderById(Long appointmentId, Long userId) {
        AppointmentModel appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!appointment.getUser().getId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para ver este pedido");
        }

        return mapToDTO(appointment);
    }

    /**
     * Mapea AppointmentModel a MyOrderDTO con toda la información formateada
     */
    private MyOrderDTO mapToDTO(AppointmentModel appointment) {
        MyOrderDTO dto = new MyOrderDTO();

        // IDs y números de orden
        dto.setOrderId(appointment.getId());
        dto.setOrderNumber(generateOrderNumber(appointment.getId()));

        // Fechas y horarios
        dto.setAppointmentStart(appointment.getAppointmentStart());
        dto.setAppointmentEnd(appointment.getAppointmentEnd());
        dto.setCreatedAt(appointment.getCreatedAt());
        
        // Formatear fechas
        if (appointment.getAppointmentStart() != null) {
            dto.setAppointmentDateFormatted(
                appointment.getAppointmentStart().format(DATE_FORMATTER)
            );
            dto.setAppointmentTimeFormatted(
                appointment.getAppointmentStart().format(TIME_FORMATTER) + 
                " - " + 
                appointment.getAppointmentEnd().format(TIME_FORMATTER)
            );
        }
        
        if (appointment.getCreatedAt() != null) {
            dto.setCreatedAtFormatted(
                appointment.getCreatedAt().format(DATETIME_FORMATTER)
            );
        }

        // Estado
        dto.setStatus(appointment.getStatus().name());
        dto.setStatusLabel(translateStatus(appointment.getStatus().name()));

        // Servicios (actualmente uno, pero preparado para múltiples)
        List<ServiceDetailDTO> services = new ArrayList<>();
        if (appointment.getService() != null) {
            services.add(mapServiceToDTO(appointment.getService()));
        }
        dto.setServices(services);

        // Trabajador/Especialista
        if (appointment.getWorker() != null) {
            dto.setWorker(mapWorkerToDTO(appointment.getWorker()));
        }

        // Información de pago
        List<PaymentModel> payments = paymentRepository.findByAppointment(appointment);
        if (!payments.isEmpty()) {
            dto.setPayment(mapPaymentToDTO(payments.get(0)));
        }

        return dto;
    }

    /**
     * Mapea ServiceModel a ServiceDetailDTO
     */
    private ServiceDetailDTO mapServiceToDTO(ServiceModel service) {
        return ServiceDetailDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .duration(service.getDurationMin())
                .price(service.getBaseprice())
                .build();
    }

    /**
     * Mapea UserModel (trabajador) a WorkerDetailDTO
     */
    private WorkerDetailDTO mapWorkerToDTO(UserModel worker) {
        return WorkerDetailDTO.builder()
                .id(worker.getId())
                .name(worker.getUsername())
                .specialty(worker.getEspecialidad() != null ? worker.getEspecialidad() : "Especialista")
                .email(worker.getEmail())
                .phone(worker.getPhone())
                .experienceYears(worker.getExperiencia())
                .build();
    }

    /**
     * Mapea PaymentModel a PaymentDetailDTO
     */
    private PaymentDetailDTO mapPaymentToDTO(PaymentModel payment) {
        PaymentDetailDTO dto = PaymentDetailDTO.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .methodLabel(translatePaymentMethod(payment.getMethod()))
                .paymentDate(payment.getPaymentDate())
                .status(payment.getStatus() != null ? payment.getStatus().name() : "PAID")
                .build();

        // Formatear fecha de pago
        if (payment.getPaymentDate() != null) {
            dto.setPaymentDateFormatted(
                payment.getPaymentDate().format(DATETIME_FORMATTER)
            );
        }

        // Estado del pago
        dto.setStatusLabel(translatePaymentStatus(dto.getStatus()));

        // Información de factura/boleta
        if (payment.getInvoice() != null) {
            dto.setInvoiceType(payment.getInvoice().getType().name());
            dto.setInvoiceNumber(payment.getInvoice().getInvoiceNumber());
        }

        return dto;
    }

    /**
     * Genera número de orden formateado
     */
    private String generateOrderNumber(Long id) {
        return String.format("ORD-%05d", id);
    }

    /**
     * Traduce estado de cita al español
     */
    private String translateStatus(String status) {
        Map<String, String> statusMap = Map.of(
            "PENDING", "Pendiente",
            "CONFIRMED", "Confirmada",
            "COMPLETED", "Completada",
            "CANCELLED", "Cancelada"
        );
        return statusMap.getOrDefault(status, status);
    }

    /**
     * Traduce método de pago al español
     */
    private String translatePaymentMethod(String method) {
        if (method == null) return "No especificado";
        
        Map<String, String> methodMap = Map.of(
            "CREDIT_CARD", "Tarjeta de Crédito",
            "DEBIT_CARD", "Tarjeta de Débito",
            "CASH", "Efectivo",
            "TRANSFER", "Transferencia",
            "YAPE", "Yape",
            "PLIN", "Plin"
        );
        return methodMap.getOrDefault(method.toUpperCase(), method);
    }

    /**
     * Traduce estado de pago al español
     */
    private String translatePaymentStatus(String status) {
        if (status == null) return "Pendiente";
        
        Map<String, String> statusMap = Map.of(
            "PAID", "Pagado",
            "PENDING", "Pendiente",
            "REFUNDED", "Reembolsado",
            "FAILED", "Fallido"
        );
        return statusMap.getOrDefault(status, status);
    }
}