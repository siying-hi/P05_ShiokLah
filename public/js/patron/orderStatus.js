//Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}
document.addEventListener("DOMContentLoaded", () => {

    const statusContainer = document.getElementById("statusContainer");

    // Store all timers so they don't duplicate
    const orderTimers = {};

    // ===========================
    // Load Orders
    // ===========================

    async function loadOrders() {

        try {

    const response = await fetch(
        "/api/orders",
        {
            headers: {
                Authorization:
                    `Bearer ${accessToken}`
            }
        }
    );

        if (!response.ok) {
            throw new Error("Unable to load orders.");
        }

        const result = await response.json();

        const orders = result.data || result;

        statusContainer.innerHTML = "";

        if (!orders.length) {

            statusContainer.innerHTML = `
                <div class="loading">

                    <h2>🎉 No Active Orders</h2>

                    <p>Your current orders have all been collected.</p>

                </div>
            `;

            return;

        }

        renderOrders(orders);

    }

        catch (err) {

            console.error(err);

            statusContainer.innerHTML = `

                <div class="loading">

                    <h2>Unable to load orders.</h2>

                    <p>Please try again later.</p>

                </div>

            `;

        }

    }

    // ===========================
    // PUT Order Status
    // ===========================

    async function updateStatus(orderId, status) {

        try {

            const response = await fetch(`/api/orders/${orderId}`, {

                method: "PUT",

headers: {

    "Content-Type": "application/json",

    Authorization:
        `Bearer ${accessToken}`

},

                body: JSON.stringify({

                    status

                })

            });

            if (!response.ok) {

                throw new Error("Status update failed.");

            }

        }

        catch (err) {

            console.error(err);

        }

    }

    // ===========================
    // Collect Order
    // ===========================

async function collectOrder(orderId) {

    try {

        const response = await fetch(

            `/api/orders/${orderId}/collect`,

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
                "Collect failed."
            );

        }

        alert(data.message);

        await loadOrders();

    }
    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

    // ===========================
    // Render ALL Orders
    // ===========================

   function renderOrders(orderRows) {

    statusContainer.innerHTML = "";

    const groupedOrders = {};


    orderRows.forEach(row => {

        if (!groupedOrders[row.order_id]) {

            groupedOrders[row.order_id] = {

                ...row,

                items: []

            };

        }


        groupedOrders[row.order_id]
            .items.push({

                item_id:
                    row.item_id,

                item_name:
                    row.item_name,

                quantity:
                    Number(row.quantity),

                price:
                    Number(row.price),

                image_name:
                    row.image_name

            });

    });


    const orders =
        Object.values(groupedOrders);


    orders.forEach(order => {

        renderSingleOrder(order);

    });

}


// Render one complete order
function renderSingleOrder(order) {

    let progress = 0;

    let title = "";

    let message = "";

    let actionHTML = "";


    const status =
        order.order_status.toLowerCase();


    switch (status) {

        case "pending":

            progress = 10;

            title =
                "Current Order Status";

            message =
                "Your order has been received.";

            actionHTML =
                "<h3>Waiting for stall...</h3>";


            if (
                !orderTimers[
                    order.order_id
                ]
            ) {

                orderTimers[
                    order.order_id
                ] = setTimeout(
                    async () => {

                        delete orderTimers[
                            order.order_id
                        ];

                        await updateStatus(
                            order.order_id,
                            "Preparing"
                        );

                        loadOrders();

                    },
                    15000
                );

            }

            break;


        case "preparing":

            progress = 60;

            title = "Preparing";

            message =
                "We're preparing your delicious meal.";

            actionHTML =
                "<h3>Cooking 👨‍🍳</h3>";


            if (
                !orderTimers[
                    order.order_id
                ]
            ) {

                orderTimers[
                    order.order_id
                ] = setTimeout(
                    async () => {

                        delete orderTimers[
                            order.order_id
                        ];

                        await updateStatus(
                            order.order_id,
                            "Ready"
                        );

                        loadOrders();

                    },
                    15000
                );

            }

            break;


        case "ready":

            progress = 100;

            title =
                "Ready For Collection";

            message =
                "Please collect your order.";

            actionHTML = `

                <button
                    class="collect-btn"
                    data-id="${order.order_id}"
                >
                    Collect Order
                </button>

            `;

            break;


        case "completed":

            progress = 100;

            title = "Completed";

            message = "Enjoy your meal!";

            actionHTML =
                "<h3>Collected ✔</h3>";

            break;

    }


    const itemsHTML =
        order.items.map(item => {

            const itemTotal =
                item.price *
                item.quantity;

            return `

                <div class="receipt-item">

                    <div class="receipt-item-name">

                        <strong>
                            ${item.item_name}
                        </strong>

                        <span>
                            $${item.price.toFixed(2)}
                            each
                        </span>

                    </div>

                    <div class="receipt-quantity">

                        ×${item.quantity}

                    </div>

                    <div class="receipt-price">

                        $${itemTotal.toFixed(2)}

                    </div>

                </div>

            `;

        }).join("");


    statusContainer.insertAdjacentHTML(

        "beforeend",

        `

        <div class="order-box">

            <div class="order-left">

                <div class="receipt-heading">

                    <div>

                        <h2>
                            🍽 Order #${order.order_id}
                        </h2>

                        <p>
                            ${order.stall_name}
                        </p>

                    </div>

                    <span
                        class="status ${status}"
                    >
                        ${order.order_status}
                    </span>

                </div>


                <div class="receipt-divider"></div>


                <div class="receipt-labels">

                    <span>Item</span>

                    <span>Qty</span>

                    <span>Price</span>

                </div>


                <div class="receipt-items">

                    ${itemsHTML}

                </div>


                <div class="receipt-divider"></div>


                <div class="receipt-summary">

                    <div>

                        <span>Subtotal</span>

                        <strong>
                            $${Number(
                                order.subtotal
                            ).toFixed(2)}
                        </strong>

                    </div>

                    <div>

                        <span>Packaging fee</span>

                        <strong>
                            $${Number(
                                order.packaging_fee
                            ).toFixed(2)}
                        </strong>

                    </div>

                    <div class="receipt-total">

                        <span>Total</span>

                        <strong>
                            $${Number(
                                order.total_price
                            ).toFixed(2)}
                        </strong>

                    </div>

                </div>


                <p class="receipt-date">

                    <strong>Ordered:</strong>

                    ${new Date(
                        order.time_created
                    ).toLocaleString()}

                </p>

            </div>


            <div class="order-right">

                <div class="clock-box">

                    <div class="clock">
                        🕒
                    </div>

                    <h3>${title}</h3>

                    <p>${message}</p>

                    ${actionHTML}

                </div>

            </div>


            <div class="progress-card">

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width: ${progress}%"
                    ></div>

                </div>

                <div class="progress-labels">

                    <span>Pending</span>

                    <span>Preparing</span>

                    <span>Ready</span>

                    <span>Completed</span>

                </div>

            </div>

        </div>

        <br>

        `

    );


    if (status === "ready") {

        const button =
            document.querySelector(

                `.collect-btn[data-id="${order.order_id}"]`

            );


        if (button) {

            button.addEventListener(
                "click",
                async () => {

                    button.disabled = true;

                    button.innerText =
                        "Collecting...";

                    await collectOrder(
                        order.order_id
                    );

                }
            );

        }

    }

}


        // ===========================
    // Auto Refresh Orders
    // ===========================

    // Reload every 5 seconds so patrons don't need
    // to press a refresh button.

    setInterval(() => {

        loadOrders();

    }, 5000);

    // Load immediately when page opens

    loadOrders();
        // ===========================
    // Hawker Quiz
    // ===========================

    const quiz = [

        {
            question: "Which dish is Singapore most famous for?",
            answers: ["Chicken Rice","Sushi","Pizza","Tacos"],
            correct:0
        },

        {
            question:"Satay is usually served with...?",
            answers:["Peanut Sauce","Ketchup","Cheese","Gravy"],
            correct:0
        },

        {
            question:"Laksa is mainly...?",
            answers:["Noodles","Rice","Burger","Soup only"],
            correct:0
        },

        {
            question:"Which drink is a Singapore favourite?",
            answers:["Bubble Tea","Teh Tarik","Milkshake","Latte"],
            correct:1
        },

        {
            question:"What colour is Kaya?",
            answers:["Blue","Green","Purple","Red"],
            correct:1
        },

        {
            question:"Chilli Crab is usually eaten with...",
            answers:["Mantou","Breadsticks","Naan","Fries"],
            correct:0
        }

    ];

    let current = 0;
    let score = 0;

    const question = document.getElementById("question");
    const answers = document.getElementById("answers");
    const next = document.getElementById("nextQuestion");
    const scoreText = document.getElementById("score");

    function loadQuiz(){

        if(!question || !answers) return;

        const q = quiz[current];

        question.textContent = q.question;

        answers.innerHTML = "";

        q.answers.forEach((answer,index)=>{

            const btn = document.createElement("button");

            btn.className = "answer";

            btn.textContent = answer;

            btn.onclick = ()=>{

                document.querySelectorAll(".answer").forEach(b=>b.disabled=true);

                if(index===q.correct){

                    btn.classList.add("correct");

                    score++;

                }

                else{

                    btn.classList.add("wrong");

                }

                scoreText.textContent = `Score: ${score}`;

            };

            answers.appendChild(btn);

        });

    }

    if(next){

        next.addEventListener("click",()=>{

            current++;

            if(current>=quiz.length){

                current=0;

            }

            loadQuiz();

        });

    }

    loadQuiz();

    // ===========================
    // Hawker Facts
    // ===========================

    const facts=[

        "🇸🇬 Singapore Hawker Culture became UNESCO Heritage in 2020.",

        "🍜 Chicken Rice is Singapore's national dish.",

        "🥟 Satay originated from street hawkers.",

        "🥥 Kaya is made using coconut, eggs and pandan.",

        "🦀 Chilli Crab is one of Singapore's iconic dishes.",

        "🥤 Teh Tarik literally means 'Pulled Tea'."

    ];

    let factIndex=0;

    const factText=document.getElementById("factText");

    if(factText){

        factText.textContent=facts[0];

        setInterval(()=>{

            factIndex++;

            if(factIndex>=facts.length){

                factIndex=0;

            }

            factText.textContent=facts[factIndex];

        },5000);

    }

});