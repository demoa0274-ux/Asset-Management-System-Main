const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const adminUserRoutes = require("./routes/adminUserRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const userImportRoutes = require("./routes/userImportRoutes");

const app = express();

// -------------------- SECURITY --------------------
app.use(helmet());
app.disable("x-powered-by");

// -------------------- CORS (FIXED) --------------------
const allowedOrigins = [
  process.env.CLIENT_URL,        // http://192.168.0.50:88
  process.env.CLIENT_URL_VITE,   // same as above
  "http://localhost:3001",
  "http://127.0.0.1:3001"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return cb(null, false); // ❗ do NOT throw error
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight requests (VERY IMPORTANT)
app.options("*", cors());

// -------------------- BODY PARSER --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// -------------------- LOGGING --------------------
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// -------------------- STATIC FILES --------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- RATE LIMIT --------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});

// -------------------- ROUTES --------------------
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/branches", require("./routes/branchRoutes"));
app.use("/api/password", require("./routes/passwordRoutes"));
app.use("/api/service-stations", require("./routes/serviceStationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api", require("./routes/assetMetaRoutes"));
app.use("/api", require("./routes/assetTransferRoutes"));
app.use("/api/maintenance", require("./routes/assetMaintenanceRoutes"));
app.use("/api/assets", require("./routes/assetImportRoutes"));
app.use("/api/asset-history", require("./routes/assetHistoryRoutes"));
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/assets", require("./routes/assetRoutes"));
app.use("/api/users", userImportRoutes);
app.use("/api/files", require("./routes/fileRoutes"));

// -------------------- ROOT --------------------
app.get("/", (req, res) => {
  res.json({ message: "Project IMS backend running" });
});

// -------------------- 404 --------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -------------------- ERROR HANDLER --------------------
app.use(errorHandler);

module.exports = app;