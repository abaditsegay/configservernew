#!/bin/bash

# Check if jar file exists
if [ ! -f "target/config-server-client-1.0.0.jar" ]; then
    echo "Error: target/config-server-client-1.0.0.jar not found!"
    echo "Please run 'mvn clean package' first."
    exit 1
fi

# Start Config Client Instance 1 on port 9090
echo "Starting Config Client Instance 1 on port 9090..."
java -jar target/config-server-client-1.0.0.jar --server.port=9090 --spring.profiles.active=dev &
PID1=$!
echo "Instance 1 started with PID: $PID1"

# Wait a moment for the first instance to start
sleep 5

# Start Config Client Instance 2 on port 9091
echo "Starting Config Client Instance 2 on port 9091..."
java -jar target/config-server-client-1.0.0.jar --server.port=9091 --spring.profiles.active=dev &
PID2=$!
echo "Instance 2 started with PID: $PID2"

echo "Both instances are starting..."
echo "Instance 1: http://localhost:9090"
echo "Instance 2: http://localhost:9091"
echo ""
echo "Available endpoints:"
echo "  - Configuration: /api/config"
echo "  - Health: /api/health"
echo "  - Features: /api/features"
echo "  - Actuator Refresh: /actuator/refresh (POST)"
echo "  - Actuator Health: /actuator/health"
echo ""
echo "To stop the instances, run: ./stop-instances.sh"

# Store PIDs for easy cleanup
echo "$PID1" > instance1.pid
echo "$PID2" > instance2.pid

# Wait for instances to start
echo "Waiting for instances to start..."
sleep 10

# Test if instances are responding
echo "Testing instance connectivity..."
if curl -s -f http://localhost:9090/api/health > /dev/null; then
    echo "✓ Instance 1 (port 9090) is responding"
else
    echo "✗ Instance 1 (port 9090) is not responding"
fi

if curl -s -f http://localhost:9091/api/health > /dev/null; then
    echo "✓ Instance 2 (port 9091) is responding"
else
    echo "✗ Instance 2 (port 9091) is not responding"
fi

echo ""
echo "Both instances are running in the background."
echo "Press Ctrl+C to stop monitoring, or run './stop-instances.sh' to stop all instances."

# Keep script running to show logs
trap "echo 'Script interrupted. Instances are still running. Use ./stop-instances.sh to stop them.'; exit" INT

# Wait for user input to stop
read -p "Press Enter to stop all instances..."
echo "Stopping instances..."
kill $PID1 $PID2 2>/dev/null
rm -f instance1.pid instance2.pid
echo "All instances stopped."
