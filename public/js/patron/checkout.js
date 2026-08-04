import { apiFetch } from "../utility/api.js";


//Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    window.location.href = "/select-role";

}

// Variables
let cartItems = [];

let selectedOrderMode = "Dine-In";

let selectedPaymentMethod = "Cash";

let subtotal = 0;

let packagingFee = 0;

let total = 0;

let hasDefaultVisa = false;
let selectedReward = null;

let discount = 0;

function showAlert(message) {

    if (Array.isArray(message)) {

        alert(message.join("\n"));

    } 
    else {

        alert(message);

    }

}


// Initialise page
document.addEventListener("DOMContentLoaded", async () => {

    await loadCart();
    await loadSelectedReward();
    await loadDefaultCard();

    initialiseOrderMode();

    initialisePaymentMethod();

    document
        .getElementById("placeOrderBtn")
        .addEventListener("click", placeOrder);

    document.getElementById("backBtn").addEventListener("click", () => {

        const stallId = sessionStorage.getItem("stallId");

        window.location.href = `/stall-menu?stall=${stallId}`;

    });

});


// Load Cart
async function loadCart() {

    try {

        const response = await apiFetch("/api/cart");

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 403) {

                window.location.href = "/select-role";

                return;

            }

            throw new Error(
                data.message || "Unable to load checkout."
            );

        }

        cartItems = data.cartItems || [];

        renderCart();

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// Render Cart
function renderCart() {

    const itemsRoot = document.getElementById("itemsRoot");

    const emptyState = document.getElementById("emptyState");

    itemsRoot.innerHTML = "";

    subtotal = 0;

    if (cartItems.length === 0) {

        emptyState.style.display = "block";

        updateTotals();

        return;

    }

    emptyState.style.display = "none";

    cartItems.forEach(item => {

        subtotal += Number(item.subtotal);

        const row = document.createElement("div");

        row.className = "item-row";

        row.innerHTML = `

            <div class="thumb">

                <img
                    src="/images/${item.image_name}"
                    alt="${item.item_name}"
                >

            </div>

            <div class="item-mid">

                <div class="item-name">

                    ${item.item_name}

                </div>

                <div class="item-sub">

                    <div class="qty">

                        <button 
                            class="decrease"
                            data-item="${item.item_id}">
                            -
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button 
                            class="increase"
                            data-item="${item.item_id}">
                            +
                        </button>

                    </div>

                </div>

            </div>

            <div class="price">

                $${Number(item.subtotal).toFixed(2)}

            </div>

        `;

        itemsRoot.appendChild(row);

    });

    document.querySelectorAll(".increase")
    .forEach(button => {

        button.addEventListener("click", () => {

            updateCartQuantity(
                button.dataset.item,
                1
            );

        });

    });


    document.querySelectorAll(".decrease")
    .forEach(button => {

        button.addEventListener("click", () => {

            updateCartQuantity(
                button.dataset.item,
                -1
            );

        });

    });

    updateTotals();

}

async function updateCartQuantity(itemId, change) {

    try {

        const item = cartItems.find(
            item => item.item_id == itemId
        );


        if (!item) {

            return;

        }


        const newQuantity = item.quantity + change;

        if (newQuantity === 0) {

            await removeCartItem(itemId);

            return;

        }

        const response = await apiFetch("/api/cart", {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                itemId: itemId,

                quantity: newQuantity

            })

        });


        const data = await response.json();


        if (!response.ok) {

            showAlert(
                data.message || data.error
            );

            return;

        }


        await loadCart();

    }
    catch(error) {

        console.error(error);

        showAlert(error.message);

    }

}

async function removeCartItem(itemId) {

    try {

        const response = await apiFetch(`/api/cart/${itemId}`, {

            method: "DELETE",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                itemId: itemId

            })

        });


        const data = await response.json();


        if (!response.ok) {

            showAlert(
                data.message || data.error
            );

            return;

        }


        await loadCart();

    }
    catch(error) {

        console.error(error);

        showAlert(error.message);

    }

}


// Order Mode
function initialiseOrderMode() {

    const buttons = document.querySelectorAll(".mode-btn");

    const note = document.getElementById("modeNote");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            selectedOrderMode =
                button.dataset.mode === "Self-Pickup"
                    ? "Self-Pickup"
                    : "Dine-In";

            note.style.display =
                selectedOrderMode === "Self-Pickup"
                    ? "block"
                    : "none";

            updateTotals();

        });

    });

    buttons[0].classList.add("active");

    selectedOrderMode =
        buttons[0].dataset.mode === "Self-Pickup"
            ? "Self-Pickup"
            : "Dine-In";

    updateTotals();

}

async function loadDefaultCard(){

    try{

        const response =
            await apiFetch("/api/cards/default");


        const data =
            await response.json();



        const display =
            document.getElementById("defaultVisaCard");


        if(data.hasDefaultCard){

            hasDefaultVisa = true;


            display.textContent =
                data.card.cardNumber;

            // Hide error message
            visaError.style.display = "none";

        }
        else{

            hasDefaultVisa = false;


            display.textContent =
                "No card selected";


            document
            .getElementById("visaError")
            .style.display="block";

        }


    }
    catch(error){

        console.error(error);

    }

}


// Payment Method
function initialisePaymentMethod() {

    const rows = document.querySelectorAll(".pay-row");

    rows.forEach(row => {

        row.addEventListener("click", () => {

            rows.forEach(r =>
                r.classList.remove("selected")
            );

            row.classList.add("selected");

            selectedPaymentMethod =
                row.dataset.method;

        });

    });

    rows[0].classList.add("selected");

    selectedPaymentMethod = rows[0].dataset.method;

}


// Totals
function updateTotals() {

    if (selectedOrderMode === "Self-Pickup") {

        const totalQuantity = cartItems.reduce(

            (sum, item) => sum + Number(item.quantity),

            0

        );

        packagingFee = totalQuantity * 0.30;

    }

    else {

        packagingFee = 0;

    }

    total = subtotal + packagingFee;
    discount = 0;

const voucherVal =
    document.getElementById(
        "voucherVal"
    );

const voucherError =
    document.getElementById(
        "voucherError"
    );

if (voucherError) {

    voucherError.textContent = "";

}

if (selectedReward) {

    const minimumSpend =
        Number(
            selectedReward.minimum_spend
        );

    const rewardValue =
        Number(
            selectedReward.reward_value
        );

    const rewardType =
        String(
            selectedReward.reward_type
        ).trim().toLowerCase();

    if (voucherVal) {

        voucherVal.textContent =
            selectedReward.reward_name;

    }

    if (subtotal < minimumSpend) {

        if (voucherError) {

            voucherError.textContent =
                `Minimum spending is $${minimumSpend.toFixed(2)}.`;

        }

    }
    else if (
        rewardType === "percentage"
    ) {

        discount =
            subtotal *
            (rewardValue / 100);

    }
    else if (
        rewardType === "fixed"
    ) {

        discount = rewardValue;

    }
    else if (
        rewardType === "free takeaway"
    ) {

        discount = packagingFee;

    }
    else if (
        rewardType === "free checkout"
    ) {

        discount =
            subtotal + packagingFee;

    }

    if (discount > total) {

        discount = total;

    }

    total = total - discount;

}
else {

    if (voucherVal) {

        voucherVal.textContent =
            "No voucher";

    }

}

    document.getElementById("subtotalVal").textContent =
        `$${subtotal.toFixed(2)}`;

    document.getElementById("packagingVal").textContent =
        `$${packagingFee.toFixed(2)}`;

    document.getElementById("packagingLabel").style.display =
        packagingFee > 0 ? "block" : "none";

    document.getElementById("packagingVal").style.display =
        packagingFee > 0 ? "block" : "none";

    document.getElementById("totalVal").textContent =
        `$${total.toFixed(2)}`;

    document.getElementById("totalValBreakdown").textContent =
        `$${total.toFixed(2)}`;

}
function loadSelectedReward() {

    const savedReward =
        sessionStorage.getItem(
            "selectedReward"
        );

    if (!savedReward) {

        selectedReward = null;

        return;

    }

    try {

        selectedReward =
            JSON.parse(savedReward);

    }
    catch (error) {

        console.error(error);

        selectedReward = null;

        sessionStorage.removeItem(
            "selectedReward"
        );

    }

    updateTotals();

}

// Place Order
async function placeOrder() {

    // Front-end validation
    if (
        selectedPaymentMethod === "Visa" &&
        !hasDefaultVisa
    ) {

        showAlert(
            "No default Visa card selected. Please select another payment method."
        );

        return;

    }

    try {

        const response = await apiFetch("/api/payment", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

body: JSON.stringify({

    orderMode: selectedOrderMode,

    paymentMethod: selectedPaymentMethod

})

        });

        const data = await response.json();

        if (!response.ok) {

            showAlert(data.error || data.message);

            return;

        }

        if (data.success) {
                sessionStorage.removeItem(
        "selectedReward"
    );

            window.location.href =
                `/payment-success?orderId=${data.orderId}`;

        }
        else {

            window.location.href =
                "/payment-failed";

        }

    }

    catch (error) {

        console.error(error);

        showAlert(error.message);

    }

}


// import { apiFetch } from "../utility/api.js";


// //Check if user has logged in
// const accessToken = sessionStorage.getItem("accessToken");

// if (!accessToken) {

//     window.location.href = "/select-role";

// }

// // Variables
// let cartItems = [];

// let selectedOrderMode = "Dine-In";

// let selectedPaymentMethod = "Cash";

// let subtotal = 0;

// let packagingFee = 0;

// let total = 0;

// let hasDefaultVisa = false;
// let selectedReward = null;

// let discount = 0;

// function showAlert(message) {

//     if (Array.isArray(message)) {

//         alert(message.join("\n"));

//     } 
//     else {

//         alert(message);

//     }

// }


// document.addEventListener("DOMContentLoaded", async () => {

//     await loadCart();

//     loadSelectedReward();

//     await loadDefaultCard();

//     initialiseOrderMode();

//     initialisePaymentMethod();

//     document
//         .getElementById("placeOrderBtn")
//         .addEventListener(
//             "click",
//             placeOrder
//         );

//     document
//         .getElementById("removeVoucherBtn")
//         .addEventListener(
//             "click",
//             removeSelectedReward
//         );

//     document
//         .getElementById("backBtn")
//         .addEventListener("click", () => {

//             const stallId =
//                 sessionStorage.getItem(
//                     "stallId"
//                 );

//             window.location.href =
//                 `/stall-menu?stall=${stallId}`;

//         });

// });


// // Load Cart
// async function loadCart() {

//     try {

//         const response = await apiFetch("/api/cart");

//         const data = await response.json();

//         if (!response.ok) {

//             if (response.status === 403) {

//                 window.location.href = "/select-role";

//                 return;

//             }

//             throw new Error(
//                 data.message || "Unable to load checkout."
//             );

//         }

//         cartItems = data.cartItems || [];

//         renderCart();

//     }
//     catch (error) {

//         console.error(error);

//         alert(error.message);

//     }

// }


// // Render Cart
// function renderCart() {

//     const itemsRoot = document.getElementById("itemsRoot");

//     const emptyState = document.getElementById("emptyState");

//     itemsRoot.innerHTML = "";

//     subtotal = 0;

//     if (cartItems.length === 0) {

//         emptyState.style.display = "block";

//         updateTotals();

//         return;

//     }

//     emptyState.style.display = "none";

//     cartItems.forEach(item => {

//         subtotal += Number(item.subtotal);

//         const row = document.createElement("div");

//         row.className = "item-row";

//         row.innerHTML = `

//             <div class="thumb">

//                 <img
//                     src="/images/${item.image_name}"
//                     alt="${item.item_name}"
//                 >

//             </div>

//             <div class="item-mid">

//                 <div class="item-name">

//                     ${item.item_name}

//                 </div>

//                 <div class="item-sub">

//                     <div class="qty">

//                         <button 
//                             class="decrease"
//                             data-item="${item.item_id}">
//                             -
//                         </button>

//                         <span>
//                             ${item.quantity}
//                         </span>

//                         <button 
//                             class="increase"
//                             data-item="${item.item_id}">
//                             +
//                         </button>

//                     </div>

//                 </div>

//             </div>

//             <div class="price">

//                 $${Number(item.subtotal).toFixed(2)}

//             </div>

//         `;

//         itemsRoot.appendChild(row);

//     });

//     document.querySelectorAll(".increase")
//     .forEach(button => {

//         button.addEventListener("click", () => {

//             updateCartQuantity(
//                 button.dataset.item,
//                 1
//             );

//         });

//     });


//     document.querySelectorAll(".decrease")
//     .forEach(button => {

//         button.addEventListener("click", () => {

//             updateCartQuantity(
//                 button.dataset.item,
//                 -1
//             );

//         });

//     });

//     updateTotals();

// }

// async function updateCartQuantity(itemId, change) {

//     try {

//         const item = cartItems.find(
//             item => item.item_id == itemId
//         );


//         if (!item) {

//             return;

//         }


//         const newQuantity = item.quantity + change;

//         if (newQuantity === 0) {

//             await removeCartItem(itemId);

//             return;

//         }

//         const response = await apiFetch("/api/cart", {

//             method: "PUT",

//             headers: {

//                 "Content-Type": "application/json"

//             },

//             body: JSON.stringify({

//                 itemId: itemId,

//                 quantity: newQuantity

//             })

//         });


//         const data = await response.json();


//         if (!response.ok) {

//             showAlert(
//                 data.message || data.error
//             );

//             return;

//         }


//         await loadCart();

//     }
//     catch(error) {

//         console.error(error);

//         showAlert(error.message);

//     }

// }

// async function removeCartItem(itemId) {

//     try {

//         const response = await apiFetch(`/api/cart/${itemId}`, {

//             method: "DELETE",

//             headers: {

//                 "Content-Type": "application/json"

//             },

//             body: JSON.stringify({

//                 itemId: itemId

//             })

//         });


//         const data = await response.json();


//         if (!response.ok) {

//             showAlert(
//                 data.message || data.error
//             );

//             return;

//         }


//         await loadCart();

//     }
//     catch(error) {

//         console.error(error);

//         showAlert(error.message);

//     }

// }


// // Order Mode
// function initialiseOrderMode() {

//     const buttons = document.querySelectorAll(".mode-btn");

//     const note = document.getElementById("modeNote");

//     buttons.forEach(button => {

//         button.addEventListener("click", () => {

//             buttons.forEach(btn =>
//                 btn.classList.remove("active")
//             );

//             button.classList.add("active");

//             selectedOrderMode =
//                 button.dataset.mode === "Self-Pickup"
//                     ? "Self-Pickup"
//                     : "Dine-In";

//             note.style.display =
//                 selectedOrderMode === "Self-Pickup"
//                     ? "block"
//                     : "none";

//             updateTotals();

//         });

//     });

//     buttons[0].classList.add("active");

//     selectedOrderMode =
//         buttons[0].dataset.mode === "Self-Pickup"
//             ? "Self-Pickup"
//             : "Dine-In";

//     updateTotals();

// }

// async function loadDefaultCard(){

//     try{

//         const response =
//             await apiFetch("/api/cards/default");


//         const data =
//             await response.json();



//         const display =
//             document.getElementById("defaultVisaCard");


//         if(data.hasDefaultCard){

//             hasDefaultVisa = true;


//             display.textContent =
//                 data.card.cardNumber;

//             // Hide error message
//             visaError.style.display = "none";

//         }
//         else{

//             hasDefaultVisa = false;


//             display.textContent =
//                 "No card selected";


//             document
//             .getElementById("visaError")
//             .style.display="block";

//         }


//     }
//     catch(error){

//         console.error(error);

//     }

// }


// // Payment Method
// function initialisePaymentMethod() {

//     const rows = document.querySelectorAll(".pay-row");

//     rows.forEach(row => {

//         row.addEventListener("click", () => {

//             rows.forEach(r =>
//                 r.classList.remove("selected")
//             );

//             row.classList.add("selected");

//             selectedPaymentMethod =
//                 row.dataset.method;

//         });

//     });

//     rows[0].classList.add("selected");

//     selectedPaymentMethod = rows[0].dataset.method;

// }
// function loadSelectedReward() {

//     const savedReward =
//         sessionStorage.getItem(
//             "selectedReward"
//         );

//     if (!savedReward) {

//         selectedReward = null;

//         updateTotals();

//         return;

//     }

//     try {

//         selectedReward =
//             JSON.parse(savedReward);

//     }
//     catch (error) {

//         console.error(error);

//         selectedReward = null;

//         sessionStorage.removeItem(
//             "selectedReward"
//         );

//     }

//     updateTotals();

// }


// // Remove selected reward
// function removeSelectedReward() {

//     selectedReward = null;

//     discount = 0;

//     sessionStorage.removeItem(
//         "selectedReward"
//     );

//     updateTotals();

// }


// // Totals
// function updateTotals() {

//     if (
//         selectedOrderMode ===
//         "Self-Pickup"
//     ) {

//         const totalQuantity =
//             cartItems.reduce(

//                 (sum, item) =>
//                     sum +
//                     Number(item.quantity),

//                 0

//             );

//         packagingFee =
//             totalQuantity * 0.30;

//     }
//     else {

//         packagingFee = 0;

//     }


//     discount = 0;


//     const voucherVal =
//         document.getElementById(
//             "voucherVal"
//         );

//     const voucherError =
//         document.getElementById(
//             "voucherError"
//         );

//     const removeVoucherBtn =
//         document.getElementById(
//             "removeVoucherBtn"
//         );


//     voucherError.textContent = "";


//     if (selectedReward) {

//         const minimumSpend =
//             Number(
//                 selectedReward.minimum_spend
//             );

//         const rewardValue =
//             Number(
//                 selectedReward.reward_value
//             );


//         voucherVal.textContent =
//             selectedReward.reward_name;

//         removeVoucherBtn.style.display =
//             "inline-block";


//         if (subtotal < minimumSpend) {

//             voucherError.textContent =
//                 `Minimum spending is $${minimumSpend.toFixed(2)}.`;

//         }
//         else if (
//             selectedReward.reward_type ===
//             "Percentage"
//         ) {

//             discount =
//                 subtotal *
//                 (
//                     rewardValue / 100
//                 );

//         }
//         else if (
//             selectedReward.reward_type ===
//             "Fixed"
//         ) {

//             discount = rewardValue;

//         }
//         else if (
//             selectedReward.reward_type ===
//             "Free Takeaway"
//         ) {

//             discount = packagingFee;

//         }

//     }
//     else {

//         voucherVal.textContent =
//             "No voucher";

//         removeVoucherBtn.style.display =
//             "none";

//     }


//     const beforeDiscount =
//         subtotal + packagingFee;


//     if (discount > beforeDiscount) {

//         discount = beforeDiscount;

//     }


//     total =
//         beforeDiscount - discount;


//     document
//         .getElementById(
//             "subtotalVal"
//         )
//         .textContent =
//             `$${subtotal.toFixed(2)}`;


//     document
//         .getElementById(
//             "packagingVal"
//         )
//         .textContent =
//             `$${packagingFee.toFixed(2)}`;


//     document
//         .getElementById(
//             "packagingLabel"
//         )
//         .style.display =
//             packagingFee > 0
//                 ? "block"
//                 : "none";


//     document
//         .getElementById(
//             "packagingVal"
//         )
//         .style.display =
//             packagingFee > 0
//                 ? "block"
//                 : "none";


//     document
//         .getElementById(
//             "totalVal"
//         )
//         .textContent =
//             `$${total.toFixed(2)}`;


//     document
//         .getElementById(
//             "totalValBreakdown"
//         )
//         .textContent =
//             `$${total.toFixed(2)}`;

// }


// // Place Order
// async function placeOrder() {


//     // Front-end validation
//     if (
//         selectedPaymentMethod === "Visa" &&
        !hasDefaultVisa
//     ) {

//         showAlert(
//             "No default Visa card selected. Please select another payment method."
//         );

//         return;

//     }


//     try {

//         const response =
//             await apiFetch(
//                 "/api/payment",
//                 {

//                     method: "POST",

//                     headers: {

//                         "Content-Type":
//                             "application/json"

//                     },

//                     body: JSON.stringify({

//                         orderMode:
//                             selectedOrderMode,

//                         paymentMethod:
//                             selectedPaymentMethod,

//                         // rewardId:
//                         //     selectedReward
//                         //         ? selectedReward.reward_id
//                         //         : null

//                     })

//                 }
//             );


//         const data =
//             await response.json();


//         if (!response.ok) {

//             showAlert(
//                 data.error ||
//                 data.message
//             );

//             return;

//         }


//         if (data.success) {

//             sessionStorage.removeItem(
//                 "selectedReward"
//             );

//             window.location.href =
//                 `/payment-success?orderId=${data.orderId}`;

//         }
//         else {

//             window.location.href =
//                 "/payment-failed";

//         }

//     }
//     catch (error) {

//         console.error(error);

//         showAlert(error.message);

//     }

// }