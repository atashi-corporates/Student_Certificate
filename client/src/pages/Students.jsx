import { useEffect, useState } from "react";
import axios from "axios";
import "./Students.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    startDate: "",
    endDate: "",
  });

  const [editingId, setEditingId] = useState(null);

  // =========================
  // Fetch Students
  // =========================

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/students");

      setStudents(response.data);
    } catch (error) {
      console.log("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // Handle Input
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Add / Update Student
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check date
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("Course ending date cannot be before starting date.");
      return;
    }

    try {
      if (editingId) {
        // Update Student
        await axios.put(
          `http://localhost:5000/api/students/${editingId}`,
          formData,
        );

        alert("Student updated successfully!");
      } else {
        // Add Student
        await axios.post("http://localhost:5000/api/students", formData);

        alert("Student added successfully!");
      }

      // Reset Form
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        startDate: "",
        endDate: "",
      });

      setEditingId(null);
      setShowForm(false);

      fetchStudents();
    } catch (error) {
      console.log("Full Error:", error);
      console.log("Server Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Operation failed",
      );
    }
  };

  // =========================
  // Edit Student
  // =========================

  const handleEdit = (student) => {
    setFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      course: student.course || "",
      startDate: student.startDate ? student.startDate.split("T")[0] : "",
      endDate: student.endDate ? student.endDate.split("T")[0] : "",
    });

    setEditingId(student._id);
    setShowForm(true);
  };

  // =========================
  // Delete Student
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);

      alert("Student deleted successfully!");

      fetchStudents();
    } catch (error) {
      console.log("Error deleting student:", error);

      alert("Failed to delete student");
    }
  };

  // =========================
  // Format Date
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const d = new Date(date);

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // Search Student
  // =========================

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      course: "",
      startDate: "",
      endDate: "",
    });

    setEditingId(null);
  };

  // =========================
  // JSX
  // =========================

  return (
    <div className="students-page">
      {/* ================= HEADER ================= */}

      <div className="students-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage all registered students</p>
        </div>

        <button
          className="add-btn"
          onClick={() => {
            if (showForm) {
              resetForm();
            }

            setShowForm(!showForm);
          }}
        >
          {showForm ? "Close Form" : "+ Add Student"}
        </button>
      </div>

      {/* ================= ADD / EDIT FORM ================= */}

      {showForm && (
        <div className="student-form-container">
          <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>

          <form className="student-form" onSubmit={handleSubmit}>
            {/* Student Name */}

            <input
              type="text"
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* Email */}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Phone */}

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            {/* Course */}

            <input
              type="text"
              name="course"
              placeholder="Course"
              value={formData.course}
              onChange={handleChange}
              required
            />

            {/* Starting Date */}

            <div className="date-field">
              <label>Course Starting Date</label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ending Date */}

            <div className="date-field">
              <label>Course Ending Date</label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit */}

            <button type="submit">
              {editingId ? "Update Student" : "Save Student"}
            </button>
          </form>
        </div>
      )}

      {/* ================= SEARCH ================= */}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search student by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= STUDENT TABLE ================= */}

      <div className="student-table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Course</th>

              <th>Starting Date</th>

              <th>Ending Date</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>

                  <td>{student.email}</td>

                  <td>{student.phone}</td>

                  <td>{student.course}</td>

                  <td>{formatDate(student.startDate)}</td>

                  <td>{formatDate(student.endDate)}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Students;
