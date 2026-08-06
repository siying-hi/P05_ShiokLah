const waitingQueue =
    document.getElementById("waitingQueue");

const preparingQueue =
    document.getElementById("preparingQueue");

const readyQueue =
    document.getElementById("readyQueue");

const queueSearch =
    document.getElementById("queueSearch");

const filterButtons =
    document.querySelectorAll(".filter-button");


let allOrders = [];

let selectedStatus = "All";


function getAccessToken() {

    return sessionStorage.getItem(
        "accessToken"
    );

}


function createQueueNumber(orderId) {

    return "Q-" +
        String(orderId).padStart(3, "0");

}


function formatTime(dateValue) {

    return new Date(dateValue)
        .toLocaleTimeString(
            "en-SG",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

}


function calculateMinutes(dateValue) {

    const createdTime =
        new Date(dateValue).getTime();

    const currentTime =
        new Date().getTime();

    const difference =
        currentTime - createdTime;

    return Math.max(
        0,
        Math.floor(difference / 60000)
    );

}


function getDisplayStatus(status) {

    if (status === "Pending") {

        return "Waiting";

    }

    return status;

}


function getStatusClass(status) {

    if (status === "Pending") {

        return "waiting-status";

    }

    if (status === "Preparing") {

        return "preparing-status";

    }

    return "ready-status";

}


function createActionButton(order) {

    if (order.order_status === "Pending") {

        return `
            <button
                type="button"
                class="order-button prepare-button"
                data-order-id="${order.order_id}"
                data-action="Preparing"
            >
                Start Preparing
            </button>
        `;

    }

    if (order.order_status === "Preparing") {

        return `
            <button
                type="button"
                class="order-button ready-button"
                data-order-id="${order.order_id}"
                data-action="Ready"
            >
                Mark as Ready
            </button>
        `;

    }

    return `
        <div class="collection-message">
            Customer has been notified.
        </div>

        <button
            type="button"
            class="order-button collected-button"
            data-order-id="${order.order_id}"
            data-action="Collected"
        >
            Mark as Collected
        </button>
    `;

}


function createOrderCard(order) {

    const queueNumber =
        createQueueNumber(order.order_id);

    const minutes =
        calculateMinutes(order.time_created);

    let timeLabel = "Waiting for";

    if (order.order_status === "Preparing") {

        timeLabel = "Active for";

    }

    if (order.order_status === "Ready") {

        timeLabel = "Ready for";

    }

    const delayedClass =
        minutes >= 10 ? "delayed" : "";

    return `
        <article class="order-card">
            <div class="order-heading">
                <div>
                    <span class="queue-label">
                        QUEUE NUMBER
                    </span>

                    <h3>${queueNumber}</h3>
                </div>

                <span
                    class="status-badge
                    ${getStatusClass(order.order_status)}"
                >
                    ${getDisplayStatus(order.order_status)}
                </span>
            </div>

            <div class="order-details">
                <div class="detail-row">
                    <span>Order</span>
                    <strong>
                        #${order.order_id}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Stall</span>
                    <strong>
                        ${order.stall_name}
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Items</span>
                    <strong>
                        ${order.item_count} items
                    </strong>
                </div>

                <div class="detail-row">
                    <span>Ordered at</span>
                    <strong>
                        ${formatTime(order.time_created)}
                    </strong>
                </div>
            </div>

            <div class="waiting-time ${delayedClass}">
                <span>${timeLabel}</span>

                <strong>
                    ${minutes} mins
                </strong>
            </div>

            ${createActionButton(order)}
        </article>
    `;

}


function showEmptyMessage(container) {

    container.innerHTML = `
        <div class="empty-queue-message">
            No orders currently in this queue.
        </div>
    `;

}


function displayOrders() {

    waitingQueue.innerHTML = "";
    preparingQueue.innerHTML = "";
    readyQueue.innerHTML = "";

    const searchValue =
        queueSearch.value
            .trim()
            .toLowerCase();

    const filteredOrders =
        allOrders.filter(function (order) {

            const matchesStatus =
                selectedStatus === "All" ||
                order.order_status === selectedStatus;

            const queueNumber =
                createQueueNumber(order.order_id)
                    .toLowerCase();

            const orderNumber =
                String(order.order_id);

            const stallName =
                String(order.stall_name || "")
                    .toLowerCase();

            const matchesSearch =
                queueNumber.includes(searchValue) ||
                orderNumber.includes(searchValue) ||
                stallName.includes(searchValue);

            return matchesStatus && matchesSearch;

        });


    for (const order of filteredOrders) {

        const card =
            createOrderCard(order);

        if (order.order_status === "Pending") {

            waitingQueue.insertAdjacentHTML(
                "beforeend",
                card
            );

        }
        else if (
            order.order_status === "Preparing"
        ) {

            preparingQueue.insertAdjacentHTML(
                "beforeend",
                card
            );

        }
        else if (
            order.order_status === "Ready"
        ) {

            readyQueue.insertAdjacentHTML(
                "beforeend",
                card
            );

        }

    }


    if (waitingQueue.innerHTML === "") {

        showEmptyMessage(waitingQueue);

    }

    if (preparingQueue.innerHTML === "") {

        showEmptyMessage(preparingQueue);

    }

    if (readyQueue.innerHTML === "") {

        showEmptyMessage(readyQueue);

    }


    addActionButtonEvents();

}


function updateCounts() {

    const waitingCount =
        allOrders.filter(function (order) {

            return order.order_status === "Pending";

        }).length;


    const preparingCount =
        allOrders.filter(function (order) {

            return order.order_status === "Preparing";

        }).length;


    const readyCount =
        allOrders.filter(function (order) {

            return order.order_status === "Ready";

        }).length;


    document.getElementById(
        "waitingSummaryCount"
    ).textContent = waitingCount;


    document.getElementById(
        "preparingSummaryCount"
    ).textContent = preparingCount;


    document.getElementById(
        "readySummaryCount"
    ).textContent = readyCount;


    document.getElementById(
        "activeSummaryCount"
    ).textContent = allOrders.length;


    document.getElementById(
        "waitingColumnCount"
    ).textContent = waitingCount;


    document.getElementById(
        "preparingColumnCount"
    ).textContent = preparingCount;


    document.getElementById(
        "readyColumnCount"
    ).textContent = readyCount;

}


async function loadOrders() {

    const accessToken =
        getAccessToken();


    if (!accessToken) {

        alert("Please log in to continue.");

        window.location.href =
            "/select-role";

        return;

    }


    try {

        const response =
            await fetch(
                "/api/orders/operator/all",
                {
                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Your operator session is invalid. Please log in again."
            );

            window.location.href =
                "/select-role";

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to retrieve orders."
            );

        }


        allOrders = data;

        updateCounts();

        displayOrders();

    }
    catch (error) {

        console.error(
            "Load queue error:",
            error
        );

    }

}


async function updateStatus(
    orderId,
    status
) {

    const accessToken =
        getAccessToken();


    try {

        const response =
            await fetch(
                `/api/orders/operator/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${accessToken}`
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update order status."
            );

        }


        await loadOrders();

    }
    catch (error) {

        console.error(
            "Update status error:",
            error
        );

        alert(error.message);

    }

}


async function collectOrder(orderId) {

    const accessToken =
        getAccessToken();


    try {

        const response =
            await fetch(
                `/api/orders/operator/${orderId}/collect`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to collect order."
            );

        }


        await loadOrders();

    }
    catch (error) {

        console.error(
            "Collect order error:",
            error
        );

        alert(error.message);

    }

}


function addActionButtonEvents() {

    const actionButtons =
        document.querySelectorAll(
            "[data-action]"
        );


    for (const button of actionButtons) {

        button.addEventListener(
            "click",
            async function () {

                const orderId =
                    Number(this.dataset.orderId);

                const action =
                    this.dataset.action;


                this.disabled = true;


                if (action === "Collected") {

                    await collectOrder(orderId);

                }
                else {

                    await updateStatus(
                        orderId,
                        action
                    );

                }


                this.disabled = false;

            }
        );

    }

}


queueSearch.addEventListener(
    "input",
    displayOrders
);


for (const button of filterButtons) {

    button.addEventListener(
        "click",
        function () {

            for (
                const filterButton
                of filterButtons
            ) {

                filterButton.classList.remove(
                    "active"
                );

            }


            this.classList.add("active");

            selectedStatus =
                this.dataset.status;

            displayOrders();

        }
    );

}


// Load orders when page opens
loadOrders();


// Retrieve updates every 5 seconds
setInterval(
    loadOrders,
    15000
);