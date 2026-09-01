#!/bin/bash

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

MEMORY_TOTAL=$(free -m | awk '/^Mem:/ {print $2}')
MEMORY_AVAILABLE=$(free -m | awk '/^Mem:/ {print $7}')

MEMORY_USAGE=$(awk "BEGIN {printf \"%.1f\", (($MEMORY_TOTAL - $MEMORY_AVAILABLE) / $MEMORY_TOTAL) * 100}")

MESSAGE="[$TIMESTAMP] Memory Usage: ${MEMORY_USAGE}%"

echo "$MESSAGE"
echo "$MESSAGE" >> logs/memory.log
