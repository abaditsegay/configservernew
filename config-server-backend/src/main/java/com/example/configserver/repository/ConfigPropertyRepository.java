package com.example.configserver.repository;

import com.example.configserver.entity.ConfigProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfigPropertyRepository extends JpaRepository<ConfigProperty, Long> {
    
    List<ConfigProperty> findByApplicationAndProfileAndLabel(String application, String profile, String label);
    
    List<ConfigProperty> findByApplicationAndProfile(String application, String profile);
    
    List<ConfigProperty> findByApplication(String application);
    
    void deleteByApplicationAndProfileAndLabel(String application, String profile, String label);
}
