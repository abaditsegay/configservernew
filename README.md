# Spring Cloud Config Server Project

This project contains both backend (Spring Cloud Config Server) and frontend (React management interface) applications for centralized configuration management.

## Project Structure

```
configserverBase/
├── config-server-backend/     # Spring Boot Config Server
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── README.md
├── config-server-frontend/    # React Management Interface
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── README.md
└── README.md                  # This file
```

## Quick Start

### Backend (Config Server)

1. Navigate to the backend directory:
   ```bash
   cd config-server-backend
   ```

2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   The config server will start on `http://localhost:8888`

### Frontend (Management Interface)

1. Navigate to the frontend directory:
   ```bash
   cd config-server-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Configuration

### Backend Configuration

- Update `config-server-backend/src/main/resources/application.yml`
- Configure Git repository URL for configuration storage
- Modify security credentials

### Frontend Configuration

- Create `.env` file in `config-server-frontend/` directory
- Set config server URL and credentials

## Default Credentials

- Username: `admin`
- Password: `secret`

## Features

### Backend (Config Server)
- Centralized configuration management
- Git-based configuration storage
- REST API for configuration retrieval
- Security with basic authentication
- Health check endpoints

### Frontend (Management Interface)
- Modern React-based UI
- Configuration retrieval by application/profile/label
- Real-time configuration viewing
- Error handling and loading states
- Material-UI components

## API Endpoints

- `GET /{application}/{profile}` - Get configuration
- `GET /{application}/{profile}/{label}` - Get configuration with label
- `GET /actuator/health` - Health check

## Security

Both applications use basic authentication. Update credentials in production environments.

## Development

Each component has its own README with detailed development instructions:
- [Backend README](config-server-backend/README.md)
- [Frontend README](config-server-frontend/README.md)
