import express from "express";

import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
} from "../controllers/announcement.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ALL ROUTES REQUIRE AN AUTHENTICATED ADMINISTRATOR
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// GET ALL ANNOUNCEMENTS
router.get("/", getAllAnnouncements);

// CREATE ANNOUNCEMENT
router.post("/", createAnnouncement);

// EDIT ANNOUNCEMENT
router.patch("/:id", updateAnnouncement);

// PUBLISH, UNPUBLISH OR ARCHIVE
router.patch("/:id/status", updateAnnouncementStatus);

// DELETE ANNOUNCEMENT
router.delete("/:id", deleteAnnouncement);

export default router;