
import express from "express";

import {
  getPublishedProgrammes,
  getPublishedProgrammeById,
  getPublishedCountyActivities,
} from "../controllers/programme.controller.js";

const router = express.Router();

// Public routes
router.get("/", getPublishedProgrammes);

// Keep this route before /:id to avoid route conflicts.
router.get("/counties/:countyId", getPublishedCountyActivities);

router.get("/:id", getPublishedProgrammeById);

export default router;
