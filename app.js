const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const session = require("express-session");
const path = require("path");
const swaggerUi = require("swagger-ui-express");//Swagger
const swaggerDocument = require("./swagger-output.json"); // Import generated spec

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "neaOfficerProfileSecret",
    resave: false,
    saveUninitialized: false
  })
);

// Routes
const userRoutes = require("./routes/userRoutes");
const patronRoutes = require("./routes/patronRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const neaOfficerRoutes = require("./routes/neaOfficerRoutes");
const complaintsRoutes = require("./routes/complaintsRoutes");
const hygieneRoutes = require("./routes/hygieneRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const stallRoutes = require("./routes/stallRoutes");
const creditRoutes = require("./routes/creditRoutes");
const feedbackRoutes = require("./routes/feedbackRoute");
// const orderHistoryRoutes = require("./routes/orderHistoryRoutes");
// const favouriteRoutes = require("./routes/favOrderHistoryRoutes");
const orderHistoryRoutes = require("./routes/orderHistoryRoutes");
const orderHistoryFavRoutes = require("./routes/favOrderHistoryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const rewardRoutes =
    require("./routes/rewardsRoutes");
//Swagger Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//aadya complaints routs
const ComplaintsRoutes = require("./routes/patronComplaintRoutes(aadya)");
const menuItemfavouriteRoutes =
    require("./routes/favouriteRoutes");


// Static files
app.use(express.static(path.join(__dirname, "public")));
const cleaningRoutes = require("./routes/cleaningRoutes");
const orderRoutes = require("./routes/orderRoute");
// // const creditRoutes = require("./routes/creditRoutes");

// NEA Officer HTML pages
app.get("/nea-officer/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "home.html"));
});

app.get("/nea-officer/cleaning", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "cleaning.html"));
});

app.get("/nea-officer/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "profile.html"));
});

app.get("/nea-officer/profile/edit", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "editProfile.html"));
});

app.get("/nea-officer/profile/change-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "changePassword.html"));
});

app.get("/nea-officer/profile/notifications", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "notificationSettings.html"));
});

app.get("/nea-officer/complaints", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "complaints.html"));
});

app.get("/nea-officer/hygiene-grades", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "hygieneGrades.html"));
});

app.get("/nea-officer/morning-inspection-report", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "morningInspectionReport.html"));
});

app.get("/nea-officer/certificates", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "nea officer", "certificates.html"));
});

// NEA Officer JS files
app.get("/nea-officer/home.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "js", "nea officer", "home.js"));
});

app.get("/nea-officer/profile.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "js", "nea officer", "profile.js"));
});

app.get("/nea-officer/complaints.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "js", "nea officer", "complaints.js"));
});

app.get("/nea-officer/hygieneGrades.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "js", "nea officer", "hygieneGrades.js"));
});

app.get("/nea-officer/certificates.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "js", "nea officer", "certificates.js"));
});

app.get("/nea-officer/cleaning.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "js", "nea officer", "Cleaning.js"));
});
// Route to serve the Feedback HTML page
app.get("/feedback", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "patron", "Feedback.html"));
});
app.get("/favourites", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "patron",
            "Favourites.html"
        )
    );
});
app.get("/rewards", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "patron",
            "rewards.html"
        )
    );

});

app.get("/queueManagement", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "operator",
      "digitalqueue.html"
    )
  );
});
// app.get("/logout", (req, res) => {
//   req.session.destroy(() => {
//     res.redirect("/user/select-role.html");
//   });
// });
// Static files
app.use(express.static(path.join(__dirname, "public")));


// API routes
app.use("/api/nea-officer", neaOfficerRoutes);
app.use("/api/nea-officer/hygiene", hygieneRoutes);
app.use("/api/nea-officer/certificates", certificateRoutes);
app.use("/api/nea-officer/cleaning-submissions", cleaningRoutes);
app.use("/api/stalls", stallRoutes);
//aadya complaints 
app.use("/api/complaint", ComplaintsRoutes);
// Route for Order APIs
app.use("/api/orders", orderRoutes);
app.use("/", vendorRoutes);
app.use("/", userRoutes);
app.use("/", patronRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/", creditRoutes);
app.use("/api/complaints", complaintsRoutes);



app.use(
    "/api/favourites",
    menuItemfavouriteRoutes
);
app.use(
    "/api/rewards",
    rewardRoutes
);
app.get("/order-status", (req, res) => {
    res.sendFile(path.join(__dirname,"public","patron", "OrderStatus.html"));
});



app.use("/api/order-history", orderHistoryRoutes);
// Route for order history page

app.get("/order-history", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "patron", "OrderHistory.html"));
});

/**
 * @swagger
 * /api/order-history-favourites:
 *   get:
 *     summary: Get all favourite orders for the logged-in patron
 *     tags:
 *       - Order History Favourites
 *     responses:
 *       200:
 *         description: List of favourite orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   historyId:
 *                     type: integer
 *                   patronId:
 *                     type: integer
 *                   customName:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
app.use("/api/order-history-favourites", orderHistoryFavRoutes);


// Route for analytics page
app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "patron", "Analytics.html"));
});
app.use("/analytics", analyticsRoutes);

//Route for operator page
app.use(express.static("public")); 
app.use("/operator", operatorRoutes);



// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/select-role`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});



