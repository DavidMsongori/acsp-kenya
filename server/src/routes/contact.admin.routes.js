
import express from "express";

import {
  getAllContactMessages,
  getContactMessage,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../controllers/contact.admin.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ALL ROUTES REQUIRE AN AUTHENTICATED ADMINISTRATOR
router.use(authenticateUser);
router.use(authorizeRoles("super_admin", "nec_admin"));

// GET ALL CONTACT MESSAGES
router.get("/", getAllContactMessages);

// GET SINGLE CONTACT MESSAGE
router.get("/:id", getContactMessage);

// UPDATE MESSAGE STATUS
router.patch("/:id/status", updateContactMessageStatus);

// DELETE CONTACT MESSAGE
router.delete("/:id", deleteContactMessage);

export default router;
