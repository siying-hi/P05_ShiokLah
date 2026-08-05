import { apiFetch } from "../utility/api.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    window.location.href = "/select-role";

}

let cardModal;

let addCardBtn;

let closeCardModal;

let cancelCardBtn;

let cardForm;

let editingCardId = null;

let originalCardNumber = "";

let originalCVV = "";

document.addEventListener("DOMContentLoaded", () => {

    cardModal = document.getElementById("cardModal");

    addCardBtn = document.getElementById("addCardBtn");

    closeCardModal = document.getElementById("closeCardModal");

    cancelCardBtn = document.getElementById("cancelCardBtn");

    cardForm = document.getElementById("cardForm");

    loadProfile();

    loadCards();

    document
    .getElementById("cardsContainer")
    .addEventListener("click", handleCardClick);

    document
        .getElementById("editBtn")
        .addEventListener("click", enableEditing);

    document
        .getElementById("cancelBtn")
        .addEventListener("click", cancelEditing);

    document
        .getElementById("saveBtn")
        .addEventListener("click", saveProfile);

    document
    .getElementById("deleteBtn")
    .addEventListener("click", deleteAccount);

    addCardBtn.addEventListener("click", openCardPopup);

    closeCardModal.addEventListener("click", closeCardPopup);

    cancelCardBtn.addEventListener("click", closeCardPopup);

    cardModal.addEventListener("click", (event) => {

        if (event.target === cardModal) {

            closeCardPopup();

        }

    });

    cardForm.addEventListener("submit", (event) => {

        if (editingCardId) {

            updateCard(event);

        } 
        else {

            addCard(event);

        }

    });
});

function showAlert(message) {

    if (Array.isArray(message)) {

        alert(message.join("\n"));

    }
    else {

        alert(message);

    }

}

function openCardPopup() {

    editingCardId = null;

    cardForm.reset();

    cardModal.classList.add("show");

}

function closeCardPopup() {

    cardModal.classList.remove("show");

    cardForm.reset();

}


async function addCard(event) {

    event.preventDefault();

    const expiry = document.getElementById("expiryDate").value;
    // "2028-05"

    const [expiryYear, expiryMonth] = expiry.split("-");

    try {

        const response = await apiFetch(

            "/api/cards",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    cardholderName:
                    document.getElementById("cardholderName").value.trim(),

                    cardNumber:
                        document.getElementById("cardNumber").value.replace(/\s/g, ""),

                    expiryMonth,

                    expiryYear,

                    cvv:
                        document.getElementById("cvv").value

                })

            }

        );

        const data = await response.json();

        if (!response.ok) {

            showAlert(data.error || data.message);
            
            return;

        }

        alert(data.message);

        closeCardPopup();

        loadCards();

    }

    catch (error) {

        alert(error.message);

    }

}

async function updateCard(event) {

    event.preventDefault();


    const expiry =
        document.getElementById("expiryDate").value;


    const [expiryYear, expiryMonth] =
        expiry.split("-");

    const cardNumberInput =
    document.getElementById("cardNumber").value.trim();

    const cvvInput =
        document.getElementById("cvv").value.trim();


    const updatedCardNumber =
        cardNumberInput === originalCardNumber
        ? ""
        : cardNumberInput.replace(/\s/g,"");


    const updatedCVV =
        cvvInput === originalCVV
        ? ""
        : cvvInput;


    try {


        const response = await apiFetch(
            `/api/cards/${editingCardId}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                cardholderName:
                    document.getElementById("cardholderName").value.trim(),

                cardNumber:
                    updatedCardNumber,

                expiryMonth,

                expiryYear,

                cvv:
                    updatedCVV

                })

            }
        );


        const data = await response.json();


        if(!response.ok){

            console.log("Update card failed:", data);

            throw new Error(
                data.message || "Unable to update card."
            );

        }

        alert(data.message);


        editingCardId = null;


        closeCardPopup();


        loadCards();


    }
    catch(error){

        console.error(error);

        alert(error.message);

    }

}

async function loadCards() {

    try {

        const response =
            await apiFetch("/api/cards");

        const cards =
            await response.json();

        if (!response.ok) {

            throw new Error(cards.message);

        }

        const container =
            document.getElementById("cardsContainer");

        container.innerHTML = "";

        if (cards.length === 0) {

            container.innerHTML = `

                <p>No saved Visa cards.</p>

            `;

            return;

        }

        cards.forEach(card => {

            container.innerHTML += `

                <div class="saved-card">

                    <div class="card-top">

                        <div class="visa-title">

                            💳 VISA

                        </div>

                        ${card.isDefault
                            ? `<span class="default-badge">Default</span>`
                            : ""}

                    </div>

                    <div class="card-number">

                        ${card.cardNumber}

                    </div>

                    <div class="card-expiry">

                        Expires ${card.expiry}

                    </div>

                    <div class="card-actions">

                        <button 
                            class="default-card-btn"
                            data-id="${card.cardId}">
                            ${card.isDefault ? "Default" : "Set as Default"}
                        </button>

                        <button
                            class="edit-card-btn"
                            data-id="${card.cardId}">

                            Edit

                        </button>

                        <button
                            class="delete-card-btn"
                            data-id="${card.cardId}">

                            Delete

                        </button>

                    </div>

                </div>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}

function handleCardClick(event){

    const button = event.target;


    if(button.classList.contains("edit-card-btn")){

        const cardId = button.dataset.id;

        editCard(cardId);

    }


    if(button.classList.contains("default-card-btn")){

        const cardId = button.dataset.id;

        setDefaultCard(cardId);

    }


    if(button.classList.contains("delete-card-btn")){

        const cardId = button.dataset.id;

        deleteCard(cardId);

    }

}

async function editCard(cardId){

    try{

        const response = await apiFetch(`/api/cards/${cardId}`);

        const card = await response.json();


        if(!response.ok){

            console.log("Update card failed:", card);

            throw new Error(
                card.message || "Unable to update card."
            );

        }


        editingCardId = cardId;


        document.getElementById("cardholderName").value =
            card.cardholderName;


        // Display masked values
        document.getElementById("cardNumber").value =
            card.cardNumber;

        document.getElementById("cvv").value =
            card.cvv;


        // Store original values separately
        originalCardNumber = card.cardNumber;
        originalCVV = card.cvv;

        document.getElementById("expiryDate").value =
            `${card.expiryYear}-${String(card.expiryMonth).padStart(2,"0")}`;

        cardModal.classList.add("show");

    }
    catch(error){

        console.error(error);

        alert(error.message);

    }

}

async function setDefaultCard(cardId){

    try{

        const response = await apiFetch(
            `/api/cards/${cardId}/default`,
            {
                method:"PUT"
            }
        );


        const data = await response.json();

        if(!response.ok){

            console.log("Set default card failed:", data);

            throw new Error(
                data.message || "Unable to set as default card."
            );

        }


        alert(data.message);


        loadCards();


    }
    catch(error){

        console.error(error);

        alert(error.message);

    }

}

async function deleteCard(cardId){

    const confirmed = confirm(
        "Are you sure you want to remove this card?"
    );


    if(!confirmed){

        return;

    }


    try{

        const response = await apiFetch(
            `/api/cards/${cardId}`,
            {
                method:"DELETE"
            }
        );


        const data = await response.json();


        if(!response.ok){

            console.log("Delete card failed:", data);

            throw new Error(
                data.message || "Unable to delete card."
            );

        }


        alert(data.message);


        loadCards();


    }
    catch(error){

        console.error(error);

        alert(error.message);

    }

}

async function loadProfile() {

    try {

        const response = await apiFetch("/api/patron-profile");

        const user = await response.json();

        if (!response.ok) {
            
            if (response.status === 403) {

                window.location.href = "/select-role";
                return;

            }   
            throw new Error(
                user.message || "Unable to load profile."
            );
        }

        document.getElementById("profileTitle").textContent =
            `${user.first_name} ${user.last_name}`;

        document.getElementById("avatarIcon").textContent = "😄";

        document.getElementById("firstName").value =
            user.first_name;

        document.getElementById("lastName").value =
            user.last_name;

        document.getElementById("email").value =
            user.email;

        document.getElementById("username").value =
            user.username;

    }
    catch (error) {

        console.error(error);

        sessionStorage.clear();
        window.location.href = "/select-role";

    }

}

async function deleteAccount() {

    const confirmed = confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await apiFetch(
            "/api/patron-profile",
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.message);

        }

        alert("Your account has been deleted.");

        sessionStorage.clear();

        window.location.href = "/select-role";

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

function enableEditing() {

    document.getElementById("firstName").readOnly = false;
    document.getElementById("lastName").readOnly = false;
    document.getElementById("email").readOnly = false;
    document.getElementById("username").readOnly = false;

    document.getElementById("editBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "inline-flex";
    document.getElementById("cancelBtn").style.display = "inline-flex";
}

function cancelEditing() {

    document.getElementById("firstName").readOnly = true;
    document.getElementById("lastName").readOnly = true;
    document.getElementById("email").readOnly = true;
    document.getElementById("username").readOnly = true;

    document.getElementById("editBtn").style.display = "";
    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "none";

    loadProfile();

}

async function saveProfile() {

    try {

        const response = await apiFetch("/api/patron-profile", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                username: document.getElementById("username").value.trim(),
                firstName: document.getElementById("firstName").value.trim(),
                lastName: document.getElementById("lastName").value.trim(),
                email: document.getElementById("email").value.trim()

            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(

                Array.isArray(data.errors)
                    ? data.errors.join("\n")
                    : data.message || "Unable to update profile."

            );

            return;

        }

        alert(data.message);

        cancelEditing();

    }
    catch (error) {

        console.error(error);

        alert(error.message);

    }

}
// Frontend membership demonstration
const membershipBtn =
    document.getElementById(
        "membershipBtn"
    );

const membershipModal =
    document.getElementById(
        "membershipModal"
    );

const membershipSelect =
    document.getElementById(
        "membershipSelect"
    );

const saveMembershipBtn =
    document.getElementById(
        "saveMembershipBtn"
    );

const cancelMembershipBtn =
    document.getElementById(
        "cancelMembershipBtn"
    );

const membershipBadge =
    document.getElementById(
        "membershipBadge"
    );

const membershipDescription =
    document.getElementById(
        "membershipDescription"
    );

const membershipPoints =
    document.getElementById(
        "membershipPoints"
    );


function displayMembership() {

    const membership =
        localStorage.getItem(
            "shioklahMembership"
        ) || "Standard";

    membershipBadge.textContent =
        membership;

    membershipDescription.textContent =
        `Current membership: ${membership}`;

    if (
        membership ===
        "ShiokLah Member"
    ) {

        membershipPoints.textContent =
            "Membership bonus: 200 points";

    }
    else {

        membershipPoints.textContent =
            "Membership bonus: 0 points";

    }

    membershipSelect.value =
        membership;

}


if (
    membershipBtn &&
    membershipModal
) {

    membershipBtn.addEventListener(
        "click",
        () => {

            membershipModal.classList.add(
                "show"
            );

        }
    );

}


if (
    cancelMembershipBtn &&
    membershipModal
) {

    cancelMembershipBtn.addEventListener(
        "click",
        () => {

            membershipModal.classList.remove(
                "show"
            );

        }
    );

}


if (
    saveMembershipBtn &&
    membershipModal
) {

    saveMembershipBtn.addEventListener(
        "click",
        () => {

            const membership =
                membershipSelect.value;

            localStorage.setItem(
                "shioklahMembership",
                membership
            );

            displayMembership();

            membershipModal.classList.remove(
                "show"
            );

            alert(
                `Membership changed to ${membership}.`
            );

        }
    );

}


if (
    membershipBadge &&
    membershipDescription &&
    membershipPoints &&
    membershipSelect
) {

    displayMembership();

}