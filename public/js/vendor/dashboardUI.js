const salesData = {

    year:{
        labels:[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ],

        values:[
            420,
            510,
            480,
            620,
            710,
            680,
            760,
            820,
            790,
            860,
            910,
            980
        ]
    },

    week:{
        labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        values:[18,24,20,31,40,53,48]
    },

    month:{
        labels:["Week 1","Week 2","Week 3","Week 4"],
        values:[152,184,201,230]
    }

};

const menuDistribution = {

    labels:[
        "Nasi Lemak",
        "Mee Soto",
        "Chicken Rice",
        "Laksa",
        "Others"
    ],

    values:[38,24,18,12,8]

};

const revenueData = {

    "1":{
        labels:[
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4"
        ],

        values:[
            3200,
            4100,
            3900,
            4800
        ]
    },

    "3":{
        labels:[
            "May",
            "June",
            "July"
        ],

        values:[
            14500,
            16200,
            17100
        ]
    },

    "6":{
        labels:[
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul"
        ],

        values:[
            10800,
            12100,
            13300,
            14500,
            16200,
            17100
        ]
    },

    "12":{
        labels:[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ],

        values:[
            12000,
            13500,
            14200,
            15100,
            16200,
            17000,
            18400,
            19200,
            20500,
            22000,
            23500,
            25000
        ]
    }

};

let salesChart;

export function renderSalesChart(filter){

    const canvas = document.getElementById("salesChart");

    if(!canvas){
        console.error("salesChart canvas missing");
        return;
    }

    const dataset = salesData[filter];

    if(!dataset){
        console.error("Invalid sales filter:",filter);
        return;
    }

    if(salesChart){
        salesChart.destroy();
    }

    salesChart = new Chart(canvas,{
        type:"line",

        data:{
            labels:dataset.labels,

            datasets:[{
                label:"Customers",
                data:dataset.values,
                borderWidth:3,
                pointRadius:4,
                pointHoverRadius:6,
                tension:0.3
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false,

            plugins:{
                legend:{
                    position:"top",

                    labels:{
                        boxWidth:50,
                        boxHeight:12,
                        padding:8,

                        font:{
                            size:12
                        }
                    }
                }
            },

            scales:{
                x:{
                    ticks:{
                        font:{
                            size:11
                        }
                    }
                },

                y:{
                    beginAtZero:false,

                    ticks:{
                        font:{
                            size:11
                        }
                    }
                }
            }
        }
    });

}

let pieChart;

export function renderPieChart(filter="top"){

    const ctx = document.getElementById("feedbackChart");

    if(!ctx){
        console.error("feedbackChart canvas missing");
        return;
    }

    if(pieChart){
        pieChart.destroy();
    }

    pieChart = new Chart(ctx,{
        type:"pie",

        data:{
            labels:menuDistribution.labels,

            datasets:[{
                data:menuDistribution.values
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false,

            plugins:{
                legend:{
                    position:"top",

                    labels:{
                        boxWidth:40,
                        boxHeight:12,
                        padding:8,

                        font:{
                            size:11
                        }
                    }
                }
            }
        }
    });

}

export function renderCards(data){

    const totalOrders = document.getElementById("totalOrders");
    const topItem = document.getElementById("topItem");
    const averageRating = document.getElementById("averageRating");
    const inspectionScore = document.getElementById("inspectionScore");

    if(totalOrders){
        totalOrders.textContent = data.totalOrders;
    }

    if(topItem){
        topItem.textContent = data.topItem.name;
    }

    if(averageRating){
        averageRating.textContent = data.averageRating;
    }

    if(inspectionScore){
        inspectionScore.textContent = data.inspectionScore;
    }

}

let revenueChart;

export function renderRevenueChart(filter){

    const ctx = document.getElementById("revenueChart");

    if(!ctx){
        console.error("revenueChart canvas missing");
        return;
    }

    const dataset = revenueData[filter];

    if(!dataset){
        console.error("Invalid revenue filter:",filter);
        return;
    }

    if(revenueChart){
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx,{
        type:"bar",

        data:{
            labels:dataset.labels,

            datasets:[{
                label:"Average Revenue ($)",
                data:dataset.values
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false,

            plugins:{
                legend:{
                    position:"top"
                }
            }
        }
    });

}