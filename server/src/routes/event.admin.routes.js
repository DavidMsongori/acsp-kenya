import express from "express";

import {
  getAllEvents,
  createEvent,
  updateEvent,
  updateEventPublicationStatus,
  updateEventStatus,
  deleteEvent,
} from "../controllers/event.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes require an authenticated administrator.
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

router.get("/", getAllEvents);
router.post("/", createEvent);
router.patch("/:id", updateEvent);
router.patch("/:id/publication", updateEventPublicationStatus);
router.patch("/:id/status", updateEventStatus);
router.delete("/:id", deleteEvent);

export default router;