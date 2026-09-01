#!/bin/bash

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

CPU_IDLE=$(top -bn1 | grep "Cpu(s)" | awk '{print $8}')
CPU_USAGE=$(awk "BEGIN {print 100 - $CPU_IDLE}")

MESSAGE="[$TIMESTAMP] CPU Usage: ${CPU_USAGE}%"

echo "$MESSAGE"
echo "$MESSAGE" >> logs/cpu.log
