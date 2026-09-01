#!/usr/bin/env python3

import subprocess
import sqlite3
import time
from datetime import datetime


DB_FILE = "data/cloudwatchx.db"


def get_cpu_usage():
    def read_cpu():
        with open("/proc/stat", "r") as file:
            line = file.readline()

        values = line.split()[1:]

        user = int(values[0])
        nice = int(values[1])
        system = int(values[2])
        idle = int(values[3])
        iowait = int(values[4])
        irq = int(values[5])
        softirq = int(values[6])
        steal = int(values[7])

        idle_time = idle + iowait
        total_time = (
            user
            + nice
            + system
            + idle
            + iowait
            + irq
            + softirq
            + steal
        )

        return idle_time, total_time

    idle1, total1 = read_cpu()

    time.sleep(0.1)

    idle2, total2 = read_cpu()

    idle_delta = idle2 - idle1
    total_delta = total2 - total1

    if total_delta == 0:
        return 0.0

    usage = (1 - (idle_delta / total_delta)) * 100

    return round(usage, 1)


def get_memory_usage():
    output = subprocess.check_output(
        ["free", "-m"],
        text=True
    )

    memory_line = next(
        line for line in output.splitlines()
        if line.startswith("Mem:")
    )

    parts = memory_line.split()

    total = int(parts[1])
    available = int(parts[6])

    usage = ((total - available) / total) * 100

    return round(usage, 1)


def get_disk_usage():
    output = subprocess.check_output(
        ["df", "-P", "/"],
        text=True
    )

    disk_line = output.splitlines()[1]

    usage = disk_line.split()[4]

    return float(usage.replace("%", ""))


def get_network_usage():
    interface = "eth0"

    with open(
        f"/sys/class/net/{interface}/statistics/rx_bytes",
        "r"
    ) as file:
        rx_bytes = int(file.read().strip())

    with open(
        f"/sys/class/net/{interface}/statistics/tx_bytes",
        "r"
    ) as file:
        tx_bytes = int(file.read().strip())

    return rx_bytes, tx_bytes


def get_process_count():
    output = subprocess.check_output(
        ["ps", "aux", "--no-headers"],
        text=True
    )

    return len(output.splitlines())


def create_database():
    connection = sqlite3.connect(DB_FILE)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cpu REAL NOT NULL,
            memory REAL NOT NULL,
            disk REAL NOT NULL,
            rx_bytes INTEGER NOT NULL,
            tx_bytes INTEGER NOT NULL,
            processes INTEGER NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def save_metrics(metrics):
    connection = sqlite3.connect(DB_FILE)

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO metrics (
            timestamp,
            cpu,
            memory,
            disk,
            rx_bytes,
            tx_bytes,
            processes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        metrics["timestamp"],
        metrics["cpu"],
        metrics["memory"],
        metrics["disk"],
        metrics["rx_bytes"],
        metrics["tx_bytes"],
        metrics["processes"]
    ))

    connection.commit()
    connection.close()


def main():
    create_database()

    rx_bytes, tx_bytes = get_network_usage()

    metrics = {
        "timestamp": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),
        "cpu": get_cpu_usage(),
        "memory": get_memory_usage(),
        "disk": get_disk_usage(),
        "rx_bytes": rx_bytes,
        "tx_bytes": tx_bytes,
        "processes": get_process_count()
    }

    save_metrics(metrics)

    print("========================================")
    print("       CLOUDWATCHX METRICS")
    print("========================================")

    for key, value in metrics.items():
        print(f"{key}: {value}")

    print("----------------------------------------")
    print(f"Saved to: {DB_FILE}")
    print("========================================")


if __name__ == "__main__":
    main()
