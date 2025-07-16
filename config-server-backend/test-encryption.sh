#!/bin/bash

# Real encrypted values for testing
DEV_PASSWORD="df55a010f5af37bfd1218d5280303a8050ce949fc0229b43cba1ea482cc4e1d0"
API_SECRET="1c6669a8c4d132b80bdf5b49c339e3d6481284d5599d341e5723ed743a6f61398e29a6fecf7203361c661ed9ac7ff4c8"
PROD_PASSWORD="47206452f04270e34a633a63a481f383607e6ea5e4108e256022555f34d2c682"

echo "Testing config server with encrypted values..."

echo ""
echo "1. Testing myapp-dev configuration:"
curl -s "http://localhost:8888/myapp/dev/main" | jq .

echo ""
echo "2. Testing myapp-prod configuration:"
curl -s "http://localhost:8888/myapp/prod/main" | jq .

echo ""
echo "3. Testing userservice-dev configuration:"
curl -s "http://localhost:8888/userservice/dev/main" | jq .

echo ""
echo "4. Testing encrypt endpoint:"
ENCRYPTED=$(curl -X POST -d "test-value" "http://localhost:8888/encrypt")
echo "Encrypted 'test-value': $ENCRYPTED"

echo ""
echo "5. Testing decrypt endpoint:"
DECRYPTED=$(curl -X POST -d "$ENCRYPTED" "http://localhost:8888/decrypt")
echo "Decrypted back: $DECRYPTED"

echo ""
echo "6. Testing H2 console access:"
echo "H2 Console: http://localhost:8888/h2-console"
echo "JDBC URL: jdbc:h2:mem:configdb"
echo "Username: sa"
echo "Password: (empty)"
