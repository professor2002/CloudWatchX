import sqlite3

DB_FILE = "data/cloudwatchx.db"


def get_connection():
    return sqlite3.connect(DB_FILE)


def get_latest_metrics():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            timestamp,
            cpu,
            memory,
            disk,
            rx_bytes,
            tx_bytes,
            processes
        FROM metrics
        ORDER BY id DESC
        LIMIT 1
    """)

    row = cursor.fetchone()
    connection.close()

    return row


def get_recent_metrics(limit=20):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            timestamp,
            cpu,
            memory,
            disk,
            rx_bytes,
            tx_bytes,
            processes
        FROM metrics
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    connection.close()

    return rows


def get_average_cpu():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT AVG(cpu) FROM metrics")

    result = cursor.fetchone()[0]
    connection.close()

    return round(result, 2) if result is not None else 0.0


def get_recent_alerts(limit=10):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            timestamp,
            metric,
            value,
            threshold,
            severity,
            message
        FROM alerts
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    connection.close()

    return rows
