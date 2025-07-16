package com.example.configserver.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import com.example.configserver.entity.ConfigProperty;
import com.example.configserver.repository.ConfigPropertyRepository;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private ConfigPropertyRepository configPropertyRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DataInitializationService: Starting data initialization...");
        // Check if data already exists
        long count = configPropertyRepository.count();
        System.out.println("DataInitializationService: Found " + count + " existing records");
        
        if (count == 0) {
            System.out.println("DataInitializationService: Initializing sample data...");
            initializeData();
        } else {
            System.out.println("DataInitializationService: Clearing existing data and reinitializing...");
            configPropertyRepository.deleteAll();
            initializeData();
        }
    }

    private void initializeData() {
        // myapp-dev configuration (using "master" as default label) - OPTIMIZED SHORT ENCRYPTED VALUES
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "server.port", "8080"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "spring.datasource.url", "jdbc:h2:mem:devdb"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "spring.datasource.username", "sa"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "spring.datasource.password", "{cipher}e2b6a6482bb9d05e2c0746dc5a2275ffa13f6e85070f308bbe32884dafc3d6f3")); // devpassword (64 chars - SHORT!)
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "logging.level.com.example", "DEBUG"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "app.name", "My Application - Development"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "app.version", "1.0.0-SNAPSHOT"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "app.features.feature1", "enabled"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "app.features.feature2", "disabled"));
        configPropertyRepository.save(new ConfigProperty("myapp", "dev", "master", "app.api.secret", "{cipher}3e8df3df39cee3697e5862bb1537e04f903e59330588a00602d2c8c8ad10e29a922f83200cdb62bb883448f480f6492e")); // my-api-secret-key (96 chars - SHORT!)

        // myapp-prod configuration (using "master" as default label) - OPTIMIZED SHORT ENCRYPTED VALUES
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "server.port", "8080"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "spring.datasource.url", "jdbc:postgresql://prod-db:5432/myapp"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "spring.datasource.username", "myapp_user"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "spring.datasource.password", "{cipher}0a64ae6e3713f2c878b6b83af8e2c7e71ec6970ed7e6101be2e31baf3c77cb15")); // prodpassword123 (64 chars - SHORT!)
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "logging.level.com.example", "INFO"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "app.name", "My Application - Production"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "app.version", "1.0.0"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "app.features.feature1", "enabled"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "app.features.feature2", "enabled"));
        configPropertyRepository.save(new ConfigProperty("myapp", "prod", "master", "app.api.secret", "{cipher}98014c40753887516390f560c8026ab28a4f476a5164a30e9ec1a0732d5b13dc0f9bdb4b2dfdbcfd056f60889acd8115")); // prod-api-secret-key (96 chars - SHORT!)

        // Another app configuration (using "master" as default label)
        configPropertyRepository.save(new ConfigProperty("userservice", "dev", "master", "server.port", "8081"));
        configPropertyRepository.save(new ConfigProperty("userservice", "dev", "master", "spring.datasource.url", "jdbc:h2:mem:userdb"));
        configPropertyRepository.save(new ConfigProperty("userservice", "dev", "master", "app.name", "User Service"));
        configPropertyRepository.save(new ConfigProperty("userservice", "dev", "master", "app.cache.enabled", "false"));
        configPropertyRepository.save(new ConfigProperty("userservice", "dev", "master", "app.jwt.secret", "{cipher}ddd3b614711b18798e40afc585656c48b2222e402c02fd1fe6cc9f4ad89c979abec4218a4a18be26dd1704fc0ed35963")); // jwt-signing-key-dev (96 chars - SHORT!)

        configPropertyRepository.save(new ConfigProperty("userservice", "prod", "master", "server.port", "8081"));
        configPropertyRepository.save(new ConfigProperty("userservice", "prod", "master", "spring.datasource.url", "jdbc:postgresql://prod-db:5432/userservice"));
        configPropertyRepository.save(new ConfigProperty("userservice", "prod", "master", "app.name", "User Service"));
        configPropertyRepository.save(new ConfigProperty("userservice", "prod", "master", "app.cache.enabled", "true"));
        configPropertyRepository.save(new ConfigProperty("userservice", "prod", "master", "app.jwt.secret", "{cipher}508b8d0abea72be4f3ed946e0dafe3ff6d0a8d54a03d2b700c1343ffd947062fc6e78d79730b92976cbe84dc5ba55663")); // jwt-signing-key-prod (96 chars - SHORT!)

        System.out.println("DataInitializationService: Sample configuration data initialized successfully!");
        System.out.println("DataInitializationService: Total records created: " + configPropertyRepository.count());
    }
}
