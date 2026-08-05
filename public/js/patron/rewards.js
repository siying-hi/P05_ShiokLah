import {
    apiFetch
} from "../utility/api.js";


const accessToken =
    sessionStorage.getItem("accessToken");

if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}


const rewardsGrid =
    document.getElementById("rewards-grid");

const pointsValue =
    document.getElementById("pointsValue");

const checkInBtn =
    document.getElementById("checkInBtn");

const checkInMessage =
    document.getElementById("checkInMessage");

const rewardPopup =
    document.getElementById("reward-popup");

const popupTitle =
    document.getElementById("popup-title");

const popupText =
    document.getElementById("popup-text");

const popupClose =
    document.getElementById("popup-close");

const termsPopup =
    document.getElementById("terms-popup");

const openTerms =
    document.getElementById("open-terms");

const closeTerms =
    document.getElementById("terms-close");


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadPoints();

        await loadRewards();


    }
    
);
// Daily Check-In button
checkInBtn.addEventListener(
    "click",
    async () => {

        try {

            checkInBtn.disabled = true;


            const response =
                await apiFetch(
                    "/api/rewards/check-in",
                    {
                        method: "PUT"
                    }
                );


            const data =
                await response.json();


            checkInMessage.textContent =
                data.message;


            if (
                data.points !== undefined
            ) {

const membership =
    localStorage.getItem(
        "shioklahMembership"
    ) || "Standard";

const membershipBonus =
    membership === "ShiokLah Member"
        ? 200
        : 0;

pointsValue.textContent =
    Number(data.points) +
    membershipBonus;

            }


            checkInBtn.disabled = false;


            if (!response.ok) {

                return;

            }


            await loadRewards();

        }
        catch (error) {

            console.error(error);

            checkInMessage.textContent =
                "Daily check-in failed.";

            checkInBtn.disabled = false;

        }

    }
);

// Get patron's points
// Load patron points
async function loadPoints() {

    try {

        const response =
            await apiFetch(
                "/api/rewards/points"
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load points."
            );

        }

        const databasePoints =
            Number(data.points) || 0;

        const membership =
            localStorage.getItem(
                "shioklahMembership"
            );

        let membershipBonus = 0;

        if (
            membership ===
            "ShiokLah Member"
        ) {

            membershipBonus = 200;

        }

        const displayedPoints =
            databasePoints +
            membershipBonus;

        document
            .getElementById(
                "pointsValue"
            )
            .textContent =
                displayedPoints;

    }
    catch (error) {

        console.error(
            "Error loading points:",
            error
        );

    }

}


// Get patron's rewards
async function loadRewards() {

    try {

        const response =
            await apiFetch("/api/rewards");

        const rewards =
            await response.json();

        if (!response.ok) {

            throw new Error(
                rewards.message ||
                "Unable to load rewards."
            );

        }

        renderRewards(rewards);

        await showNewRewardNotifications(
            rewards
        );

    }
    catch (error) {

        console.error(error);

        rewardsGrid.innerHTML = `
            <p>
                Unable to load rewards.
            </p>
        `;

    }

}


// Display reward cards
function renderRewards(rewards) {

    rewardsGrid.innerHTML = "";

    if (rewards.length === 0) {

        rewardsGrid.innerHTML = `
            <p>
                You do not have any rewards yet.
                Submit feedback to unlock one!
            </p>
        `;

        return;

    }

    rewards.forEach(reward => {

        const card =
            document.createElement("div");

        card.className = "card";

        const expired =
            reward.expiry_date &&
            new Date(reward.expiry_date) <
            new Date();

        if (
            reward.is_used ||
            !reward.can_use ||
            expired
        ) {

            card.classList.add("locked");

        }

        let buttonText =
            "Use voucher";

        if (reward.is_used) {

            buttonText = "Voucher used";

        }
        else if (expired) {

            buttonText = "Voucher expired";

        }
        else if (!reward.can_use) {

            buttonText =
                `Requires ${reward.points_required} points`;

        }

        let minimumSpendText = "";

        if (
            Number(reward.minimum_spend) > 0
        ) {

            minimumSpendText = `
                <p>
                    Minimum spend:
                    $${Number(
                        reward.minimum_spend
                    ).toFixed(2)}
                </p>
            `;

        }

        card.innerHTML = `

            <div class="icon">
                🎁
            </div>

            <h2>
                ${reward.reward_name}
            </h2>

            <p>
                ${reward.reward_description || ""}
            </p>

            ${minimumSpendText}

            <p>
                Points required:
                ${reward.points_required}
            </p>

            <div class="code-box">
                ${reward.reward_code || "No code"}
            </div>

<button
    type="button"
    class="btn use-reward-btn"
    data-id="${reward.reward_id}"
>
    ${buttonText}
</button>
        `;
const useButton =
    card.querySelector(
        ".use-reward-btn"
    );

useButton.addEventListener(
    "click",
    async () => {

        await selectReward(
            reward.reward_id,
            rewards
        );

    }
);
        rewardsGrid.appendChild(card);

    });



}
function showRewardMessage(
    title,
    message
) {

    popupTitle.textContent =
        title;

    popupText.textContent =
        message;

    rewardPopup.classList.add(
        "show"
    );

}

async function selectReward(
    rewardId,
    rewards
) {

    const reward =
        rewards.find(
            item =>
                item.reward_id ==
                rewardId
        );


    if (!reward) {

        showRewardMessage(
            "Reward Error",
            "Reward could not be found."
        );

        return;

    }


    if (reward.is_used) {

        showRewardMessage(
            "Voucher Already Used",
            "You have already used this voucher."
        );

        return;

    }


    const expired =
        reward.expiry_date &&
        new Date(reward.expiry_date)
            < new Date();


    if (expired) {

        showRewardMessage(
            "Voucher Expired",
            "This voucher has expired."
        );

        return;

    }


    const currentPoints =
        Number(
            reward.patron_points
        );

    const requiredPoints =
        Number(
            reward.points_required
        );


    if (
        currentPoints <
        requiredPoints
    ) {

        const pointsNeeded =
            requiredPoints -
            currentPoints;

alert(
    `Not enough points. You need ${pointsNeeded} more point${pointsNeeded === 1 ? "" : "s"} to use this reward.`
);

        return;

    }


    if (!reward.can_use) {

        showRewardMessage(
            "Reward Unavailable",
            "This reward is currently unavailable."
        );

        return;

    }
    try {

    const cartResponse =
        await apiFetch("/api/cart");

    const cartData =
        await cartResponse.json();


    if (!cartResponse.ok) {

        showRewardMessage(
            "Unable to Check Cart",
            cartData.message ||
            "Your cart could not be checked."
        );

        return;

    }


    const cartItems =
        cartData.cartItems || [];


    const cartSubtotal =
        cartItems.reduce(

            (total, item) =>
                total +
                Number(item.subtotal),

            0

        );


    const minimumSpend =
        Number(
            reward.minimum_spend
        );


    if (
        cartSubtotal <
        minimumSpend
    ) {

        const amountNeeded =
            minimumSpend -
            cartSubtotal;

        showRewardMessage(

            "Minimum Spending Not Met",

            `Your cart subtotal is $${cartSubtotal.toFixed(2)}. Add $${amountNeeded.toFixed(2)} more to use this voucher.`

        );

        return;

    }

}
catch (error) {

    console.error(error);

    showRewardMessage(
        "Unable to Check Cart",
        "Please try again."
    );

    return;

}


    const selectedReward = {

        reward_id:
            reward.reward_id,

        reward_name:
            reward.reward_name,

        reward_type:
            reward.reward_type,

        reward_value:
            Number(
                reward.reward_value
            ),

        minimum_spend:
            Number(
                reward.minimum_spend
            )

    };
const useResponse =
    await apiFetch(
        `/api/rewards/${reward.reward_id}/use`,
        {
            method: "DELETE"
        }
    );

const useData =
    await useResponse.json();

if (!useResponse.ok) {

    showRewardMessage(
        "Unable to Use Reward",
        useData.message ||
        "The reward could not be used."
    );

    return;

}

    sessionStorage.setItem(
        "selectedReward",
        JSON.stringify(
            selectedReward
        )
    );


    showRewardMessage(
        "Voucher Selected",
        `${reward.reward_name} will be applied during checkout.`
    );


    setTimeout(() => {

        window.location.href =
            "/checkout";

    }, 1000);

}

// Show notification for new rewards
async function showNewRewardNotifications(
    rewards
) {

    const newRewards =
        rewards.filter(
            reward => reward.is_new
        );

    if (newRewards.length === 0) {

        return;

    }

    const rewardNames =
        newRewards
            .map(reward =>
                reward.reward_name
            )
            .join(", ");

    popupTitle.textContent =
        "New Reward Unlocked! 🎁";

    popupText.textContent =
        `You received: ${rewardNames}`;

    rewardPopup.classList.add("show");

    for (const reward of newRewards) {

        await apiFetch(
            `/api/rewards/${reward.reward_id}/seen`,
            {
                method: "PUT"
            }
        );

    }

}


// Close reward notification
popupClose.addEventListener(
    "click",
    () => {

        rewardPopup.classList.remove("show");

    }
);


// Terms and conditions
if (openTerms && termsPopup) {

    openTerms.addEventListener(
        "click",
        () => {

            termsPopup.classList.add("show");

        }
    );

}


if (closeTerms && termsPopup) {

    closeTerms.addEventListener(
        "click",
        () => {

            termsPopup.classList.remove("show");

        }
    );

}
// Lucky Spin
const wheel =
    document.getElementById("wheel");

const spinButton =
    document.getElementById("lucky-spin");

const spinTimer =
    document.getElementById("spin-timer");

const wheelContext =
    wheel.getContext("2d");

const spinPrizes = [
    "1 Point",
    "Try Again",
    "2 Points",
    "$2 Voucher",
    "5 Points",
    "Better Luck"
];

const spinColours = [
    "#ff8c3a",
    "#ffd400",
    "#ffb347",
    "#e47329",
    "#ffc966",
    "#ff9f5a"
];

const spinCooldown =
    48 * 60 * 60 * 1000;


// Draw the wheel
function drawWheel() {

    const centre =
        wheel.width / 2;

    const radius =
        wheel.width / 2;

    const sectionAngle =
        (2 * Math.PI) /
        spinPrizes.length;

    wheelContext.clearRect(
        0,
        0,
        wheel.width,
        wheel.height
    );

    spinPrizes.forEach(
        function (prize, index) {

            const startAngle =
                index * sectionAngle;

            const endAngle =
                startAngle +
                sectionAngle;

            wheelContext.beginPath();

            wheelContext.moveTo(
                centre,
                centre
            );

            wheelContext.arc(
                centre,
                centre,
                radius,
                startAngle,
                endAngle
            );

            wheelContext.closePath();

            wheelContext.fillStyle =
                spinColours[index];

            wheelContext.fill();

            wheelContext.strokeStyle =
                "#ffffff";

            wheelContext.lineWidth = 3;

            wheelContext.stroke();


            wheelContext.save();

            wheelContext.translate(
                centre,
                centre
            );

            wheelContext.rotate(
                startAngle +
                sectionAngle / 2
            );

            wheelContext.textAlign =
                "right";

            wheelContext.fillStyle =
                "#ffffff";

            wheelContext.font =
                "bold 14px Arial";

            wheelContext.fillText(
                prize,
                radius - 18,
                5
            );

            wheelContext.restore();

        }
    );


    // Centre circle
    wheelContext.beginPath();

    wheelContext.arc(
        centre,
        centre,
        25,
        0,
        2 * Math.PI
    );

    wheelContext.fillStyle =
        "#ffffff";

    wheelContext.fill();

    wheelContext.strokeStyle =
        "#ff8c3a";

    wheelContext.lineWidth = 4;

    wheelContext.stroke();

}


// Check the 48-hour cooldown
function updateSpinButton() {

    const lastSpin =
        Number(
            localStorage.getItem(
                "shiok_spin_cooldown_v1"
            )
        );

    if (!lastSpin) {

        spinButton.disabled = false;

        spinButton.textContent = "Spin";

        spinTimer.textContent = "";

        return;

    }

    const timeRemaining =
        spinCooldown -
        (Date.now() - lastSpin);

    if (timeRemaining <= 0) {

        spinButton.disabled = false;

        spinButton.textContent = "Spin";

        spinTimer.textContent = "";

        return;

    }

    spinButton.disabled = true;

    spinButton.textContent =
        "Come back later";

    const hours =
        Math.floor(
            timeRemaining /
            (60 * 60 * 1000)
        );

    const minutes =
        Math.floor(
            (
                timeRemaining %
                (60 * 60 * 1000)
            ) /
            (60 * 1000)
        );

    spinTimer.textContent =
        `Next spin in ${hours}h ${minutes}m`;

}


// Spin button
spinButton.addEventListener(
    "click",
    function () {

        if (spinButton.disabled) {

            return;

        }

        spinButton.disabled = true;

        const winningIndex =
            Math.floor(
                Math.random() *
                spinPrizes.length
            );

        const sectionDegrees =
            360 /
            spinPrizes.length;

        const finalRotation =
            360 * 5 +
            (
                360 -
                (
                    winningIndex *
                    sectionDegrees +
                    sectionDegrees / 2
                )
            );

        wheel.style.transition =
            "transform 4s ease-out";

        wheel.style.transform =
            `rotate(${finalRotation}deg)`;

        setTimeout(
            function () {

                const prize =
                    spinPrizes[
                        winningIndex
                    ];

                localStorage.setItem(
                    "shiok_spin_cooldown_v1",
                    Date.now()
                );

                showRewardMessage(
                    "Lucky Spin Result 🎉",
                    `You won: ${prize}`
                );

                updateSpinButton();

            },
            4000
        );

    }
);


// Draw immediately when the page loads
drawWheel();

updateSpinButton();

setInterval(
    updateSpinButton,
    60000
);