# Config Server Client

This is a Spring Boot application that acts as a client for the Spring Cloud Config Server. It demonstrates how to retrieve configuration from a centralized config server and supports dynamic configuration refresh.

## Features

- **Spring Cloud Config Integration**: Automatically retrieves configuration from the config server
- **Dynamic Configuration Refresh**: Supports refreshing configuration without restarting the application
- **Multiple Profiles**: Supports different environments (dev, prod)
- **Actuator Endpoints**: Exposes health and management endpoints
- **RESTful API**: Provides endpoints to view current configuration

## Configuration

The application uses the following configuration files:

- `bootstrap.properties`: Bootstrap configuration for connecting to the config server
- `application.properties`: Local application configuration

### Key Configuration Properties

```properties
# Application name - must match the config files on the server (myapp-dev.yml, myapp-prod.yml)
spring.application.name=myapp

# Config server connection
spring.cloud.config.uri=http://localhost:8888
spring.cloud.config.label=master

# Modern config import approach
spring.config.import=optional:configserver:http://localhost:8888
```

## Building and Running

### Build the Application

```bash
mvn clean package
```

### Run Single Instance

```bash
java -jar target/config-server-client-1.0.0.jar --server.port=9090
```

### Run Multiple Instances (for Load Testing)

Use the provided scripts to run multiple instances:

```bash
# Start two instances on ports 9090 and 9091
./start-instances.sh

# Stop all instances
./stop-instances.sh
```

## API Endpoints

### Application Endpoints

- **GET /api/config**: View current configuration values
- **GET /api/health**: Application health check
- **GET /api/features**: View current feature flags

### Actuator Endpoints

- **GET /actuator/health**: Detailed health information
- **POST /actuator/refresh**: Refresh configuration from config server
- **GET /actuator/info**: Application information

## Example Usage

### View Configuration

```bash
curl http://localhost:9090/api/config
```

Response:
```json
{
  "appName": "Sample Application",
  "appVersion": "1.0.0",
  "feature1": "enabled",
  "feature2": "disabled",
  "serverPort": "9090",
  "datasourceUrl": "jdbc:h2:mem:testdb",
  "timestamp": "2024-01-15T10:30:00",
  "profile": "dev"
}
```

### Refresh Configuration

When configuration is updated on the config server, you can refresh it without restarting:

```bash
curl -X POST http://localhost:9090/actuator/refresh
```

This endpoint returns a list of configuration keys that were updated.

## Integration with Config Server Frontend

This client is designed to work with the Config Server Frontend dashboard. The frontend can:

1. **Environment Management**: Switch between LOCAL and DIF environments
2. **Bulk Refresh**: Refresh configuration on multiple client instances
3. **Status Monitoring**: Monitor the health and refresh status of all clients

### LOCAL Environment Setup

For the LOCAL environment, the frontend expects clients running on:
- http://localhost:9090
- http://localhost:9091

Use the `start-instances.sh` script to run both instances for testing.

## Configuration Refresh Workflow

1. **Update Configuration**: Modify configuration files on the config server
2. **Commit Changes**: If using Git backend, commit and push changes
3. **Trigger Refresh**: Use the frontend dashboard or call the refresh endpoint directly
4. **Verify Changes**: Check the `/api/config` endpoint to see updated values

## Troubleshooting

### Config Server Not Available

If the config server is not available at startup:
- The application will use local/default configuration
- Check the `spring.cloud.config.fail-fast` property (set to `false` for development)

### Configuration Not Refreshing

- Ensure the `@RefreshScope` annotation is present on controllers that use `@Value`
- Verify the `/actuator/refresh` endpoint is accessible
- Check config server logs for any issues

### Port Conflicts

If you get port binding errors:
- Check if other applications are using ports 9090/9091
- Use different ports: `java -jar app.jar --server.port=9092`

## Development

### Adding New Configuration Properties

1. Add the property to the config server's YAML files (myapp-dev.yml, myapp-prod.yml)
2. Add a `@Value` annotation in the controller
3. Include the `@RefreshScope` annotation on the class
4. Restart or refresh the application

### Testing Configuration Refresh

```bash
# 1. Start the application
./start-instances.sh

# 2. View current config
curl http://localhost:9090/api/config

# 3. Update config on the server
# (modify files in config-server-backend/src/main/resources/config/)

# 4. Refresh the client
curl -X POST http://localhost:9090/actuator/refresh

# 5. Verify changes
curl http://localhost:9090/api/config
```
