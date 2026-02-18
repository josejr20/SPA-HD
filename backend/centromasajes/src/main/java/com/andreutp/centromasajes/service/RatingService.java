package com.andreutp.centromasajes.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.andreutp.centromasajes.dao.IAppointmentRepository;
import com.andreutp.centromasajes.model.AppointmentModel;
import com.andreutp.centromasajes.model.RatingModel;
import com.andreutp.centromasajes.repository.RatingRepository;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private IAppointmentRepository appointmentRepository;

    public RatingModel createRating(Long appointmentId, Integer stars, String comment, Long userId) {
        // Validar que la cita existe y está completada
        AppointmentModel appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!appointment.getStatus().equals(AppointmentModel.Status.COMPLETED)) {
            throw new RuntimeException("Solo puedes calificar citas completadas");
        }

        if (!appointment.getUser().getId().equals(userId)) {
            throw new RuntimeException("No autorizado");
        }

        // Validar que no exista rating previo
        if (ratingRepository.existsByAppointmentId(appointmentId)) {
            throw new RuntimeException("Ya has calificado esta cita");
        }

        // Crear rating
        RatingModel rating = new RatingModel();
        rating.setAppointment(appointment);
        rating.setUser(appointment.getUser());
        rating.setWorker(appointment.getWorker());
        rating.setService(appointment.getService());
        rating.setStars(stars);
        rating.setComment(comment);

        return ratingRepository.save(rating);
    }

    public Optional<RatingModel> getRatingByAppointment(Long appointmentId) {
        return ratingRepository.findByAppointmentId(appointmentId);
    }

    public boolean hasRating(Long appointmentId) {
        return ratingRepository.existsByAppointmentId(appointmentId);
    }
}