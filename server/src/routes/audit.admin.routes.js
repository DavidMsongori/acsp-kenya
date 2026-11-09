import express from "express";

import {
  getAuditLogs,
  getAuditLogStatistics,
  getAuditLogById,
} from "../controllers/audit.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ALL ROUTES REQUIRE AN AUTHENTICATED ADMINISTRATOR
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// GET AUDIT LOG STATISTICS
router.get("/statistics", getAuditLogStatistics);

// GET ALL AUDIT LOGS
router.get("/", getAuditLogs);

// GET SINGLE AUDIT LOG
router.get("/:id", getAuditLogById);

export default router;