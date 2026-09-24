import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Certificates.css";

function Certificates() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [qrCode, setQrCode] = useState("");

  const [formData, setFormData] = useState({
    certificateId: "",
    certificateType: "Internship",
    course: "",
    batch: "",
    startDate: "",
    endDate: "",
    venue: "",
  });

  // =========================================
  // FETCH STUDENTS
  // =========================================

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/students");

        setStudents(response.data);
      } catch (error) {
        console.log("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  // =========================================
  // GET SELECTED STUDENT
  // =========================================

  const getSelectedStudent = () => {
    return students.find((student) => student._id === selectedStudent);
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const day = d.getDate();

    let suffix = "th";

    if (day >= 11 && day <= 13) {
      suffix = "th";
    } else if (day % 10 === 1) {
      suffix = "st";
    } else if (day % 10 === 2) {
      suffix = "nd";
    } else if (day % 10 === 3) {
      suffix = "rd";
    }

    const month = d.toLocaleString("en-US", {
      month: "long",
    });

    const year = d.getFullYear();

    return `${day}${suffix} ${month} ${year}`;
  };

  // =========================================
  // DURATION
  // =========================================

  const getCourseDuration = () => {
    if (!formData.startDate || !formData.endDate) {
      return "Course Duration";
    }

    return `${formatDate(formData.startDate)} to ${formatDate(
      formData.endDate,
    )}`;
  };

  // =========================================
  // STUDENT SELECTION
  // =========================================

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;

    setSelectedStudent(studentId);

    const student = students.find((item) => item._id === studentId);

    if (!student) {
      setQrCode("");

      setFormData({
        certificateId: "",
        certificateType: "Internship",
        course: "",
        batch: "",
        startDate: "",
        endDate: "",
        venue: "",
      });

      return;
    }

    // =========================================
    // GENERATE CERTIFICATE ID
    // =========================================

    const certificateId = `CERT-${Date.now()}`;

    // =========================================
    // AUTO FILL STUDENT DETAILS
    // =========================================

    setFormData({
      certificateId: certificateId,
      certificateType: "Internship",
      course: student.course || "",
      batch: student.batch || "",
      startDate: student.startDate ? student.startDate.substring(0, 10) : "",
      endDate: student.endDate ? student.endDate.substring(0, 10) : "",
      venue: "",
    });

    // =========================================
    // GENERATE QR CODE
    // =========================================

    try {
      const qrData = `Student Name: ${student.name}
Institute Name: Corporates Guide
Certificate Type: Internship
Course: ${student.course || ""}
Certificate ID: ${certificateId}`;

      const qrImage = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
      });

      setQrCode(qrImage);
    } catch (error) {
      console.error("QR Code generation failed:", error);
      setQrCode("");
    }
  };

  // =========================================
  // CERTIFICATE TYPE CHANGE
  // =========================================

  const handleCertificateTypeChange = async (e) => {
    const certificateType = e.target.value;

    setFormData((previousData) => ({
      ...previousData,
      certificateType: certificateType,
    }));

    const student = getSelectedStudent();

    if (!student || !formData.certificateId) {
      return;
    }

    // =========================================
    // UPDATE QR CODE
    // =========================================

    try {
      const qrData = `Student Name: ${student.name}
Institute Name: Corporates Guide
Certificate Type: ${certificateType}
Course: ${formData.course || ""}
Certificate ID: ${formData.certificateId}`;

      const qrImage = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
      });

      setQrCode(qrImage);
    } catch (error) {
      console.error("QR Code generation failed:", error);
    }
  };

  // =========================================
  // GENERATE PDF CERTIFICATE
  // =========================================

  const handleGenerateCertificate = async (e) => {
    e.preventDefault();

    // =========================================
    // CHECK STUDENT
    // =========================================

    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    const student = getSelectedStudent();

    if (!student) {
      alert("Student not found");
      return;
    }

    // =========================================
    // CHECK REQUIRED FIELDS
    // =========================================

    if (!formData.certificateId) {
      alert("Certificate ID is missing.");
      return;
    }

    if (!formData.course) {
      alert("Please enter course or workshop topic.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please enter starting date and ending date.");
      return;
    }

    if (formData.certificateType === "Workshop" && !formData.venue.trim()) {
      alert("Please enter workshop venue.");
      return;
    }

    try {
      // =========================================
      // STEP 1: SAVE CERTIFICATE TO DATABASE
      // =========================================

      await axios.post("http://localhost:5000/api/certificates", {
        certificateId: formData.certificateId,
        certificateType: formData.certificateType,
        student: student._id,
        studentName: student.name,
        course: formData.course,
        batch: formData.batch,
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: formData.certificateType === "Workshop" ? formData.venue : "",
      });

      // =========================================
      // STEP 2: GET CERTIFICATE ELEMENT
      // =========================================

      const certificateElement = document.getElementById("certificate");

      if (!certificateElement) {
        alert("Certificate template not found.");
        return;
      }

      // =========================================
      // STEP 3: CONVERT HTML TO CANVAS
      // =========================================

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // =========================================
      // STEP 4: CONVERT CANVAS TO IMAGE
      // =========================================

      const imageData = canvas.toDataURL("image/png");

      // =========================================
      // STEP 5: CREATE A4 LANDSCAPE PDF
      // =========================================

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // =========================================
      // STEP 6: GET PDF PAGE SIZE
      // =========================================

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // =========================================
      // STEP 7: ADD CERTIFICATE IMAGE TO PDF
      // =========================================

      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);

      // =========================================
      // STEP 8: DOWNLOAD PDF
      // =========================================

      pdf.save(`${student.name}-${formData.certificateType}-Certificate.pdf`);

      alert("Certificate created and downloaded as PDF!");

      // =========================================
      // RESET FORM
      // =========================================

      setSelectedStudent("");
      setQrCode("");

      setFormData({
        certificateId: "",
        certificateType: "Internship",
        course: "",
        batch: "",
        startDate: "",
        endDate: "",
        venue: "",
      });
    } catch (error) {
      console.log("Full Error:", error);
      console.log("Server Response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create certificate",
      );
    }
  };

  // =========================================
  // SELECTED STUDENT DATA
  // =========================================

  const selectedStudentData = getSelectedStudent();

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="certificates-page">
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="certificates-header">
        <h1>Certificate Management</h1>
        <p>Create and manage student certificates</p>
      </div>

      {/* =====================================
          FORM
      ===================================== */}

      <div className="certificate-form-container">
        <h2>Generate Certificate</h2>

        <form className="certificate-form" onSubmit={handleGenerateCertificate}>
          {/* STUDENT */}

          <div className="form-group">
            <label>Select Student</label>

            <select
              value={selectedStudent}
              onChange={handleStudentChange}
              required
            >
              <option value="">-- Select Student --</option>

              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* CERTIFICATE TYPE */}

          <div className="form-group">
            <label>Certificate Type</label>

            <select
              value={formData.certificateType}
              onChange={handleCertificateTypeChange}
              required
            >
              <option value="Internship">Internship Certificate</option>

              <option value="Workshop">Workshop Certificate</option>
            </select>
          </div>

          {/* CERTIFICATE ID */}

          <div className="form-group">
            <label>Certificate ID</label>

            <input
              type="text"
              value={formData.certificateId}
              readOnly
              placeholder="Certificate ID"
            />
          </div>

          {/* COURSE / WORKSHOP TOPIC */}

          <div className="form-group">
            <label>
              {formData.certificateType === "Internship"
                ? "Course"
                : "Workshop Topic"}
            </label>

            <input
              type="text"
              value={formData.course}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  course: e.target.value,
                })
              }
              placeholder={
                formData.certificateType === "Internship"
                  ? "Course Name"
                  : "Workshop Topic"
              }
              required
            />
          </div>

          {/* WORKSHOP VENUE - ONLY FOR WORKSHOP */}

          {formData.certificateType === "Workshop" && (
            <div className="form-group">
              <label>Workshop Venue</label>

              <input
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    venue: e.target.value,
                  })
                }
                placeholder="Workshop Venue"
                required
              />
            </div>
          )}

          {/* START DATE */}

          <div className="form-group">
            <label>
              {formData.certificateType === "Internship"
                ? "Course Starting Date"
                : "Workshop Starting Date"}
            </label>

            <input
              type="date"
              value={
                formData.startDate ? formData.startDate.substring(0, 10) : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate: e.target.value,
                })
              }
              required
            />
          </div>

          {/* END DATE */}

          <div className="form-group">
            <label>
              {formData.certificateType === "Internship"
                ? "Course Ending Date"
                : "Workshop Ending Date"}
            </label>

            <input
              type="date"
              value={formData.endDate ? formData.endDate.substring(0, 10) : ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate: e.target.value,
                })
              }
              required
            />
          </div>

          {/* DURATION */}

          <div className="form-group">
            <label>
              {formData.certificateType === "Internship"
                ? "Course Duration"
                : "Workshop Duration"}
            </label>

            <input type="text" value={getCourseDuration()} readOnly />
          </div>

          {/* QR PREVIEW */}

          {qrCode && (
            <div className="qr-preview">
              <p>Certificate QR Code</p>

              <img src={qrCode} alt="Certificate QR Code" />
            </div>
          )}

          {/* GENERATE BUTTON */}

          <button type="submit" className="generate-btn">
            Generate PDF Certificate
          </button>
        </form>
      </div>

      {/* =====================================
          CERTIFICATE TEMPLATE
      ===================================== */}

      <div
        id="certificate"
        className={`certificate-template ${
          formData.certificateType === "Workshop"
            ? "workshop-certificate"
            : "internship-certificate"
        }`}
      >
        {/* BLUE HEADER */}

        <div className="certificate-header-area">
          <div className="certificate-heading">
            <h1>CERTIFICATE</h1>

            <span>
              {formData.certificateType === "Internship"
                ? "OF COMPLETION"
                : "OF PARTICIPATION"}
            </span>
          </div>

          {/* CORPORATES GUIDE LOGO */}

          <img
            src="/cg-logo.jpg"
            alt="Corporates Guide"
            className="certificate-logo"
          />

          {/* BADGE */}

          <img
            src={
              formData.certificateType === "Workshop"
                ? "/image2.png"
                : "/image.png"
            }
            alt="Certificate Badge"
            className="certificate-badge"
          />
        </div>

        {/* GOLD CURVE */}

        <div className="gold-curve"></div>

        {/* WATERMARK TEXT */}

        <div className="certificate-watermark">CORPORATES GUIDE</div>

        {/* MAIN CERTIFICATE CONTENT */}

        <div className="certificate-content">
          {/* NAME */}

          <p className="certify-line">
            THIS IS TO CERTIFY THAT{" "}
            <strong>{selectedStudentData?.name || "STUDENT NAME"}</strong>
          </p>

          {/* =====================================
              INTERNSHIP CERTIFICATE
          ===================================== */}

          {formData.certificateType === "Internship" ? (
            <>
              <p className="main-description">
                Successfully completed their internship with{" "}
                <strong> Corporates Guide</strong>
              </p>

              <p className="batch-line">
                {" with the duration of "}

                <strong>
                  {formData.startDate && formData.endDate
                    ? getCourseDuration()
                    : " "}
                </strong>
              </p>

              <p className="course-line">
                During the internship{" "}
                <strong>{formData.course || "COURSE NAME"}</strong>
              </p>

              <p className="contribution-text">
                Contributed to: Active Participation during the training session
                and gaining basic understanding of the subject.
              </p>
            </>
          ) : (
            /* =====================================
                WORKSHOP CERTIFICATE
            ===================================== */

            <>
              <p className="main-description">
                Successfully participated in the workshop organized by
                <strong> Corporates Guide</strong>
              </p>

              <p className="batch-line">
                {" Workshop Held: "}

                <strong>
                  {formData.startDate && formData.endDate
                    ? getCourseDuration()
                    : " "}
                </strong>
              </p>

              <p className="course-line">
                On the topic of{" "}
                <strong>{formData.course || "WORKSHOP TOPIC"}</strong>
              </p>

              {/* VENUE - ONLY WORKSHOP */}

              <div className="workshop-venue">
                <h3>
                  <strong className="venue-label">Venue:</strong>

                  <strong className="venue-location">
                    {formData.venue || " "}
                  </strong>
                </h3>
              </div>

              <p className="contribution-text">
                Actively participated in the workshop and demonstrated
                enthusiasm for learning new concepts and skills.
              </p>
            </>
          )}

          {/* APPRECIATION */}

          <p className="appreciation-text">
            We appreciate your efforts and wish you great success in your future
            endeavors.
          </p>
        </div>

        {/* QR CODE */}

        {qrCode && (
          <img
            src={qrCode}
            alt="Certificate QR Code"
            className="certificate-qr"
          />
        )}

        {/* SIGNATURE + STAMP IMAGE */}

        <img
          src="/signature-stamp.png"
          alt="Authorized Signatures and Certification"
          className="signature-stamp"
        />
      </div>
    </div>
  );
}

export default Certificates;
