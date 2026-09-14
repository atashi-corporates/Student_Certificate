const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

// Test Route
router.get("/test", (req, res) => {
  res.send("Student routes are working");
});

// Add Student
router.post("/", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      message: "Student added successfully",
      student,
    });
  } catch (error) {
    console.log("STUDENT ERROR:", error.message);

    res.status(500).json({
      message: "Failed to add student",
      error: error.message,
    });
  }
});

// Get All Students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.log("FETCH STUDENTS ERROR:", error.message);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

// Get Student Count
router.get("/count", async (req, res) => {
  try {
    const count = await Student.countDocuments();

    res.status(200).json({
      totalStudents: count,
    });
  } catch (error) {
    console.log("COUNT ERROR:", error.message);

    res.status(500).json({
      message: "Failed to get student count",
      error: error.message,
    });
  }
});

// Update Student
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.log("UPDATE ERROR:", error.message);

    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
});

// Delete Student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ERROR:", error.message);

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
});

module.exports = router;