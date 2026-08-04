import {
    getVendorOrders,
    updateOrderStatus
} from "./orderAPI.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");
if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}

const orderContainer = document.getElementById("orderContainer");
const filterButtons = document.querySelectorAll(".filterButtons button");

let orders = [];
let currentFilter = "Pending";

document.addEventListener("DOMContentLoaded", loadOrders);


async function loadOrders() {
    try {
        const response = await getVendorOrders();
        if (response.success) {
            //Logs response:
            console.log(response.data);
            orders = formatOrders(response.data);
            renderOrders();
        } else {
            orderContainer.innerHTML = `
                <p class="emptyMessage">
                    Unable to load orders.
                </p>
            `;
        }
    } catch (error) {
        console.error("Loading orders error:", error);
        orderContainer.innerHTML = `
            <div class="empty-order-card">

                <div class="empty-icon">
                    <i class="fa-solid fa-receipt"></i>
                </div>

                <h3>No ${currentFilter} Orders</h3>

                <p>
                    There are currently no ${currentFilter.toLowerCase()} orders.
                </p>

                <p class="empty-hint">
                    New customer orders will appear here automatically.
                </p>

            </div>
        `;
    }
}

function formatOrders(data) {
    const orderMap = {};
    data.forEach(item => {
        if (!orderMap[item.order_id]) {
            orderMap[item.order_id] = {
                order_id: item.order_id,
                time_created: item.time_created,
                order_mode: item.order_mode,
                payment_method: item.payment_method,
                total_price: item.total_price,
                order_status: item.order_status,
                items: []
            };
        }
        orderMap[item.order_id].items.push({
            item_name: item.item_name,
            quantity: item.quantity,
            price: item.price
        });
    });
    console.log(orderMap);
    return Object.values(orderMap);
}

function renderOrders() {
    orderContainer.innerHTML = "";
    const filteredOrders = orders.filter(order => order.order_status === currentFilter);
    if (filteredOrders.length === 0) {

        let title = "";
        let message = "";
        let hint = "";

        switch (currentFilter) {

            case "Pending":
                title = "No Pending Orders";
                message = "There are currently no pending orders.";
                hint = "New customer orders will appear here.";
                break;

            case "Preparing":
                title = "No Preparing Orders";
                message = "There are currently no orders being prepared.";
                hint = "Accepted orders will appear here.";
                break;

            case "Ready":
                title = "No Ready Orders";
                message = "There are currently no ready orders.";
                hint = "Completed preparations will appear here.";
                break;

        }

        showErrorMessage(title,message,hint,"📦");

        return;

    }
    filteredOrders.forEach(order => {
        const card = document.createElement("div");
        card.className = "orderCard";
        card.innerHTML = `
            <div class="orderHeader">
                <h3>Order #${order.order_id}</h3>
                <span class="status ${order.order_status}">
                    ${order.order_status}
                </span>
            </div>
            <p>
                <i class="fa-solid fa-clock"></i>
                ${new Date(order.time_created).toLocaleString()}
            </p>
            <p>
                <b>Order Mode:</b>
                ${order.order_mode}
            </p>
            <p>
                <b>Payment:</b>
                ${order.payment_method}
            </p>
            <div class="itemList">
                ${order.items.map(item => `
                    <div class="itemRow">
                        <span>
                            ${item.item_name} x${item.quantity}
                        </span>
                        <span>
                            $${(item.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                `).join("")}
            </div>
            <div class="orderFooter">
                <strong>
                    Total: $${order.total_price.toFixed(2)}
                </strong>
                ${getActionButton(order)}
            </div>
        `;
        orderContainer.appendChild(card);
    });
}

function showErrorMessage(title,message,hint,icon) {

    orderContainer.innerHTML = `
        <div class="empty-order-card">

            <div class="empty-icon">
                ${icon}
            </div>

            <h3>${title}</h3>

            <p>${message}</p>

            <p class="empty-hint">
                ${hint}
            </p>

        </div>
    `;

}


function getActionButton(order) {
    if (order.order_status === "Pending") {
        return `
            <button class="statusBtn" onclick="changeOrderStatus(${order.order_id}, 'Preparing')">
                Accept Order
            </button>
        `;
    }
    return "";
}

window.changeOrderStatus = async function (orderId, status) {
    try {
        const response = await updateOrderStatus(orderId, status);
        if (response.success) {
            alert("Order updated successfully");
            loadOrders();
        } else {
            alert(response.message);
        }
    } catch (error) {
        console.error(error);
        alert("Failed to update order");
    }
};

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        renderOrders();
    });
});