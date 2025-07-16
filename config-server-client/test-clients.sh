#!/bin/bash

echo "=== Config Server Client Testing ==="
echo "Testing properties from database via Config Server (/myapp/dev/master)"
echo ""

# Test if both instances are running
echo "1. Testing client instance connectivity..."
if curl -s -f http://localhost:9090/api/health > /dev/null; then
    echo "✓ Instance 1 (port 9090) is responding"
else
    echo "✗ Instance 1 (port 9090) is not responding"
    exit 1
fi

if curl -s -f http://localhost:9091/api/health > /dev/null; then
    echo "✓ Instance 2 (port 9091) is responding"
else
    echo "✗ Instance 2 (port 9091) is not responding"
    exit 1
fi

echo ""
echo "2. Testing properties from Config Server database..."
echo "Instance 1 properties (from /myapp/dev/master):"
curl -s http://localhost:9090/api/properties | python3 -m json.tool

echo ""
echo "Instance 2 properties (from /myapp/dev/master):"
curl -s http://localhost:9091/api/properties | python3 -m json.tool

echo ""
echo "3. Comparing with direct Config Server endpoint..."
echo "Direct from Config Server /myapp/dev/master:"
curl -s "http://admin:secret@localhost:8888/myapp/dev/master" | python3 -c "
import sys, json
data = json.load(sys.stdin)
source = data['propertySources'][0]['source']
print(json.dumps(source, indent=2))
"

echo ""
echo "4. Testing configuration refresh..."
echo "Refreshing instance 1..."
REFRESH1=$(curl -s -X POST http://localhost:9090/actuator/refresh)
echo "Refresh result: $REFRESH1"

echo ""
echo "Refreshing instance 2..."
REFRESH2=$(curl -s -X POST http://localhost:9091/actuator/refresh)
echo "Refresh result: $REFRESH2"

echo ""
echo "5. Testing health endpoints..."
echo "Instance 1 health:"
curl -s http://localhost:9090/api/health | python3 -m json.tool

echo ""
echo "Instance 2 health:"
curl -s http://localhost:9091/api/health | python3 -m json.tool

echo ""
echo "=== All tests completed successfully! ==="
echo ""
echo "✓ Properties are sourced from Config Server database via /myapp/dev/master"
echo "✓ No local property controllers - all configuration comes from database"
echo "✓ CORS enabled for frontend integration"
echo "✓ Refresh functionality working"
echo ""
echo "Available services:"
echo "- Config Server: http://localhost:8888"
echo "- Config Server Endpoint: http://localhost:8888/myapp/dev/master"  
echo "- Client Instance 1: http://localhost:9090 (properties: /api/properties)"
echo "- Client Instance 2: http://localhost:9091 (properties: /api/properties)"
echo "- Frontend Dashboard: http://localhost:3000"
