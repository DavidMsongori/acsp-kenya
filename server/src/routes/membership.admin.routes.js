import express from "express";

import {
  getMembershipApplications,
  markMembershipApplicationUnderReview,
  reviewMembershipApplication,
} from "../controllers/membership.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All membership administration routes require authorised administrators.
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// ==========================================
// MEMBERSHIP APPLICATIONS
// ==========================================

router.get("/applications", getMembershipApplications);

router.patch(
  "/applications/:id/under-review",
  markMembershipApplicationUnderReview
);

router.patch(
  "/applications/:id/review",
  reviewMembershipApplication
);

export default router;