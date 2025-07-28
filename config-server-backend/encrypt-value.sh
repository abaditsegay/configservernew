#!/bin/bash

# Helper script to encrypt values for Spring Cloud Config Server
# Usage: ./encrypt-value.sh "your-secret-value"

CONFIG_SERVER_URL="http://localhost:8888"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"value-to-encrypt\""
    echo "Example: $0 \"mySecretPassword\""
    exit 1
fi

VALUE_TO_ENCRYPT="$1"

echo "Encrypting value: $VALUE_TO_ENCRYPT"
echo ""

# Check if config server is running
if ! curl -s "$CONFIG_SERVER_URL/actuator/health" > /dev/null; then
    echo "❌ Config server is not running at $CONFIG_SERVER_URL"
    echo "Please start it first with: mvn spring-boot:run"
    exit 1
fi

# Encrypt the value
ENCRYPTED=$(curl -s -X POST "$CONFIG_SERVER_URL/encrypt" -d "$VALUE_TO_ENCRYPT" -H "Content-Type: text/plain")

if [ $? -eq 0 ] && [ ! -z "$ENCRYPTED" ]; then
    echo "✅ Encryption successful!"
    echo ""
    echo "Encrypted value:"
    echo "$ENCRYPTED"
    echo ""
    echo "Usage in configuration files:"
    echo "property: '{cipher}$ENCRYPTED'"
    echo ""
    echo "Or in properties format:"
    echo "property={cipher}$ENCRYPTED"
else
    echo "❌ Encryption failed"
    exit 1
fi
