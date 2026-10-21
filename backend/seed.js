require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("./Config/db");
const User = require("./Models/User");
const FeeStructure = require("./Models/FeeStructure");
const Payment = require("./Models/Payment");

const makeReceiptGen = () => {
    const year = new Date().getFullYear();
    let seq = 0;
    return () => {
        seq += 1;
        return `RCP-${year}-${String(seq).padStart(4, "0")}`;
    };
};

const seed = async () => {
    await connectDB();

    await User.deleteMany({});
    await FeeStructure.deleteMany({});
    await Payment.deleteMany({});

    const generateReceiptNo = makeReceiptGen();

    console.log("Cleared existing data");

    const adminPassword = await bcrypt.hash("admin@1234", 10);
    const admin = await User.create({
        name: "Admin User",
        email: "admin@feedesk.com",
        password: adminPassword,
        phone: "9000000000",
        role: "Admin"
    });

    console.log("\n── Admin credentials ────────────────────────────────");
    console.log("  Email:    admin@feedesk.com");
    console.log("  Password: admin@1234");
    console.log("─────────────────────────────────────────────────────\n");

    const studentPassword = await bcrypt.hash("student@1234", 10);

    const studentData = [
        { name: "Aryan Sharma",    email: "aryan@student.com",   phone: "9111111111", rollNumber: "CS2401", course: "B.Tech CSE" },
        { name: "Priya Singh",     email: "priya@student.com",   phone: "9111111112", rollNumber: "CS2402", course: "B.Tech CSE" },
        { name: "Rohan Verma",     email: "rohan@student.com",   phone: "9111111113", rollNumber: "CS2403", course: "B.Tech CSE" },
        { name: "Sneha Gupta",     email: "sneha@student.com",   phone: "9111111114", rollNumber: "EC2401", course: "B.Tech ECE" },
        { name: "Karan Mehta",     email: "karan@student.com",   phone: "9111111115", rollNumber: "EC2402", course: "B.Tech ECE" },
        { name: "Pooja Jain",      email: "pooja@student.com",   phone: "9111111116", rollNumber: "ME2401", course: "B.Tech ME" },
        { name: "Amit Kumar",      email: "amit@student.com",    phone: "9111111117", rollNumber: "CS2404", course: "B.Tech CSE" },
        { name: "Divya Patel",     email: "divya@student.com",   phone: "9111111118", rollNumber: "EC2403", course: "B.Tech ECE" },
        { name: "Rahul Das",       email: "rahul@student.com",   phone: "9111111119", rollNumber: "ME2402", course: "B.Tech ME" },
        { name: "Ankita Mishra",   email: "ankita@student.com",  phone: "9111111120", rollNumber: "CS2405", course: "B.Tech CSE" }
    ];

    const students = await User.insertMany(
        studentData.map((s) => ({ ...s, password: studentPassword }))
    );

    console.log("── Test student credentials (all share same password) ───");
    console.log("  Password: student@1234");
    studentData.forEach((s) => {
        console.log(`  Email: ${s.email}  |  Roll: ${s.rollNumber}  |  Course: ${s.course}`);
    });
    console.log("────────────────────────────────────────────────────────\n");

    const pastDue  = new Date("2026-08-01");
    const futureDue = new Date("2026-12-31");

    const feeData = [
        { course: "B.Tech CSE", feeHead: "Tuition",   amount: 50000, dueDate: pastDue,   createdBy: admin._id },
        { course: "B.Tech CSE", feeHead: "Exam",       amount: 5000,  dueDate: pastDue,   createdBy: admin._id },
        { course: "B.Tech CSE", feeHead: "Transport",  amount: 8000,  dueDate: futureDue, createdBy: admin._id },
        { course: "B.Tech ECE", feeHead: "Tuition",   amount: 48000, dueDate: pastDue,   createdBy: admin._id },
        { course: "B.Tech ECE", feeHead: "Exam",       amount: 5000,  dueDate: pastDue,   createdBy: admin._id },
        { course: "B.Tech ECE", feeHead: "Transport",  amount: 8000,  dueDate: futureDue, createdBy: admin._id },
        { course: "B.Tech ME",  feeHead: "Tuition",   amount: 46000, dueDate: pastDue,   createdBy: admin._id },
        { course: "B.Tech ME",  feeHead: "Exam",       amount: 5000,  dueDate: pastDue,   createdBy: admin._id },
        { course: "B.Tech ME",  feeHead: "Transport",  amount: 8000,  dueDate: futureDue, createdBy: admin._id }
    ];

    const feeStructures = await FeeStructure.insertMany(feeData);

    const courseToFees = {};
    feeStructures.forEach((fs) => {
        if (!courseToFees[fs.course]) courseToFees[fs.course] = [];
        courseToFees[fs.course].push(fs);
    });

    const paymentDate = new Date("2026-09-15");

    const aryan = students[0];
    await Payment.create({
        student: aryan._id,
        feeStructure: courseToFees["B.Tech CSE"][0]._id,
        amount: 30000,
        paymentMode: "UPI",
        paymentDate,
        transactionRef: "UPI20260915001",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const priya = students[1];
    await Payment.create({
        student: priya._id,
        feeStructure: courseToFees["B.Tech CSE"][0]._id,
        amount: 50000,
        paymentMode: "Card",
        paymentDate,
        transactionRef: "CRD20260915001",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    await Payment.create({
        student: priya._id,
        feeStructure: courseToFees["B.Tech CSE"][1]._id,
        amount: 5000,
        paymentMode: "Cash",
        paymentDate,
        transactionRef: "",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const rohan = students[2];
    await Payment.create({
        student: rohan._id,
        feeStructure: courseToFees["B.Tech CSE"][0]._id,
        amount: 50000,
        paymentMode: "UPI",
        paymentDate,
        transactionRef: "UPI20260915002",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const sneha = students[3];
    await Payment.create({
        student: sneha._id,
        feeStructure: courseToFees["B.Tech ECE"][0]._id,
        amount: 20000,
        paymentMode: "Cash",
        paymentDate,
        transactionRef: "",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const karan = students[4];
    await Payment.create({
        student: karan._id,
        feeStructure: courseToFees["B.Tech ECE"][0]._id,
        amount: 48000,
        paymentMode: "Card",
        paymentDate,
        transactionRef: "CRD20260915002",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const pooja = students[5];
    await Payment.create({
        student: pooja._id,
        feeStructure: courseToFees["B.Tech ME"][0]._id,
        amount: 25000,
        paymentMode: "UPI",
        paymentDate,
        transactionRef: "UPI20260915003",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const amit = students[6];
    await Payment.create({
        student: amit._id,
        feeStructure: courseToFees["B.Tech CSE"][1]._id,
        amount: 5000,
        paymentMode: "Cash",
        paymentDate,
        transactionRef: "",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const divya = students[7];
    await Payment.create({
        student: divya._id,
        feeStructure: courseToFees["B.Tech ECE"][1]._id,
        amount: 5000,
        paymentMode: "UPI",
        paymentDate,
        transactionRef: "UPI20260915004",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const rahul = students[8];
    await Payment.create({
        student: rahul._id,
        feeStructure: courseToFees["B.Tech ME"][1]._id,
        amount: 5000,
        paymentMode: "Card",
        paymentDate,
        transactionRef: "CRD20260915003",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    const ankita = students[9];
    await Payment.create({
        student: ankita._id,
        feeStructure: courseToFees["B.Tech CSE"][0]._id,
        amount: 50000,
        paymentMode: "UPI",
        paymentDate,
        transactionRef: "UPI20260915005",
        receiptNo: generateReceiptNo(),
        recordedBy: admin._id
    });

    console.log("Seed complete. 1 admin + 10 students + 9 fee structures + 11 payments created.");

    mongoose.connection.close();
};

seed().catch((error) => {
    console.log("Seed failed:", error.message);
    process.exit(1);
});
