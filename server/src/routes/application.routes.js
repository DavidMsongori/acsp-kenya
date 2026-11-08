
import express from "express";

import {
  submitApplication,
  getMyApplication,
} from "../controllers/application.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All application endpoints require authentication
router.use(authenticateUser);

// Submit a new application
router.post("/", submitApplication);

// Retrieve the authenticated user's application
router.get("/me", getMyApplication);

export default router;
