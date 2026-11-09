
import express from "express";

import {
  getSystemSettings,
  updateSystemSetting,
} from "../controllers/settings.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ALL ROUTES REQUIRE SUPER ADMIN ACCESS
router.use(authenticateUser);
router.use(authorizeRoles("super_admin"));

// GET ALL SYSTEM SETTINGS
router.get("/", getSystemSettings);

// UPDATE A SETTINGS CATEGORY
router.put("/:key", updateSystemSetting);

export default router;
