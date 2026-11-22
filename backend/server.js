const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  }),
);

app.use(express.json());

// Temporary OTP storage
const otpStorage = new Map();

// Gmail configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test backend
app.get("/", (req, res) => {
  res.send("Student Management Backend is running!");
});

// Send OTP
app.post("/send-otp", async (req, res) => {
  try {
    const { email, studentName } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const expiresAt = Date.now() + 5 * 60 * 1000;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Student Management System - Email Verification",
      text: `Hello ${studentName || "Student"},

Your email verification OTP is ${otp}.

This OTP is valid for 5 minutes.

Do not share this OTP with anyone.`,
    });

    otpStorage.set(normalizedEmail, {
      otp,
      expiresAt,
      attempts: 0,
    });

    res.json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send OTP. Please try again.",
    });
  }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStorage.get(normalizedEmail);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "Please request a new OTP.",
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStorage.delete(normalizedEmail);

    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request a new one.",
    });
  }

  record.attempts++;

  if (record.attempts > 5) {
    otpStorage.delete(normalizedEmail);

    return res.status(429).json({
      success: false,
      message: "Too many attempts. Request a new OTP.",
    });
  }

  if (String(otp).trim() !== record.otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  }

  otpStorage.delete(normalizedEmail);

  res.json({
    success: true,
    message: "Email verified successfully!",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
