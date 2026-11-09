import express from "express";

import {
  getPublishedEvents,
  getPublishedEventById,
} from "../controllers/event.controller.js";

import { optionalAuthenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(optionalAuthenticateUser);

// GET /api/events
router.get("/", getPublishedEvents);

// GET /api/events/:id
router.get("/:id", getPublishedEventById);

export default router;