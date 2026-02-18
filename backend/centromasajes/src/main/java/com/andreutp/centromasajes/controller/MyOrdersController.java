package com.andreutp.centromasajes.controller;

import com.andreutp.centromasajes.dto.MyOrderDTO;
import com.andreutp.centromasajes.service.MyOrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MyOrdersController {

    private final MyOrdersService myOrdersService;

    /**
     * Obtener todos los pedidos del usuario autenticado
     * GET /api/my-orders?userId=1
     */
    @GetMapping
    public ResponseEntity<List<MyOrderDTO>> getMyOrders(@RequestParam Long userId) {
        List<MyOrderDTO> orders = myOrdersService.getMyOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Obtener pedidos filtrados por estado
     * GET /api/my-orders/status?userId=1&status=PENDING
     */
    @GetMapping("/status")
    public ResponseEntity<List<MyOrderDTO>> getMyOrdersByStatus(
            @RequestParam Long userId,
            @RequestParam String status) {
        List<MyOrderDTO> orders = myOrdersService.getMyOrdersByStatus(userId, status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Obtener un pedido específico por ID
     * GET /api/my-orders/123?userId=1
     */
    @GetMapping("/{appointmentId}")
    public ResponseEntity<MyOrderDTO> getOrderById(
            @PathVariable Long appointmentId,
            @RequestParam Long userId) {
        MyOrderDTO order = myOrdersService.getOrderById(appointmentId, userId);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancelar un pedido (solo si está PENDING)
     * PUT /api/my-orders/123/cancel?userId=1
     */
    @PutMapping("/{appointmentId}/cancel")
    public ResponseEntity<String> cancelOrder(
            @PathVariable Long appointmentId,
            @RequestParam Long userId) {
        
        MyOrderDTO order = myOrdersService.getOrderById(appointmentId, userId);
        
        // Validar que esté en estado PENDING
        if (!"PENDING".equals(order.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Solo puedes cancelar pedidos pendientes");
        }

        // Aquí llamarías al AppointmentService para actualizar el estado
        // appointmentService.updateAppointmentStatus(appointmentId, "CANCELLED");
        
        return ResponseEntity.ok("Pedido cancelado exitosamente");
    }
}