
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import countyRoutes from "./routes/county.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import necRoutes from "./routes/nec.routes.js";
import programmeRoutes from "./routes/programme.routes.js";
import programmeAdminRoutes from "./routes/programme.admin.routes.js";
import publicAssociationRoutes from "./routes/publicAssociation.routes.js";
import publicLeadershipRoutes from "./routes/publicLeadership.routes.js";
import secretariatRoutes from "./routes/secretariat.routes.js";

dotenv.config();

const app = express();

// ==========================================
// Middleware
// ==========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ==========================================
// API Routes
// ==========================================

app.use("/api/counties", countyRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/nec", necRoutes);

// Public national programmes
app.use("/api/programmes", programmeRoutes);

// Public verified county associations
app.use("/api/associations", publicAssociationRoutes);

// Public Leadership and General Assembly directory
app.use("/api/leadership", publicLeadershipRoutes);

// Protected administrator programme management
app.use("/api/admin/programmes", programmeAdminRoutes);

// Protected secretariat management
// National Secretariat directory
app.use("/api/leadership/secretariat", secretariatRoutes);

// ==========================================
// Root Route
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the ACSP-Kenya API",
  });
});

// ==========================================
// Health Check
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    application: "ACSP-Kenya",
    message: "API is running successfully",
  });
});

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ACSP-Kenya API running on port ${PORT}`);
});
