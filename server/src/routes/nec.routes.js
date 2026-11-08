import express from "express";

import {
  getApplications,
  markApplicationUnderReview,
  reviewApplication,
  getAssociations,
  verifyAssociation,
  verifyCountyPresident,
} from "../controllers/nec.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All NEC routes require authentication and an authorised role.
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// ==========================================
// COUNTY PRESIDENT APPLICATIONS
// ==========================================

router.get("/applications", getApplications);

router.patch(
  "/applications/:id/under-review",
  markApplicationUnderReview
);

router.patch(
  "/applications/:id/review",
  reviewApplication
);

// ==========================================
// COUNTY ASSOCIATION VERIFICATION
// ==========================================

router.get("/associations", getAssociations);

router.patch(
  "/associations/:id/verification",
  verifyAssociation
);

router.patch(
  "/applications/:id/verify-president",
  verifyCountyPresident
);
export default router;