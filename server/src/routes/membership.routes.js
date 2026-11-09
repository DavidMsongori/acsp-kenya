import express from "express";

import {
  submitMembershipApplication,
  getMyMembershipApplication,
} from "../controllers/membership.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All membership applicant routes require authentication.
router.use(authenticateUser);

// Submit a membership application.
router.post("/apply", submitMembershipApplication);

// Retrieve the authenticated user's application.
router.get("/my-application", getMyMembershipApplication);

export default router;