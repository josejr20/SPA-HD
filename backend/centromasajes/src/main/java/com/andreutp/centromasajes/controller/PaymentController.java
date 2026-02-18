package com.andreutp.centromasajes.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andreutp.centromasajes.dto.PaymentRequest;
import com.andreutp.centromasajes.model.PaymentModel;
import com.andreutp.centromasajes.service.PaymentService;
import com.andreutp.centromasajes.utils.PdfGenerator;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    
    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentModel> createPayment(@RequestBody PaymentRequest request) {
        PaymentModel pagoCreado = paymentService.createPayment(request);
        return ResponseEntity.ok(pagoCreado);
    }

    @GetMapping
    public ResponseEntity<List<PaymentModel>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentModel>> getPaymentsByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentModel> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // ✅ NUEVO ENDPOINT: Descargar comprobante en PDF
    @GetMapping("/{id}/invoice/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        try {
            PaymentModel payment = paymentService.getPaymentById(id);
            
            if (payment.getInvoice() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No hay comprobante disponible".getBytes());
            }

            // Generar PDF según tipo
            byte[] pdfBytes;
            String filename;
            
            if ("FACTURA".equals(payment.getInvoice().getType().name())) {
                pdfBytes = PdfGenerator.generateInvoiceA4Pdf(
                    payment.getUser().getUsername(),
                    payment.getInvoice().getInvoiceNumber(),
                    payment.getAppointment().getService().getName(),
                    1,
                    payment.getAmount(),
                    payment.getMethod(),
                    String.valueOf(payment.getAppointment().getId())
                );
                filename = "Factura_" + payment.getInvoice().getInvoiceNumber() + ".pdf";
            } else {
                pdfBytes = PdfGenerator.generateStyledInvoicePdf(
                    payment.getUser().getUsername(),
                    payment.getInvoice().getInvoiceNumber(),
                    payment.getAppointment().getService().getName(),
                    1,
                    payment.getAmount(),
                    payment.getMethod(),
                    String.valueOf(payment.getAppointment().getId())
                );
                filename = "Boleta_" + payment.getInvoice().getInvoiceNumber() + ".pdf";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(("Error generando comprobante: " + e.getMessage()).getBytes());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentModel> updatePayment(@PathVariable Long id,
                                                      @RequestBody PaymentModel payment) {
        return ResponseEntity.ok(paymentService.updatePayment(id, payment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}