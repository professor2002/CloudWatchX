#!/usr/bin/env python3

import sqlite3
import sys


DB_FILE = "data/cloudwatchx.db"
DEFAULT_CONFIG = "config/thresholds.conf"


def load_thresholds(config_file):
    thresholds = {}

    with open(config_file, "r") as file:
        for line in file:
            line = line.strip()

            if not line or line.startswith("#"):
                continue

            key, value = line.split("=")
            thresholds[key] = float(value)

    return thresholds


def get_latest_metrics():
    connection = sqlite3.connect(DB_FILE)

    cursor = connection.cursor()

    cursor.execute("""
        SELECT timestamp, cpu, memory, disk
        FROM metrics
        ORDER BY id DESC
        LIMIT 1
    """)

    row = cursor.fetchone()

    connection.close()

    return row


def check_metric(value, warning, critical):

    if value >= critical:
        return "CRITICAL"

    if value >= warning:
        return "WARNING"

    return "HEALTHY"


def main():

    if len(sys.argv) > 1:
        config_file = sys.argv[1]
    else:
        config_file = DEFAULT_CONFIG

    thresholds = load_thresholds(config_file)

    latest = get_latest_metrics()

    if latest is None:
        print("No metrics available.")
        return

    timestamp, cpu, memory, disk = latest

    cpu_status = check_metric(
        cpu,
        thresholds["CPU_WARNING"],
        thresholds["CPU_CRITICAL"]
    )

    memory_status = check_metric(
        memory,
        thresholds["MEMORY_WARNING"],
        thresholds["MEMORY_CRITICAL"]
    )

    disk_status = check_metric(
        disk,
        thresholds["DISK_WARNING"],
        thresholds["DISK_CRITICAL"]
    )

    print("========================================")
    print("        CLOUDWATCHX ALERT ENGINE")
    print("========================================")
    print(f"Timestamp: {timestamp}")
    print()
    print(f"CPU:       {cpu}%    → {cpu_status}")
    print(f"Memory:    {memory}%    → {memory_status}")
    print(f"Disk:      {disk}%     → {disk_status}")
    print()
    print(f"Config:    {config_file}")
    print("========================================")


if __name__ == "__main__":
    main()
