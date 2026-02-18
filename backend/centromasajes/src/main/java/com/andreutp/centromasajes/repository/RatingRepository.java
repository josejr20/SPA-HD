package com.andreutp.centromasajes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.andreutp.centromasajes.model.RatingModel;

@Repository
public interface RatingRepository extends JpaRepository<RatingModel, Long> {
    Optional<RatingModel> findByAppointmentId(Long appointmentId);
    boolean existsByAppointmentId(Long appointmentId);
}