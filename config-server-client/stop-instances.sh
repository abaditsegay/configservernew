#!/bin/bash

echo "Stopping Config Client instances..."

# Check if PID files exist and kill processes
if [ -f "instance1.pid" ]; then
    PID1=$(cat instance1.pid)
    if kill -0 $PID1 2>/dev/null; then
        kill $PID1
        echo "Stopped instance 1 (PID: $PID1)"
    fi
    rm -f instance1.pid
fi

if [ -f "instance2.pid" ]; then
    PID2=$(cat instance2.pid)
    if kill -0 $PID2 2>/dev/null; then
        kill $PID2
        echo "Stopped instance 2 (PID: $PID2)"
    fi
    rm -f instance2.pid
fi

# Also kill any remaining java processes running the client
pkill -f "config-server-client-1.0.0.jar" 2>/dev/null

echo "All Config Client instances have been stopped."
