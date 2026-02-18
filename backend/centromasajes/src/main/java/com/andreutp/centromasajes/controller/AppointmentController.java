package com.andreutp.centromasajes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andreutp.centromasajes.dto.AppointmentRequest;
import com.andreutp.centromasajes.model.AppointmentModel;
import com.andreutp.centromasajes.service.AppointmentService;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {
    private final AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // ------------------------
    // CREAR CITA (USER)
    // ------------------------
    @PostMapping
    // @PreAuthorize("hasRole('USER')")
    public ResponseEntity<AppointmentModel> createAppointment(@RequestBody AppointmentRequest request) {
        AppointmentModel saved = appointmentService.createAppointment(request);
        return ResponseEntity.ok(saved);
    }

    // ------------------------
    // LISTAR TODAS LAS CITAS (ADMIN)
    // ------------------------
    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentModel>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // ------------------------
    // LISTAR CITAS DE UN USUARIO (USER)
    // ------------------------
    @GetMapping("/my")
    // @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<AppointmentModel>> getUserAppointments(@RequestParam Long userId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByUser(userId));
    }

    // ------------------------
    // LISTAR CITAS ASIGNADAS A UN WORKER (WORKER)
    // ------------------------
    @GetMapping("/worker/{workerId}")
    // @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<AppointmentModel>> getWorkerAppointments(@PathVariable Long workerId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByWorker(workerId));
    }

    // ------------------------
    // OBTENER CITA POR ID (ADMIN/WORKER/USER según permisos)
    // ------------------------
    @GetMapping("/{id}")
    // @PreAuthorize("hasAnyRole('ADMIN','WORKER','USER')")
    public ResponseEntity<AppointmentModel> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // ------------------------
    // ACTUALIZAR ESTADO DE CITA (WORKER/Admin)
    // ------------------------
    @PatchMapping("/{id}/status")
    // @PreAuthorize("hasAnyRole('WORKER','ADMIN')")
    public ResponseEntity<AppointmentModel> updateStatus(@PathVariable Long id, @RequestParam String status) {
        AppointmentModel updated = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // ------------------------
    // ACTUALIZAR CITA COMPLETA (ADMIN)
    // ------------------------
    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentModel> updateAppointment(@PathVariable Long id,
            @RequestBody AppointmentRequest request) {
        AppointmentModel updated = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(updated);
    }

    // ------------------------
    // ELIMINAR CITA (ADMIN)
    // ------------------------
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    // Agregar este endpoint en AppointmentController
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentModel>> getUserAppointmentsById(@PathVariable Long userId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByUser(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AppointmentModel> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            AppointmentModel.Status newStatus = AppointmentModel.Status.valueOf(status.toUpperCase());
            AppointmentModel updated = appointmentService.updateAppointmentStatus(id, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
