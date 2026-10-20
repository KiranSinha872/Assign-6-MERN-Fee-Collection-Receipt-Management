
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./Config/db.js");
const authRoutes = require("./Routes/authRoutes");
const donorRoutes = require("./Routes/donorRoutes");
const bloodRequestRoutes = require("./Routes/BloodRequest");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Blood API is running",
        status: "Successful"
    });
});

const PORT = process.env.PORT || 5002;

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
