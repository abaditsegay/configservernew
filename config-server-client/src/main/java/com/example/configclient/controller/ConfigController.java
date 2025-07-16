package com.example.configclient.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RefreshScope
public class ConfigController {

    @Value("${app.name:Default App Name}")
    private String appName;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${app.features.feature1:disabled}")
    private String feature1;

    @Value("${app.features.feature2:disabled}")
    private String feature2;

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${spring.datasource.url:not-configured}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:not-configured}")
    private String datasourceUsername;

    @Value("${app.api.secret:not-configured}")
    private String apiSecret;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("appName", appName);
        health.put("port", serverPort);
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("configSource", "Spring Cloud Config Server");
        return health;
    }

    @GetMapping("/properties")
    public Map<String, Object> getProperties() {
        Map<String, Object> properties = new HashMap<>();
        properties.put("app.name", appName);
        properties.put("app.version", appVersion);
        properties.put("app.features.feature1", feature1);
        properties.put("app.features.feature2", feature2);
        properties.put("server.port", serverPort);
        properties.put("spring.datasource.url", datasourceUrl);
        properties.put("spring.datasource.username", datasourceUsername);
        properties.put("app.api.secret", "***masked***"); // Don't expose secrets
        properties.put("timestamp", LocalDateTime.now().toString());
        properties.put("configSource", "Database via Config Server (/myapp/dev/master)");
        return properties;
    }
}
