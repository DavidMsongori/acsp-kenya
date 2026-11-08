
import express from "express";

import {
  getAllProgrammes,
  createProgramme,
  updateProgramme,
  updateProgrammeStatus,
  createProgrammeActivity,
  updateProgrammeActivity,
  updateProgrammeActivityStatus,
  getProgrammeActivities,
  deleteProgramme,
} from "../controllers/programme.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes require an authenticated administrator.
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// ==========================================
// NATIONAL PROGRAMMES
// ==========================================

router.get("/", getAllProgrammes);

router.get("/:id/activities", getProgrammeActivities);

router.post("/", createProgramme);

router.patch("/:id", updateProgramme);

router.delete("/:id", deleteProgramme);

router.patch("/:id/status", updateProgrammeStatus);


// ==========================================
// PROGRAMME ACTIVITIES
// ==========================================

router.post("/:id/activities", createProgrammeActivity);

router.patch(
  "/:id/activities/:activityId",
  updateProgrammeActivity
);

router.patch(
  "/:id/activities/:activityId/status",
  updateProgrammeActivityStatus
);

export default router;
