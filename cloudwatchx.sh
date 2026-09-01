#!/bin/bash

echo "========================================"
echo "          CLOUDWATCHX MONITOR"
echo "========================================"
echo

echo "CPU:"
./scripts/cpu_monitor.sh

echo
echo "MEMORY:"
./scripts/memory_monitor.sh

echo
echo "DISK:"
./scripts/disk_monitor.sh

echo
echo "NETWORK:"
./scripts/network_monitor.sh

echo
echo "PROCESSES:"
./scripts/process_monitor.sh

echo
echo "========================================"
echo "          COLLECTION COMPLETE"
echo "========================================"
