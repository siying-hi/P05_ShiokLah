const sql = require("mssql");
const dbConfig = require("../dbConfig");


// Fake data
const fakeOrders = [
    {
        order_id: 1,
        patron_id: 1,
        title: "Pasta",
        order_date: "2026-07-05",
        order_status: "completed",
        total_amt: 15.50
    },
    {
        order_id: 2,
        patron_id: 1,
        title: "Burger + Fries",
        order_date: "2026-07-02",
        order_status: "pending",
        total_amt: 12.90
    },
    {
        order_id: 3,
        patron_id: 1,
        title: "Pizza",
        order_date: "2026-07-01",
        order_status: "cancelled",
        total_amt: 20.00
    }
];

async function getOrdersByPatronId(patronId) {
    return fakeOrders.filter(order => order.patron_id == patronId);
}

async function filterOrders(patronId, status) {

    let orders = fakeOrders.filter(
        order => order.patron_id == patronId
    );

    if (status) {
        orders = orders.filter(
            order => order.order_status === status
        );
    }

    return orders;
}

module.exports = {
    getOrdersByPatronId,
    filterOrders
};
