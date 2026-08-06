const stallBoard =
    document.getElementById("stallBoard");
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




function createOrderCard(order) {

    const queueNumber =
        createQueueNumber(order.order_id);

    const minutes =
        calculateMinutes(order.time_created);

    return `
        <article class="stall-order-card">
            <div class="stall-order-heading">
                <strong>${queueNumber}</strong>

                <span class="status-badge
                    ${getStatusClass(order.order_status)}">
                    ${getDisplayStatus(order.order_status)}
                </span>
            </div>

            <div class="stall-order-details">
                <span>Order #${order.order_id}</span>

                <span>
                    ${order.item_count || 0} item(s)
                </span>

                <span>
                    ${minutes} min(s)
                </span>
            </div>
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
function createStatusCards(orders) {

    if (orders.length === 0) {

        return `
            <p class="empty-status-message">
                No orders
            </p>
        `;

    }

    return orders
        .map(function (order) {

            return createOrderCard(order);

        })
        .join("");
}

function displayOrders() {

    stallBoard.innerHTML = "";

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

    if (filteredOrders.length === 0) {

        stallBoard.innerHTML = `
            <div class="empty-queue-message">
                No active orders found.
            </div>
        `;

        return;
    }

    const stallGroups = {};

    for (const order of filteredOrders) {

        const stallName =
            order.stall_name || "Unknown Stall";

        if (!stallGroups[stallName]) {

            stallGroups[stallName] = [];

        }

        stallGroups[stallName].push(order);

    }

    for (const stallName in stallGroups) {

        const stallOrders =
            stallGroups[stallName];

        const waitingOrders =
            stallOrders.filter(function (order) {

                return order.order_status === "Pending";

            });

        const preparingOrders =
            stallOrders.filter(function (order) {

                return order.order_status === "Preparing";

            });

        const readyOrders =
            stallOrders.filter(function (order) {

                return order.order_status === "Ready";

            });

        const waitingCards =
            createStatusCards(waitingOrders);

        const preparingCards =
            createStatusCards(preparingOrders);

        const readyCards =
            createStatusCards(readyOrders);

        const stallColumn = `
            <article class="stall-column">
                <div class="stall-heading">
                    <div>
                        <span class="stall-label">
                            STALL
                        </span>

                        <h2>${stallName}</h2>
                    </div>

                    <span class="stall-order-count">
                        ${stallOrders.length} active
                    </span>
                </div>

                <section class="stall-status-section">
                    <div class="stall-status-heading">
                        <div>
                            <span class="column-dot waiting-dot"></span>
                            <h3>Waiting</h3>
                        </div>

                        <span>${waitingOrders.length}</span>
                    </div>

                    <div class="stall-order-list">
                        ${waitingCards}
                    </div>
                </section>

                <section class="stall-status-section">
                    <div class="stall-status-heading">
                        <div>
                            <span class="column-dot preparing-dot"></span>
                            <h3>Preparing</h3>
                        </div>

                        <span>${preparingOrders.length}</span>
                    </div>

                    <div class="stall-order-list">
                        ${preparingCards}
                    </div>
                </section>

                <section class="stall-status-section">
                    <div class="stall-status-heading">
                        <div>
                            <span class="column-dot ready-dot"></span>
                            <h3>Ready</h3>
                        </div>

                        <span>${readyOrders.length}</span>
                    </div>

                    <div class="stall-order-list">
                        ${readyCards}
                    </div>
                </section>
            </article>
        `;

        stallBoard.insertAdjacentHTML(
            "beforeend",
            stallColumn
        );

    }
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