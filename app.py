from flask import Flask, jsonify, render_template

from database import (
    get_latest_metrics,
    get_recent_metrics,
    get_average_cpu,
    get_recent_alerts
)

app = Flask(__name__)

CONFIG_FILE = "config/thresholds.conf"


def load_thresholds():

    thresholds = {}

    try:
        with open(CONFIG_FILE, "r") as file:

            for line in file:

                line = line.strip()

                if not line or line.startswith("#"):
                    continue

                key, value = line.split("=")

                thresholds[key] = float(value)

    except FileNotFoundError:

        return {
            "CPU_WARNING": 80,
            "CPU_CRITICAL": 90,
            "MEMORY_WARNING": 80,
            "MEMORY_CRITICAL": 90,
            "DISK_WARNING": 80,
            "DISK_CRITICAL": 90
        }

    return thresholds


@app.route("/health")
def health_check():

    return jsonify({
        "status": "healthy"
    })


@app.route("/")
def home():

    return render_template("index.html")


@app.route("/api/metrics/latest")
def latest_metrics():

    row = get_latest_metrics()

    if row is None:
        return jsonify({"error": "No metrics available"}), 404

    return jsonify({
        "timestamp": row[0],
        "cpu": row[1],
        "memory": row[2],
        "disk": row[3],
        "rx_bytes": row[4],
        "tx_bytes": row[5],
        "processes": row[6]
    })


@app.route("/api/metrics/recent")
def recent_metrics():

    rows = get_recent_metrics()

    return jsonify([
        {
            "timestamp": row[0],
            "cpu": row[1],
            "memory": row[2],
            "disk": row[3],
            "rx_bytes": row[4],
            "tx_bytes": row[5],
            "processes": row[6]
        }
        for row in rows
    ])


@app.route("/api/metrics/history")
def metrics_history():

    rows = get_recent_metrics(60)

    rows.reverse()

    return jsonify([
        {
            "timestamp": row[0],
            "cpu": row[1],
            "memory": row[2],
            "disk": row[3]
        }
        for row in rows
    ])


@app.route("/api/metrics/average-cpu")
def average_cpu():

    return jsonify({
        "average_cpu": get_average_cpu()
    })


@app.route("/api/alerts")
def alerts():

    rows = get_recent_alerts()

    return jsonify([
        {
            "timestamp": row[0],
            "metric": row[1],
            "value": row[2],
            "threshold": row[3],
            "severity": row[4],
            "message": row[5]
        }
        for row in rows
    ])


@app.route("/api/thresholds")
def thresholds():

    return jsonify(load_thresholds())


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
