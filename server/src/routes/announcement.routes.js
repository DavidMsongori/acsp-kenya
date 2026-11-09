import express from "express";

import {
  getPublishedAnnouncements,
  getPublishedAnnouncementBySlug,
  getFeaturedAnnouncements,
} from "../controllers/announcement.controller.js";

const router = express.Router();

// GET FEATURED ANNOUNCEMENTS
router.get("/featured", getFeaturedAnnouncements);

// GET ALL PUBLISHED ANNOUNCEMENTS
router.get("/", getPublishedAnnouncements);

// GET A SINGLE ANNOUNCEMENT BY SLUG
router.get("/:slug", getPublishedAnnouncementBySlug);

export default router;