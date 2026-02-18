package com.andreutp.centromasajes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyOrderDTO {
    private Long orderId;
    private String orderNumber; // Número de orden formateado
    
    // Información de la cita
    private LocalDateTime appointmentStart;
    private LocalDateTime appointmentEnd;
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String statusLabel; // "Pendiente", "Confirmada", "Completada", "Cancelada"
    
    // Servicios (puede ser múltiple si se agrupan)
    private List<ServiceDetailDTO> services;
    
    // Información del trabajador/especialista
    private WorkerDetailDTO worker;
    
    // Información del pago
    private PaymentDetailDTO payment;
    
    // Fechas
    private LocalDateTime createdAt;
    private String createdAtFormatted; // Formato: "15 Feb 2026, 10:30 AM"
    private String appointmentDateFormatted; // Formato: "Viernes, 15 de Febrero 2026"
    private String appointmentTimeFormatted; // Formato: "10:00 AM - 11:00 AM"
    
    // DTOs anidados
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceDetailDTO {
        private Long id;
        private String name;
        private String description;
        private Integer duration; // en minutos
        private Double price;
        private String category; // Categoría del servicio si existe
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkerDetailDTO {
        private Long id;
        private String name;
        private String specialty; // Especialidad del trabajador
        private String email;
        private String phone;
        private Integer experienceYears;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDetailDTO {
        private Long id;
        private Double amount;
        private String method; // "CREDIT_CARD", "CASH", etc.
        private String methodLabel; // "Tarjeta de Crédito", "Efectivo"
        private String invoiceType; // "BOLETA", "FACTURA"
        private String invoiceNumber;
        private LocalDateTime paymentDate;
        private String paymentDateFormatted;
        private String status; // "PAID", "PENDING", "REFUNDED"
        private String statusLabel; // "Pagado", "Pendiente", "Reembolsado"
    }
}