# Spring Cloud Config Server

This is a Spring Cloud Config Server that provides centralized configuration management for microservices.

## Features

- Centralized configuration management
- Git-based configuration storage
- REST API for configuration retrieval
- Security with basic authentication
- Health check endpoints

## Running the Application

```bash
mvn spring-boot:run
```

The server will start on port 8888.

## Configuration

The server is configured to use a Git repository for configuration storage. Update the `application.yml` file to point to your configuration repository.

## API Endpoints

- `GET /{application}/{profile}` - Get configuration for application and profile
- `GET /{application}/{profile}/{label}` - Get configuration for application, profile, and label
- `GET /actuator/health` - Health check endpoint

## Security

Basic authentication is enabled with username `admin` and password `secret`. Update these credentials in production.

## Testing

Access the configuration:
```
curl -u admin:secret http://localhost:8888/myapp/dev
```
