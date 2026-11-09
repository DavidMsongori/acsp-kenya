
import express from "express";

import {
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/profile.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ALL ROUTES REQUIRE AN AUTHENTICATED ADMINISTRATOR
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// GET MY ADMIN PROFILE
router.get("/", getAdminProfile);

// UPDATE MY ADMIN PROFILE
router.put("/", updateAdminProfile);

export default router;
