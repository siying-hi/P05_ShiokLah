import {
    getCustomerFrequency,
    getMenuPerformance,
    getAverageRevenue
} from "./dashboardAPI.js";


let salesChart;

export async function renderSalesChart(filter) {
    try {
        const canvas = document.getElementById("salesChart");

        if (!canvas) {
            console.error("salesChart canvas missing");
            return;
        }

        const dataset = await getCustomerFrequency(filter);

        if (salesChart) {
            salesChart.destroy();
        }

        salesChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: dataset.labels,
                datasets: [{
                    label: "Customers",
                    data: dataset.values,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0
                    }
                }
            }
        });

    } catch (error) {
        console.error("Failed to load customer frequency:", error);
    }
}

let pieChart;

export async function renderPieChart(
    startDate = "2026-08-01",
    endDate = new Date().toISOString().split("T")[0]
) {
    try {
        const ctx = document.getElementById("feedbackChart");

        if (!ctx) {
            console.error("feedbackChart canvas missing");
            return;
        }

        const dataset = await getMenuPerformance(
            startDate,
            endDate
        );

        const labels = dataset.map(
            item => item.item_name
        );

        const values = dataset.map(
            item => item.total_quantity_ordered
        );

        if (pieChart) {
            pieChart.destroy();
        }

        pieChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values
                }]
            }
        });

    } catch (error) {
        console.error(
            "Failed to load menu performance:",
            error
        );
    }
}

export function renderCards(data) {
    const totalOrders = document.getElementById("totalOrders");
    const topItem = document.getElementById("topItem");
    const averageRating = document.getElementById("averageRating");
    const inspectionScore = document.getElementById("inspectionScore");

    if (totalOrders) {
        totalOrders.textContent = data.totalOrders;
    }

    if (topItem) {
        topItem.textContent = data.topItem.name;
    }

    if (averageRating) {
        averageRating.textContent = data.averageRating;
    }

    if (inspectionScore) {
        inspectionScore.textContent = data.inspectionScore;
    }
}

let revenueChart;

export async function renderRevenueChart(
    startDate,
    endDate
) {
    try {
        const ctx = document.getElementById("revenueChart");

        if (!ctx) {
            return;
        }

        const dataset = await getAverageRevenue(
            startDate,
            endDate
        );

        const labels = dataset.map(
            item => item.month
        );

        const values = dataset.map(
            item => item.average_revenue
        );

        if (revenueChart) {
            revenueChart.destroy();
        }

        revenueChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Average Revenue ($)",
                    data: values
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error(
            "Failed to load revenue:",
            error
        );
    }
}