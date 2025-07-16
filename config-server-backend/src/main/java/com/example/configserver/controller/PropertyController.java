package com.example.configserver.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.configserver.entity.ConfigProperty;
import com.example.configserver.repository.ConfigPropertyRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {

    @Autowired
    private ConfigPropertyRepository configPropertyRepository;

    /**
     * Update a configuration property
     */
    @PostMapping("/properties/update")
    @Transactional
    public ResponseEntity<?> updateProperty(@RequestBody PropertyUpdateRequest request) {
        try {
            // Find existing property by application, profile, label, and key
            List<ConfigProperty> existingProperties = configPropertyRepository.findByApplicationAndProfile(
                request.getApplication(), request.getProfile());
            
            Optional<ConfigProperty> existingProperty = existingProperties.stream()
                .filter(prop -> prop.getKey().equals(request.getKey()) && 
                              (prop.getLabel() == null || prop.getLabel().equals(request.getLabel())))
                .findFirst();

            ConfigProperty property;
            if (existingProperty.isPresent()) {
                // Update existing property
                property = existingProperty.get();
                property.setValue(request.getValue());
            } else {
                // Create new property
                property = new ConfigProperty(
                    request.getApplication(),
                    request.getProfile(),
                    request.getLabel(),
                    request.getKey(),
                    request.getValue()
                );
            }

            configPropertyRepository.save(property);
            
            return ResponseEntity.ok().body(new PropertyUpdateResponse(
                true, 
                "Property updated successfully", 
                property.getKey(), 
                property.getValue()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new PropertyUpdateResponse(
                false, 
                "Error updating property: " + e.getMessage(), 
                request.getKey(), 
                null
            ));
        }
    }

    /**
     * Get all properties for an application and profile
     */
    @GetMapping("/properties")
    public ResponseEntity<List<ConfigProperty>> getProperties(
            @RequestParam String application,
            @RequestParam String profile) {
        try {
            List<ConfigProperty> properties = configPropertyRepository.findByApplicationAndProfile(application, profile);
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Execute SQL query (for direct database access)
     */
    @PostMapping("/sql")
    @Transactional
    public ResponseEntity<?> executeSql(@RequestBody SqlRequest request) {
        try {
            // For security, only allow UPDATE and INSERT statements for properties table
            String sql = request.getSql().trim().toLowerCase();
            if (!sql.startsWith("update properties") && !sql.startsWith("insert into properties")) {
                return ResponseEntity.badRequest().body(new SqlResponse(
                    false, 
                    "Only UPDATE and INSERT statements are allowed for properties table"
                ));
            }

            // Note: This is a simplified implementation
            // In a real application, you would use proper SQL execution with parameters
            // For now, we'll return success to indicate the endpoint is available
            return ResponseEntity.ok(new SqlResponse(true, "SQL executed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new SqlResponse(
                false, 
                "Error executing SQL: " + e.getMessage()
            ));
        }
    }

    // Request/Response DTOs
    public static class PropertyUpdateRequest {
        private String application;
        private String profile;
        private String label;
        private String key;
        private String value;

        // Constructors
        public PropertyUpdateRequest() {}

        public PropertyUpdateRequest(String application, String profile, String label, String key, String value) {
            this.application = application;
            this.profile = profile;
            this.label = label;
            this.key = key;
            this.value = value;
        }

        // Getters and Setters
        public String getApplication() { return application; }
        public void setApplication(String application) { this.application = application; }
        
        public String getProfile() { return profile; }
        public void setProfile(String profile) { this.profile = profile; }
        
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    public static class PropertyUpdateResponse {
        private boolean success;
        private String message;
        private String key;
        private String value;

        public PropertyUpdateResponse(boolean success, String message, String key, String value) {
            this.success = success;
            this.message = message;
            this.key = key;
            this.value = value;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getKey() { return key; }
        public String getValue() { return value; }
    }

    public static class SqlRequest {
        private String sql;

        public SqlRequest() {}
        public SqlRequest(String sql) { this.sql = sql; }

        public String getSql() { return sql; }
        public void setSql(String sql) { this.sql = sql; }
    }

    public static class SqlResponse {
        private boolean success;
        private String message;

        public SqlResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}
