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


function formatDate(date) {

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

}


const accessToken = sessionStorage.getItem("accessToken");


if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}


document.addEventListener("DOMContentLoaded", async () => {


    const dashboard = await getDashboardData();


    dashboard.inspectionScore = await getInspectionScore();


    renderCards(dashboard);


    renderSalesChart("week");



    const today = new Date();



    /* ============================= */
    /* INITIAL MENU CHART */
    /* ============================= */


    const menuStartDate = new Date();


    menuStartDate.setDate(
        today.getDate() - 7
    );


    renderPieChart(

        formatDate(menuStartDate),

        formatDate(today)

    );



    /* ============================= */
    /* INITIAL REVENUE CHART */
    /* ============================= */


    const revenueStartDate = new Date(

        today.getFullYear(),

        today.getMonth(),

        1

    );


    renderRevenueChart(

        formatDate(revenueStartDate),

        formatDate(today)

    );




    /* ============================= */
    /* SALES FILTER */
    /* ============================= */


    const salesFilter = document.getElementById("salesFilter");


    if (salesFilter) {


        salesFilter.querySelectorAll("button")

            .forEach(button => {


                button.addEventListener("click", () => {


                    salesFilter
                        .querySelectorAll("button")
                        .forEach(btn =>
                            btn.classList.remove("active")
                        );


                    button.classList.add("active");


                    renderSalesChart(

                        button.dataset.value

                    );


                });


            });


    }





    /* ============================= */
    /* MENU FILTER */
    /* ============================= */


    const menuFilter = document.getElementById("menuFilter");


    if (menuFilter) {


        menuFilter.querySelectorAll("button")

            .forEach(button => {


                button.addEventListener("click", () => {



                    menuFilter

                        .querySelectorAll("button")

                        .forEach(btn =>

                            btn.classList.remove("active")

                        );



                    button.classList.add("active");



                    const months = parseInt(

                        button.dataset.value

                    );



                    const endDate = new Date();



                    const startDate = new Date(

                        endDate.getFullYear(),

                        endDate.getMonth(),

                        1

                    );



                    startDate.setMonth(

                        startDate.getMonth() - (months - 1)

                    );



                    renderPieChart(

                        formatDate(startDate),

                        formatDate(endDate)

                    );



                });


            });


    }







    /* ============================= */
    /* REVENUE FILTER */
    /* ============================= */


    const revenueFilter = document.getElementById("revenueFilter");


    if (revenueFilter) {


        revenueFilter.querySelectorAll("button")

            .forEach(button => {



                button.addEventListener("click", () => {



                    revenueFilter

                        .querySelectorAll("button")

                        .forEach(btn =>

                            btn.classList.remove("active")

                        );



                    button.classList.add("active");



                    const months = parseInt(

                        button.dataset.value

                    );



                    const today = new Date();



                    let startDate;



                    if (months === 12) {


                        // Rolling 12 months

                        startDate = new Date(

                            today.getFullYear(),

                            today.getMonth() - 11,

                            1

                        );


                    }

                    else {


                        startDate = new Date(

                            today.getFullYear(),

                            today.getMonth() - (months - 1),

                            1

                        );


                    }




                    renderRevenueChart(

                        formatDate(startDate),

                        formatDate(today)

                    );



                });


            });


    }


});