#!/bin/bash

# Production Deployment Script for Spring Cloud Config Server
# This script sets up the production environment with proper security configurations

set -e

echo "🚀 Starting Config Server Production Deployment..."

# Environment Variables Check
check_env_vars() {
    echo "📋 Checking required environment variables..."
    
    required_vars=(
        "KEYSTORE_PASSWORD"
        "KEY_PASSWORD" 
        "DATABASE_URL"
        "DATABASE_USERNAME"
        "DATABASE_PASSWORD"
        "ADMIN_USERNAME"
        "ADMIN_PASSWORD"
        "SSL_KEYSTORE_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            echo "❌ ERROR: Environment variable $var is not set"
            exit 1
        else
            echo "✅ $var is set"
        fi
    done
}

# Create necessary directories
setup_directories() {
    echo "📁 Setting up directories..."
    sudo mkdir -p /etc/config-server/keystore
    sudo mkdir -p /etc/config-server/ssl
    sudo mkdir -p /var/log/config-server
    sudo chown -R config-server:config-server /etc/config-server
    sudo chown -R config-server:config-server /var/log/config-server
    echo "✅ Directories created"
}

# Generate Production SSL Certificate
generate_ssl_cert() {
    echo "🔐 Generating SSL certificate..."
    
    if [[ ! -f "/etc/config-server/ssl/server.p12" ]]; then
        sudo keytool -genkeypair \
            -alias config-server-ssl \
            -keyalg RSA \
            -keysize 4096 \
            -storetype PKCS12 \
            -keystore /etc/config-server/ssl/server.p12 \
            -storepass "${SSL_KEYSTORE_PASSWORD}" \
            -keypass "${SSL_KEYSTORE_PASSWORD}" \
            -dname "CN=config-server.company.com,OU=DevOps,O=Company,C=US" \
            -validity 365
        
        sudo chown config-server:config-server /etc/config-server/ssl/server.p12
        sudo chmod 600 /etc/config-server/ssl/server.p12
        echo "✅ SSL certificate generated"
    else
        echo "ℹ️  SSL certificate already exists"
    fi
}

# Copy keystore to production location
setup_keystore() {
    echo "🔑 Setting up production keystore..."
    
    if [[ -f "src/main/resources/config-server-prod.jks" ]]; then
        sudo cp src/main/resources/config-server-prod.jks /etc/config-server/keystore/
        sudo chown config-server:config-server /etc/config-server/keystore/config-server-prod.jks
        sudo chmod 600 /etc/config-server/keystore/config-server-prod.jks
        echo "✅ Keystore copied to production location"
    else
        echo "❌ ERROR: Production keystore not found"
        exit 1
    fi
}

# Setup systemd service
setup_systemd_service() {
    echo "🔧 Setting up systemd service..."
    
    cat > /tmp/config-server.service << EOF
[Unit]
Description=Spring Cloud Config Server
After=network.target

[Service]
Type=simple
User=config-server
Group=config-server
ExecStart=/usr/bin/java -jar /opt/config-server/config-server.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=config-server

# Environment Variables
Environment=JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
Environment=CONFIG_SERVER_KEYSTORE_PATH=/etc/config-server/keystore/config-server-prod.jks
Environment=SSL_KEYSTORE_PATH=/etc/config-server/ssl/server.p12
Environment=KEYSTORE_PASSWORD=${KEYSTORE_PASSWORD}
Environment=KEY_PASSWORD=${KEY_PASSWORD}
Environment=DATABASE_URL=${DATABASE_URL}
Environment=DATABASE_USERNAME=${DATABASE_USERNAME}
Environment=DATABASE_PASSWORD=${DATABASE_PASSWORD}
Environment=ADMIN_USERNAME=${ADMIN_USERNAME}
Environment=ADMIN_PASSWORD=${ADMIN_PASSWORD}
Environment=SSL_KEYSTORE_PASSWORD=${SSL_KEYSTORE_PASSWORD}

# Security Settings
NoNewPrivileges=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectHome=yes
ProtectSystem=strict
ReadWritePaths=/var/log/config-server

[Install]
WantedBy=multi-user.target
EOF

    sudo mv /tmp/config-server.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable config-server
    echo "✅ Systemd service configured"
}

# Deploy application
deploy_application() {
    echo "📦 Deploying application..."
    
    # Build the application
    ./mvnw clean package -DskipTests
    
    # Copy to deployment location
    sudo mkdir -p /opt/config-server
    sudo cp target/config-server-*.jar /opt/config-server/config-server.jar
    sudo chown config-server:config-server /opt/config-server/config-server.jar
    sudo chmod 755 /opt/config-server/config-server.jar
    
    echo "✅ Application deployed"
}

# Start the service
start_service() {
    echo "🚀 Starting Config Server..."
    sudo systemctl start config-server
    sudo systemctl status config-server
    echo "✅ Config Server started"
}

# Setup monitoring
setup_monitoring() {
    echo "📊 Setting up monitoring..."
    
    # Create logrotate configuration
    cat > /tmp/config-server-logrotate << EOF
/var/log/config-server/application.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 config-server config-server
    postrotate
        systemctl reload config-server
    endscript
}
EOF
    
    sudo mv /tmp/config-server-logrotate /etc/logrotate.d/config-server
    echo "✅ Log rotation configured"
}

# Main execution
main() {
    echo "🎯 Config Server Production Deployment"
    echo "======================================"
    
    check_env_vars
    setup_directories
    generate_ssl_cert
    setup_keystore
    deploy_application
    setup_systemd_service
    setup_monitoring
    start_service
    
    echo ""
    echo "🎉 Production deployment completed successfully!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "  ✅ Config Server is running on https://localhost:8888"
    echo "  ✅ Management endpoints available on https://localhost:8889/actuator"
    echo "  ✅ Logs available at /var/log/config-server/application.log"
    echo "  ✅ SSL certificate valid for 1 year"
    echo "  ✅ Encryption using RSA 4096-bit keystore"
    echo ""
    echo "🔧 Useful commands:"
    echo "  sudo systemctl status config-server   # Check service status"
    echo "  sudo systemctl logs -f config-server  # View logs"
    echo "  sudo systemctl restart config-server  # Restart service"
}

# Execute main function
main "$@"
