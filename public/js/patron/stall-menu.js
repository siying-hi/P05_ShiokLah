import { apiFetch } from "../utility/api.js";
import { loadPatronHygieneAlerts } from "./patronHygieneAlerts.js";

const params = new URLSearchParams(window.location.search);

const stallId = params.get("stall");

if (stallId) {

    sessionStorage.setItem("stallId", stallId);

}

//Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}

let cartItems = [];
let favouriteItemIds = [];

document.querySelector("#backBtn").addEventListener("click", () => {

    window.location.href = "/patron-homepage";

});

document.getElementById("cartPill").addEventListener("click", () => {

    window.location.href = "/checkout";

});

document.addEventListener("DOMContentLoaded", async () => {

    if (!stallId) {

        alert("Invalid stall.");

        window.location.href = "/patron-homepage";

        return;

    }

await loadCart();
await loadFavouriteItemIds();
await loadStallMenu(stallId);
await loadPatronHygieneAlerts();

});


async function loadCart() {

    try {

        const response = await apiFetch("/api/cart");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        cartItems = data.cartItems || [];
        updateCartCount();

    }
    catch (error) {

        console.error(error);

        cartItems = [];

    }

}
async function loadFavouriteItemIds() {

    try {

        const response = await apiFetch(
            "/api/favourites/ids"
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load favourites."
            );

        }

        favouriteItemIds =
            data.itemIds || [];

    }
    catch (error) {

        console.error(error);

        favouriteItemIds = [];

    }

}

function updateCartCount() {

    const badge = document.getElementById("cartCount");

    if (!badge) {
        return;
    }

    const totalQuantity = cartItems.reduce(

        (sum, item) => sum + item.quantity,

        0

    );

    badge.textContent = totalQuantity;

}

async function loadStallMenu(stallId) {

    try {

        const response = await apiFetch(
            `/api/stall-menu/${stallId}`
        );

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 403) {

                window.location.href = "/select-role";

                return;

            }

            throw new Error(
                data.message || "Unable to load stall."
            );

        }

        renderStallInfo(data.stall);

        renderMenu(data.menuItems);

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

function renderStallInfo(stall) {

    document.getElementById("stallImg").src =
        `/images/${stall.image_name}`;

    document.getElementById("stallName").textContent =
        stall.stall_name;

    document.getElementById("stallRating").textContent =
        stall.rating;

    document.getElementById("stallCuisine").textContent =
        stall.cuisine_type;

    document.getElementById("stallHygieneGrade").textContent =
        `Hygiene grade: ${stall.hygiene_grade || "Not graded"}`;

}

function renderMenu(menuItems) {

    const root = document.getElementById("menuRoot");

    root.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = "Menu";

    root.appendChild(heading);

        // No menu items
    if (!menuItems || menuItems.length === 0) {

        const message = document.createElement("p");

        message.className = "no-menu-message";

        message.textContent = "No menu items available for this stall.";

        root.appendChild(message);

        return;

    }

    const grid = document.createElement("div");
    grid.className = "menu-grid";

    root.appendChild(grid);

    menuItems.forEach(item => {

        const card = document.createElement("div");
        card.className = "menu-card";

        const img = document.createElement("img");
        img.className = "menu-img";
        img.src = `/images/${item.image_name}`;

        const title = document.createElement("div");
        title.className = "menu-title";
        title.textContent = item.item_name;

        const price = document.createElement("div");
        price.className = "menu-price";
        price.textContent = `$${Number(item.price).toFixed(2)}`;

        const description = document.createElement("p");

        description.className = "menu-description";

        description.textContent =
            item.food_description;


        const waitingTime = document.createElement("p");

        waitingTime.className = "menu-waiting";

        waitingTime.innerHTML =
            `⏱ ${item.estimated_waiting_time} mins`;


        const allergen = document.createElement("p");

        allergen.className = "menu-allergen";

        allergen.innerHTML =
            `⚠ ${item.allergen_info}`;

        // =========================
        // ACTIONS
        // =========================

        const actions = document.createElement("div");
        actions.className = "menu-actions";
        const heartBtn =
    document.createElement("button");

heartBtn.type = "button";
heartBtn.className = "heart-btn";


const heartIcon =
    document.createElement("span");

heartIcon.className = "heart-icon";
heartIcon.textContent = "♥";


if (
    favouriteItemIds.includes(
        item.item_id
    )
) {

    heartBtn.classList.add("active");

}


heartBtn.appendChild(heartIcon);


heartBtn.addEventListener(
    "click",
    async () => {

        try {

            heartBtn.disabled = true;

            const isFavourite =
                heartBtn.classList.contains(
                    "active"
                );

            let response;


            if (isFavourite) {

                response = await apiFetch(
                    `/api/favourites/${item.item_id}`,
                    {
                        method: "DELETE"
                    }
                );

            }
            else {

                response = await apiFetch(
                    `/api/favourites/${item.item_id}`,
                    {
                        method: "POST"
                    }
                );

            }


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to update favourite."
                );

                return;

            }


            if (isFavourite) {

                heartBtn.classList.remove(
                    "active"
                );

                favouriteItemIds =
                    favouriteItemIds.filter(
                        id =>
                            id !== item.item_id
                    );

            }
            else {

                heartBtn.classList.add(
                    "active"
                );

                favouriteItemIds.push(
                    item.item_id
                );

            }

        }
        catch (error) {

            console.error(error);

            alert(
                "Unable to update favourite."
            );

        }
        finally {

            heartBtn.disabled = false;

        }

    }
);

        const stepper = document.createElement("div");
        stepper.className = "qty-stepper";

        const minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.className = "qty-btn";
        minusBtn.innerHTML = "&minus;";

        const qtyVal = document.createElement("span");
        qtyVal.className = "qty-val";
        const existing = cartItems.find(
            cartItem => cartItem.item_id === item.item_id
        );

        qtyVal.textContent = existing
        ? existing.quantity
        : "0";

        const plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.className = "qty-btn qty-plus";
        plusBtn.innerHTML = "+";

        minusBtn.addEventListener("click", async () => {

            const qty = Number(qtyVal.textContent);

            if (qty === 0) {
                return;
            }

            try {

                let response;

                if (qty === 1) {

                    response = await apiFetch(`/api/cart/${item.item_id}`, {

                        method: "DELETE"

                    });

                }
                else {

                    response = await apiFetch("/api/cart", {

                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            itemId: item.item_id,
                            quantity: qty - 1

                        })

                    });

                }

                const data = await response.json();

                if (!response.ok) {

                    alert(data.message);
                    return;

                }

                const existing = cartItems.find(
                    cartItem => cartItem.item_id === item.item_id
                );

                existing.quantity--;

                if (existing.quantity === 0) {

                    cartItems = cartItems.filter(
                        cartItem => cartItem.item_id !== item.item_id
                    );

                    qtyVal.textContent = "0";

                }
                else {

                    qtyVal.textContent = existing.quantity;

                }

                updateCartCount();

            }

            catch (err) {

                console.error(err);
                alert("Unable to update cart.");

            }

});

       plusBtn.addEventListener("click", async () => {

            try {

                const qty = Number(qtyVal.textContent);

                let response;

                if (qty === 0) {

                    // Item not in cart yet
                    response = await apiFetch("/api/cart", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            itemId: item.item_id
                        })

                    });

                }
                else {

                    // Item already exists -> just update quantity
                    response = await apiFetch("/api/cart", {

                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            itemId: item.item_id,
                            quantity: qty + 1

                        })

                    });

                }

                const data = await response.json();

                if (!response.ok) {

                    alert(data.message);
                    return;

                }

                const existing = cartItems.find(
                    cartItem => cartItem.item_id === item.item_id
                );

                if (existing) {

                    existing.quantity++;

                    qtyVal.textContent = existing.quantity;

                }
                else {

                    cartItems.push({

                        item_id: item.item_id,
                        quantity: 1

                    });

                    qtyVal.textContent = "1";

                }

                updateCartCount();

            }
            catch (err) {

                console.error(err);
                alert("Unable to update cart.");

            }

        });

        stepper.appendChild(minusBtn);
        stepper.appendChild(qtyVal);
        stepper.appendChild(plusBtn);

actions.appendChild(heartBtn);
actions.appendChild(stepper);

        const content = document.createElement("div");

        content.appendChild(img);
        content.appendChild(title);
        content.appendChild(price);
        content.appendChild(description);
        content.appendChild(waitingTime);
        content.appendChild(allergen);

        card.appendChild(content);
        card.appendChild(actions);

        grid.appendChild(card);

    });

}

