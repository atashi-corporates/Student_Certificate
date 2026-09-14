import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        const studentResponse = await axios.get(
          "http://localhost:5000/api/students/count",
        );

        const certificateResponse = await axios.get(
          "http://localhost:5000/api/certificates/count",
        );

        setStudentCount(studentResponse.data.totalStudents);
        setCertificateCount(certificateResponse.data.totalCertificates);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchDashboardCounts();
  }, []);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="logo">🎓 CertifyAdmin</div>

        <nav>
          <Link to="/dashboard" className="active">
            🏠 Dashboard
          </Link>

          <Link to="/students">👨‍🎓 Students</Link>

          <Link to="/certificates">📜 Certificates</Link>

          <Link to="/verify">🔍 Verification</Link>
        </nav>

        <Link to="/" className="logout">
          🚪 Logout
        </Link>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Admin!</p>
          </div>

          <div className="admin">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon">👨‍🎓</div>
            <div>
              <p>Total Students</p>
              <h2>{studentCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📜</div>
            <div>
              <p>Total Certificates</p>
              <h2>{certificateCount}</h2>{" "}
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="action-grid">
            <Link to="/students" className="action-card">
              <span>👨‍🎓</span>
              <h3>Manage Students</h3>
              <p>Add, edit and manage students</p>
            </Link>

            <Link to="/certificates" className="action-card">
              <span>📜</span>
              <h3>Generate Certificate</h3>
              <p>Create a new certificate</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
