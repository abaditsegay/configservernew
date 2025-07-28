#!/bin/bash

# Test script for RSA encryption with Spring Cloud Config Server
# Make sure the config server is running on port 8888

echo "=== Testing RSA Encryption with Spring Cloud Config Server ==="
echo ""

# Test if config server is running
echo "1. Checking if config server is running..."
if curl -s http://localhost:8888/actuator/health > /dev/null; then
    echo "✅ Config server is running"
else
    echo "❌ Config server is not running. Please start it first with: mvn spring-boot:run"
    exit 1
fi

echo ""

# Test encryption endpoint
echo "2. Testing encryption endpoint..."
PLAIN_TEXT="mySecretPassword123"
echo "Plain text: $PLAIN_TEXT"

ENCRYPTED=$(curl -s -X POST http://localhost:8888/encrypt -d "$PLAIN_TEXT" -H "Content-Type: text/plain")
if [ $? -eq 0 ] && [ ! -z "$ENCRYPTED" ]; then
    echo "✅ Encryption successful"
    echo "Encrypted value: $ENCRYPTED"
else
    echo "❌ Encryption failed"
    exit 1
fi

echo ""

# Test decryption endpoint
echo "3. Testing decryption endpoint..."
DECRYPTED=$(curl -s -X POST http://localhost:8888/decrypt -d "$ENCRYPTED" -H "Content-Type: text/plain")
if [ $? -eq 0 ] && [ "$DECRYPTED" = "$PLAIN_TEXT" ]; then
    echo "✅ Decryption successful"
    echo "Decrypted value: $DECRYPTED"
    echo "✅ Encryption/Decryption cycle completed successfully!"
else
    echo "❌ Decryption failed"
    echo "Expected: $PLAIN_TEXT"
    echo "Got: $DECRYPTED"
    exit 1
fi

echo ""

# Test with a database password example
echo "4. Testing with a database password example..."
DB_PASSWORD="myDatabasePassword!@#456"
echo "Database password: $DB_PASSWORD"

ENCRYPTED_DB_PASSWORD=$(curl -s -X POST http://localhost:8888/encrypt -d "$DB_PASSWORD" -H "Content-Type: text/plain")
echo "Encrypted database password: $ENCRYPTED_DB_PASSWORD"

echo ""
echo "=== Usage Example ==="
echo "You can now use encrypted values in your configuration files like this:"
echo ""
echo "# In your application-prod.yml or properties:"
echo "datasource:"
echo "  password: '{cipher}$ENCRYPTED_DB_PASSWORD'"
echo ""
echo "Or in properties file:"
echo "spring.datasource.password={cipher}$ENCRYPTED_DB_PASSWORD"
echo ""

echo "=== RSA Encryption Test Completed Successfully! ==="
