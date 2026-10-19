const dns = require("dns");
const http = require("http");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { attachAnnouncementSocket } = require("./realtime/announcementSocket");

dotenv.config();

const app = express();
const server = http.createServer(app);
attachAnnouncementSocket(server, app);

// Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const facultyApprovalRoutes = require("./routes/facultyApprovalRoutes");
const hodRoutes = require("./routes/hodRoutes");
const hodApprovalRoutes = require("./routes/hodApprovalRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/faculty-approval", facultyApprovalRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/hod-approval", hodApprovalRoutes);
app.use("/api/announcements", announcementRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EduLentra Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    server.listen(PORT, () => {
      console.log(`EduLentra backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });