# Config Server Frontend

A React-based frontend application for managing and viewing Spring Cloud Config Server configurations.

## Features

- Retrieve configurations by application, profile, and label
- Modern Material-UI interface
- Real-time configuration viewing
- Error handling and loading states
- Responsive design

## Prerequisites

- Node.js 16+ and npm
- Spring Cloud Config Server running on port 8888

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory to customize settings:

```env
REACT_APP_CONFIG_SERVER_URL=http://localhost:8888
REACT_APP_CONFIG_SERVER_USERNAME=admin
REACT_APP_CONFIG_SERVER_PASSWORD=secret
```

## Running the Application

```bash
npm start
```

The application will start on `http://localhost:3000`.

## Building for Production

```bash
npm run build
```

## Usage

1. Enter the application name (required)
2. Specify the profile (default: 'dev')
3. Specify the label/branch (default: 'main')
4. Click "Fetch Configuration" to retrieve the configuration

## API Integration

The frontend communicates with the Spring Cloud Config Server using:
- Basic authentication
- RESTful API endpoints
- Error handling for common scenarios

## Development

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
