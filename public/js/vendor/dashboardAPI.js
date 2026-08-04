const HYGIENE_API_URL = "/api/vendor/hygiene-grades";

export async function getDashboardData(){

    return {
        totalOrders:128,

        topItem:{
            name:"Nasi Lemak",
            quantity:74
        },

        averageRating:4.7
    };

}

export async function getInspectionScore(){

    const accessToken = sessionStorage.getItem("accessToken");

    const response = await fetch(HYGIENE_API_URL,{
        headers:{
            "Authorization":`Bearer ${accessToken}`
        }
    });

    if(!response.ok){
        throw new Error("Failed to load inspection score.");
    }

    const data = await response.json();

    if(!data.grades || data.grades.length === 0){
        return 0;
    }

    return data.grades[0].score ?? 0;

}