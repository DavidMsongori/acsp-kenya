
import express from "express";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  getAssociationMembers,
} from "../controllers/association.members.controller.js";

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles("county_president"));

router.get("/members", getAssociationMembers);

export default router;
