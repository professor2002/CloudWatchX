#!/bin/bash

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

PROCESS_COUNT=$(ps aux --no-headers | wc -l)

TOP_PROCESSES=$(ps aux --sort=-%cpu --no-headers | head -5 | awk '{printf "%s|PID:%s|CPU:%s%%|MEM:%s%%; ", $11, $2, $3, $4}')

MESSAGE="[$TIMESTAMP] Process Count: $PROCESS_COUNT | Top Processes: $TOP_PROCESSES"

echo "$MESSAGE"
echo "$MESSAGE" >> logs/process.log
