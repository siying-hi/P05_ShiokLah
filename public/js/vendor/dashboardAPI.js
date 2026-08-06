import { apiFetch } from "../utility/api.js";


const HYGIENE_API_URL = "/api/vendor/hygiene-grades";
const TOTAL_ORDERS_API_URL = "/api/totalOrders";
const MENU_PERFORMANCE_API_URL = "/api/menuPerformance";
const AVERAGE_REVENUE_API_URL = "/api/averageRevenue";
const CUSTOMER_FREQUENCY_API_URL = "/api/customerFrequency";



export async function getDashboardData() {

    const response = await apiFetch(
        TOTAL_ORDERS_API_URL
    );


    if (!response.ok) {
        throw new Error(
            "Failed to load dashboard data."
        );
    }


    const data = await response.json();


    return {

        totalOrders: data.totalOrders,

        topItem:{
            name:"Nasi Lemak",
            quantity:74
        },

        averageRating:4.7

    };

}





export async function getInspectionScore(){

    const response = await apiFetch(
        HYGIENE_API_URL
    );


    if(!response.ok){

        throw new Error(
            "Failed to load inspection score."
        );

    }


    const data = await response.json();


    if(!data.grades || data.grades.length === 0){

        return 0;

    }


    return data.grades[0].score ?? 0;

}





export async function getCustomerFrequency(filter){


    const response = await apiFetch(
        `${CUSTOMER_FREQUENCY_API_URL}?filter=${filter}`
    );


    if(!response.ok){

        throw new Error(
            "Failed to load customer frequency."
        );

    }


    return await response.json();

}





export async function getMenuPerformance(
    startDate,
    endDate
){


    const response = await apiFetch(

        `${MENU_PERFORMANCE_API_URL}?startDate=${startDate}&endDate=${endDate}`

    );


    if(!response.ok){

        console.log(
            "Menu Performance Status:",
            response.status
        );


        console.log(
            await response.text()
        );


        throw new Error(
            "Failed to load menu performance."
        );

    }


    return await response.json();

}





export async function getAverageRevenue(
    startDate,
    endDate
){


    const response = await apiFetch(

        `${AVERAGE_REVENUE_API_URL}?startDate=${startDate}&endDate=${endDate}`

    );


    if(!response.ok){

        console.log(
            "Average Revenue Status:",
            response.status
        );


        console.log(
            await response.text()
        );


        throw new Error(
            "Failed to load average revenue."
        );

    }


    return await response.json();

}