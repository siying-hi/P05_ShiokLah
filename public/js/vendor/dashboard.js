import {
    getDashboardData,
    getInspectionScore
} from "./dashboardAPI.js";

import {
    renderCards,
    renderSalesChart,
    renderPieChart,
    renderRevenueChart
} from "./dashboardUI.js";

const accessToken = sessionStorage.getItem("accessToken");

if(!accessToken){
    alert("Please log in to continue.");
    window.location.href = "/select-role";
}

document.addEventListener("DOMContentLoaded", async () => {
    const dashboard = await getDashboardData();

    dashboard.inspectionScore = await getInspectionScore();

    renderCards(dashboard);

    renderSalesChart("week");
    renderPieChart("top");
    renderRevenueChart("1");

    /* ============================= */
    /* SALES FILTER */
    /* ============================= */

    const salesFilter = document.getElementById("salesFilter");

    if (salesFilter) {

        salesFilter.querySelectorAll("button").forEach(button => {

            button.addEventListener("click", () => {

                salesFilter
                    .querySelectorAll("button")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");

                renderSalesChart(button.dataset.value);

            });

        });

    }

    /* ============================= */
    /* MENU FILTER */
    /* ============================= */

    const menuFilter = document.getElementById("menuFilter");

    if (menuFilter) {

        menuFilter.querySelectorAll("button").forEach(button => {

            button.addEventListener("click", () => {

                menuFilter
                    .querySelectorAll("button")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");

                renderPieChart(button.dataset.value);

            });

        });

    }


    /* ============================= */
    /* REVENUE FILTER */
    /* ============================= */



    const revenueFilter = document.getElementById("revenueFilter");

    if (revenueFilter) {

        revenueFilter.querySelectorAll("button").forEach(button => {

            button.addEventListener("click", () => {

                revenueFilter
                    .querySelectorAll("button")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");

                renderRevenueChart(button.dataset.value);

            });

        });

    }

});