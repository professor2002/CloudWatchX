#!/bin/bash

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
DISK_MOUNT=$(df -h / | awk 'NR==2 {print $6}')

MESSAGE="[$TIMESTAMP] Disk Usage: ${DISK_USAGE} | Mount: ${DISK_MOUNT}"

echo "$MESSAGE"
echo "$MESSAGE" >> logs/disk.log
