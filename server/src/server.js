
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

// ==========================================
// ROUTE IMPORTS
// ==========================================

// County and application routes
import countyRoutes from "./routes/county.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

// NEC and association routes
import necRoutes from "./routes/nec.routes.js";
import publicAssociationRoutes from "./routes/publicAssociation.routes.js";

// Leadership routes
import publicLeadershipRoutes from "./routes/publicLeadership.routes.js";
import secretariatRoutes from "./routes/secretariat.routes.js";

// Programmes routes
import programmeRoutes from "./routes/programme.routes.js";
import programmeAdminRoutes from "./routes/programme.admin.routes.js";

// Membership routes
import membershipRoutes from "./routes/membership.routes.js";
import membershipAdminRoutes from "./routes/membership.admin.routes.js";

// Events routes
import eventRoutes from "./routes/event.routes.js";
import eventAdminRoutes from "./routes/event.admin.routes.js";

// Announcements routes
import announcementRoutes from "./routes/announcement.routes.js";
import announcementAdminRoutes from "./routes/announcement.admin.routes.js";

// Contacts routes
import contactRoutes from "./routes/contact.routes.js";
import contactAdminRoutes from "./routes/contact.admin.routes.js";

// Audit and logging routes
import auditRoutes from "./routes/audit.admin.routes.js";

// Administration routes
import administratorAdminRoutes from "./routes/administrator.admin.routes.js";

// Settings routes
import settingsRoutes from "./routes/settings.admin.routes.js";

// Profile routes
import profileRoutes from "./routes/profile.admin.routes.js";

// Association - Membership routes
import associationMembersRoutes from "./routes/association.members.routes.js";

// Association Profile routes
import associationProfileRoutes from "./routes/profile.association.routes.js";

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
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
// PUBLIC API ROUTES
// ==========================================

// County information
app.use("/api/counties", countyRoutes);

// File uploads
app.use("/api/uploads", uploadRoutes);

// Applications
app.use("/api/applications", applicationRoutes);

// Public announcements
app.use("/api/announcements", announcementRoutes);

// Public membership applications
app.use("/api/membership", membershipRoutes);

// Public contact messages
app.use("/api/contact", contactRoutes);

// Public programmes
app.use("/api/programmes", programmeRoutes);

// Public events
app.use("/api/events", eventRoutes);

// Public associations
app.use("/api/associations", publicAssociationRoutes);

// Public leadership and secretariat directory
app.use("/api/leadership", publicLeadershipRoutes);
app.use("/api/leadership/secretariat", secretariatRoutes);

// ==========================================
// PROTECTED ADMINISTRATION ROUTES
// ==========================================

// National Executive Council
app.use("/api/nec", necRoutes);

// County Association members
app.use("/api/association", associationMembersRoutes);

// County Association profile
app.use("/api/association/profile", associationProfileRoutes);

// Membership management
app.use("/api/admin/membership", membershipAdminRoutes);

// Contact management
app.use("/api/admin/contact", contactAdminRoutes);

// Programme management
app.use("/api/admin/programmes", programmeAdminRoutes);

// Event management
app.use("/api/admin/events", eventAdminRoutes);

// Announcement management
app.use("/api/admin/announcements", announcementAdminRoutes);

// Audit and logging
app.use("/api/admin/audit-logs", auditRoutes);

// Administrator management
app.use("/api/admin/administrators", administratorAdminRoutes);

// Application settings
app.use("/api/admin/settings", settingsRoutes);

// Profile management
app.use("/api/admin/profile", profileRoutes);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the ACSP-Kenya API",
  });
});

// ==========================================
// HEALTH CHECK
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
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ACSP-Kenya API running on port ${PORT}`);
});
