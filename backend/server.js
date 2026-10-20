
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./Config/db.js");
const authRoutes = require("./Routes/authRoutes");
const feeRoutes = require("./Routes/feeRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const dashboardRoutes = require("./Routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "FeeDesk API is running",
        status: "Successful"
    });
});

// Global error handler
app.use((err, req, res, next) => {

    res.status(500).json({
        message: "Internal server error"
    });
});

const PORT = process.env.PORT || 5002;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
