const http = require("http");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { attachAnnouncementSocket } = require("./realtime/announcementSocket");

dotenv.config();

const getAllowedOrigins = () => {
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  const configuredOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = [frontendBaseUrl, ...configuredOrigins].map((value) => {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("FRONTEND_BASE_URL and CORS_ORIGINS must use HTTP or HTTPS.");
    }
    return url.origin;
  });
  return [...new Set(allowedOrigins)];
};

const validateStartupConfiguration = () => {
  const missing = ["MONGODB_URI", "JWT_SECRET", "FRONTEND_BASE_URL"].filter(
    (name) => !process.env[name]?.trim()
  );
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}.`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }
  if (!/^mongodb(?:\+srv)?:\/\//.test(process.env.MONGODB_URI)) {
    throw new Error("MONGODB_URI must be a MongoDB connection URI.");
  }

  const frontendUrl = new URL(process.env.FRONTEND_BASE_URL);
  if (process.env.NODE_ENV === "production" && frontendUrl.protocol !== "https:") {
    throw new Error("FRONTEND_BASE_URL must use HTTPS in production.");
  }
  return getAllowedOrigins();
};

const app = express();
const server = http.createServer(app);
const allowedOrigins = validateStartupConfiguration();
attachAnnouncementSocket(server, app, allowedOrigins);

// Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const facultyApprovalRoutes = require("./routes/facultyApprovalRoutes");
const hodRoutes = require("./routes/hodRoutes");
const hodApprovalRoutes = require("./routes/hodApprovalRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const placementRoutes = require("./routes/placementRoutes");
const eventRoutes = require("./routes/eventRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/faculty-approval", facultyApprovalRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/hod-approval", hodApprovalRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EduLentra Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected successfully");

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "0.0.0.0", resolve);
  });
  console.log(`EduLentra backend running on port ${PORT}`);
};

startServer().catch((error) => {
  const isMongoError = error.name?.includes("Mongo");
  console.error(
    "Backend startup failed:",
    isMongoError
      ? "Check the MongoDB URI, Atlas network access, and database credentials; connection details are not logged."
      : error.message
  );
  process.exitCode = 1;
});