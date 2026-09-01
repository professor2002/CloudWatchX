let thresholds = {
    CPU_WARNING: 80,
    CPU_CRITICAL: 90,
    MEMORY_WARNING: 80,
    MEMORY_CRITICAL: 90,
    DISK_WARNING: 80,
    DISK_CRITICAL: 90
};


async function loadThresholds() {

    try {

        const response = await fetch("/api/thresholds");

        if (!response.ok) {
            throw new Error("Threshold API unavailable");
        }

        thresholds = await response.json();

        updateThresholdLabels();

    } catch (error) {

        console.error("Failed to load thresholds:", error);
    }
}


function updateThresholdLabels() {

    const footerElements =
        document.querySelectorAll(".metric-footer");

    if (footerElements.length >= 3) {

        footerElements[0].innerHTML =
            `<span>Warning: <strong>${thresholds.CPU_WARNING}%</strong></span>
             <span>Critical: <strong>${thresholds.CPU_CRITICAL}%</strong></span>`;

        footerElements[1].innerHTML =
            `<span>Warning: <strong>${thresholds.MEMORY_WARNING}%</strong></span>
             <span>Critical: <strong>${thresholds.MEMORY_CRITICAL}%</strong></span>`;

        footerElements[2].innerHTML =
            `<span>Warning: <strong>${thresholds.DISK_WARNING}%</strong></span>
             <span>Critical: <strong>${thresholds.DISK_CRITICAL}%</strong></span>`;
    }

    const chartFooter =
        document.querySelector(".chart-footer span:last-child");

    if (chartFooter) {

        chartFooter.textContent =
            `Warning ≥ ${thresholds.CPU_WARNING}%  |  Critical ≥ ${thresholds.CPU_CRITICAL}%`;
    }
}


/* =========================
   STATUS HELPERS
========================= */

function getStatus(value, warning, critical) {

    if (value >= critical) {
        return "CRITICAL";
    }

    if (value >= warning) {
        return "WARNING";
    }

    return "HEALTHY";
}


function updateStatus(elementId, value, warning, critical) {

    const element =
        document.getElementById(elementId);

    const status =
        getStatus(value, warning, critical);

    element.textContent = status;

    element.classList.remove(
        "healthy",
        "warning",
        "critical"
    );

    element.classList.add(
        status.toLowerCase()
    );

    return status;
}


function updateProgress(elementId, value, status) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    const percentage =
        Math.max(0, Math.min(100, value));

    element.style.width =
        percentage + "%";

    element.classList.remove(
        "healthy",
        "warning",
        "critical"
    );

    element.classList.add(
        status.toLowerCase()
    );
}


/* =========================
   OVERALL HEALTH
========================= */

function updateSystemHealth(statuses) {

    const health =
        document.getElementById("system-health");

    const icon =
        document.getElementById("system-health-icon");

    const description =
        document.getElementById("health-description");

    const banner =
        document.querySelector(".health-banner");


    let overall = "HEALTHY";


    if (statuses.includes("CRITICAL")) {

        overall = "CRITICAL";

    } else if (statuses.includes("WARNING")) {

        overall = "WARNING";
    }


    health.textContent = overall;


    health.classList.remove(
        "healthy",
        "warning",
        "critical"
    );

    health.classList.add(
        overall.toLowerCase()
    );


    icon.classList.remove(
        "healthy",
        "warning",
        "critical"
    );

    icon.classList.add(
        overall.toLowerCase()
    );


    banner.classList.remove(
        "healthy",
        "warning",
        "critical"
    );

    banner.classList.add(
        overall.toLowerCase()
    );


    if (overall === "CRITICAL") {

        icon.textContent = "!";

        description.textContent =
            "One or more monitored resources require immediate attention.";

    } else if (overall === "WARNING") {

        icon.textContent = "!";

        description.textContent =
            "One or more monitored resources are approaching critical levels.";

    } else {

        icon.textContent = "✓";

        description.textContent =
            "All monitored resources are operating normally.";
    }
}


/* =========================
   LATEST METRICS
========================= */

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/metrics/latest");

        if (!response.ok) {

            throw new Error(
                "Metrics API unavailable"
            );
        }


        const data =
            await response.json();


        document.getElementById("cpu").textContent =
            Number(data.cpu).toFixed(1);

        document.getElementById("memory").textContent =
            Number(data.memory).toFixed(1);

        document.getElementById("disk").textContent =
            Number(data.disk).toFixed(1);

        document.getElementById("processes").textContent =
            data.processes;


        document.getElementById("last-updated").textContent =
            data.timestamp;


        document.getElementById("connection-status").textContent =
            "CONNECTED";


        const connectionDot =
            document.getElementById("connection-dot");

        connectionDot.classList.remove("offline");



        const cpuStatus =
            updateStatus(
                "cpu-status",
                data.cpu,
                thresholds.CPU_WARNING,
                thresholds.CPU_CRITICAL
            );


        const memoryStatus =
            updateStatus(
                "memory-status",
                data.memory,
                thresholds.MEMORY_WARNING,
                thresholds.MEMORY_CRITICAL
            );


        const diskStatus =
            updateStatus(
                "disk-status",
                data.disk,
                thresholds.DISK_WARNING,
                thresholds.DISK_CRITICAL
            );


        updateProgress(
            "cpu-progress",
            data.cpu,
            cpuStatus
        );


        updateProgress(
            "memory-progress",
            data.memory,
            memoryStatus
        );


        updateProgress(
            "disk-progress",
            data.disk,
            diskStatus
        );


        updateSystemHealth([
            cpuStatus,
            memoryStatus,
            diskStatus
        ]);


        await loadRecentMetrics();

        await loadAlerts();


    } catch (error) {

        console.error(error);


        document.getElementById(
            "connection-status"
        ).textContent = "DISCONNECTED";


        document.getElementById(
            "connection-dot"
        ).classList.add("offline");
    }
}


/* =========================
   RECENT METRICS
========================= */

async function loadRecentMetrics() {

    try {

        const response =
            await fetch("/api/metrics/recent");

        const metrics =
            await response.json();


        const table =
            document.getElementById("metrics-table");


        table.innerHTML = "";


        metrics.slice(0, 10).forEach(metric => {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>${metric.timestamp}</td>
                <td>${Number(metric.cpu).toFixed(1)}%</td>
                <td>${Number(metric.memory).toFixed(1)}%</td>
                <td>${Number(metric.disk).toFixed(1)}%</td>
                <td>${metric.processes}</td>
            `;


            table.appendChild(row);
        });


    } catch (error) {

        console.error(
            "Failed to load metrics:",
            error
        );
    }
}


/* =========================
   ALERTS
========================= */

async function loadAlerts() {

    try {

        const response =
            await fetch("/api/alerts");

        const alerts =
            await response.json();


        const container =
            document.getElementById(
                "alerts-container"
            );


        if (alerts.length === 0) {

            container.innerHTML = `
                <div class="empty-alert">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <strong>
                        No active alerts
                    </strong>

                    <span>
                        System is operating normally.
                    </span>

                </div>
            `;

            return;
        }


        container.innerHTML = "";


        alerts.slice(0, 10).forEach(alert => {

            const div =
                document.createElement("div");


            div.className =
                "alert " +
                alert.severity.toLowerCase();


            div.innerHTML = `
                <strong>
                    ${alert.severity} — ${alert.metric}
                </strong>

                <span>
                    ${alert.message}
                </span>

                <br>

                <small>
                    ${alert.timestamp}
                </small>
            `;


            container.appendChild(div);
        });


    } catch (error) {

        console.error(
            "Failed to load alerts:",
            error
        );
    }
}


/* =========================
   CHART
========================= */

async function loadChart() {

    try {

        const response =
            await fetch("/api/metrics/history");

        const metrics =
            await response.json();


        const canvas =
            document.getElementById(
                "metrics-chart"
            );


        if (!canvas || metrics.length < 2) {
            return;
        }


        const container =
            canvas.parentElement;


        const width =
            container.clientWidth;


        const height =
            320;


        canvas.width = width;

        canvas.height = height;


        const ctx =
            canvas.getContext("2d");


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        const paddingLeft = 50;

        const paddingRight = 20;

        const paddingTop = 20;

        const paddingBottom = 35;


        const chartWidth =
            width -
            paddingLeft -
            paddingRight;


        const chartHeight =
            height -
            paddingTop -
            paddingBottom;



        function x(index) {

            return paddingLeft +
                (
                    index /
                    (metrics.length - 1)
                ) *
                chartWidth;
        }


        function y(value) {

            return paddingTop +
                chartHeight -
                (
                    value / 100
                ) *
                chartHeight;
        }


        /*
         * Grid
         */

        ctx.font =
            "11px Arial";

        ctx.textAlign =
            "right";


        for (
            let value = 0;
            value <= 100;
            value += 20
        ) {

            const lineY =
                y(value);


            ctx.beginPath();

            ctx.moveTo(
                paddingLeft,
                lineY
            );

            ctx.lineTo(
                width - paddingRight,
                lineY
            );

            ctx.stroke();


            ctx.fillText(
                value + "%",
                paddingLeft - 8,
                lineY + 4
            );
        }


        /*
         * Threshold lines
         */

        drawThresholdLine(
            ctx,
            y(thresholds.CPU_WARNING),
            `WARNING ${thresholds.CPU_WARNING}%`
        );


        drawThresholdLine(
            ctx,
            y(thresholds.CPU_CRITICAL),
            `CRITICAL ${thresholds.CPU_CRITICAL}%`
        );


        /*
         * Metric lines
         */

        drawLine(
            ctx,
            metrics.map(
                metric => metric.cpu
            ),
            x,
            y
        );


        drawLine(
            ctx,
            metrics.map(
                metric => metric.memory
            ),
            x,
            y
        );


        drawLine(
            ctx,
            metrics.map(
                metric => metric.disk
            ),
            x,
            y
        );


    } catch (error) {

        console.error(
            "Failed to load chart:",
            error
        );
    }
}


function drawLine(
    ctx,
    values,
    x,
    y
) {

    ctx.beginPath();


    values.forEach(
        (value, index) => {

            const pointX =
                x(index);

            const pointY =
                y(value);


            if (index === 0) {

                ctx.moveTo(
                    pointX,
                    pointY
                );

            } else {

                ctx.lineTo(
                    pointX,
                    pointY
                );
            }
        }
    );


    ctx.stroke();
}


function drawThresholdLine(
    ctx,
    position,
    label
) {

    const width =
        ctx.canvas.width;


    ctx.beginPath();

    ctx.moveTo(
        50,
        position
    );

    ctx.lineTo(
        width - 20,
        position
    );

    ctx.stroke();


    ctx.font =
        "10px Arial";

    ctx.textAlign =
        "right";


    ctx.fillText(
        label,
        width - 22,
        position - 5
    );
}


/* =========================
   INITIALIZATION
========================= */

async function initializeDashboard() {

    await loadThresholds();

    await loadDashboard();

    await loadChart();
}


initializeDashboard();


/* =========================
   AUTO REFRESH
========================= */

setInterval(
    loadDashboard,
    10000
);

setInterval(
    loadChart,
    10000
);

setInterval(
    loadThresholds,
    30000
);
