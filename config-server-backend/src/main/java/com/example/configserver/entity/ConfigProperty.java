package com.example.configserver.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "properties", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application", "profile", "label", "prop_key"})
})
public class ConfigProperty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "application", nullable = false)
    private String application;
    
    @Column(name = "profile", nullable = false)
    private String profile;
    
    @Column(name = "label")
    private String label;
    
    @Column(name = "prop_key", nullable = false)
    private String key;
    
    @Column(name = "prop_value", columnDefinition = "TEXT")
    private String value;
    
    @CreationTimestamp
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    // Default constructor
    public ConfigProperty() {}
    
    // Constructor
    public ConfigProperty(String application, String profile, String label, String key, String value) {
        this.application = application;
        this.profile = profile;
        this.label = label;
        this.key = key;
        this.value = value;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getApplication() {
        return application;
    }
    
    public void setApplication(String application) {
        this.application = application;
    }
    
    public String getProfile() {
        return profile;
    }
    
    public void setProfile(String profile) {
        this.profile = profile;
    }
    
    public String getLabel() {
        return label;
    }
    
    public void setLabel(String label) {
        this.label = label;
    }
    
    public String getKey() {
        return key;
    }
    
    public void setKey(String key) {
        this.key = key;
    }
    
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
    
    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
    
    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
    
    @Override
    public String toString() {
        return "ConfigProperty{" +
                "id=" + id +
                ", application='" + application + '\'' +
                ", profile='" + profile + '\'' +
                ", label='" + label + '\'' +
                ", key='" + key + '\'' +
                ", value='" + value + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}
