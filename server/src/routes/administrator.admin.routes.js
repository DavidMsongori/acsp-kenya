
import express from "express";

import {
  getAdministrators,
  inviteAdministrator,
} from "../controllers/administrator.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes require an authenticated Super Admin or NEC Admin.
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// View administrator directory.
router.get("/", getAdministrators);

// Only Super Admins can invite new administrators.
router.post(
  "/",
  authorizeRoles("super_admin"),
  inviteAdministrator
);

export default router;
