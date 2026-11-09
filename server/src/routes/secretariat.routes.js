
import express from "express";

import {
  getSecretariatDirectory,
  appointSecretariatMember,
  searchSecretariatCandidates,
  getSecretariatAppointments,
} from "../controllers/secretariat.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ==========================================
// PUBLIC SECRETARIAT DIRECTORY
// ==========================================

router.get("/", getSecretariatDirectory);

// ==========================================
// PROTECTED SECRETARIAT MANAGEMENT
// ==========================================

router.post(
  "/appointments",
  authenticateUser,
  authorizeRoles("super_admin"),
  appointSecretariatMember
);

router.get(
  "/candidates",
  authenticateUser,
  authorizeRoles("super_admin"),
  searchSecretariatCandidates
);

router.get(
  "/appointments",
  authenticateUser,
  authorizeRoles("super_admin"),
  getSecretariatAppointments
);

export default router;
