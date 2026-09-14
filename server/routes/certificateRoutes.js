const express = require("express");
const Certificate = require("../models/Certificate");

const router = express.Router();

// Test Route
router.get("/test", (req, res) => {
  res.send("Certificate routes are working");
});

// Get Certificate Count
router.get("/count", async (req, res) => {
  try {
    const count = await Certificate.countDocuments();

    res.status(200).json({
      totalCertificates: count,
    });
  } catch (error) {
    console.log("CERTIFICATE COUNT ERROR:", error.message);

    res.status(500).json({
      message: "Failed to get certificate count",
      error: error.message,
    });
  }
});

// Create Certificate
router.post("/", async (req, res) => {
  try {
    const certificate = await Certificate.create(req.body);

    res.status(201).json({
      message: "Certificate created successfully",
      certificate,
    });
  } catch (error) {
    console.log("CERTIFICATE ERROR:", error.message);

    res.status(500).json({
      message: "Failed to create certificate",
      error: error.message,
    });
  }
});

// Get All Certificates
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("student")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (error) {
    console.log("FETCH CERTIFICATES ERROR:", error.message);

    res.status(500).json({
      message: "Failed to fetch certificates",
      error: error.message,
    });
  }
});

module.exports = router;