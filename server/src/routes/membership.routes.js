
import express from "express";

import {
  submitMembershipApplication,
  getMyMembershipApplication,
  submitIndividualMembershipApplication,
  getMyIndividualMembershipApplication,
} from "../controllers/membership.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All membership applicant routes require authentication.
router.use(authenticateUser);

// ==========================================
// COUNTY ASSOCIATION MEMBERSHIP
// ==========================================

// Submit a County Association membership application.
router.post("/apply", submitMembershipApplication);

// Retrieve the authenticated user's County Association application.
router.get("/my-application", getMyMembershipApplication);

// ==========================================
// INDIVIDUAL STUDENT MEMBERSHIP
// ==========================================

// Submit an individual student membership application.
router.post(
  "/individual/apply",
  submitIndividualMembershipApplication
);

// Retrieve the authenticated student's application.
router.get(
  "/individual/my-application",
  getMyIndividualMembershipApplication
);

export default router;
