
import express from "express";

import {
  getAssociationProfile,
  updateAssociationProfile,
} from "../controllers/profile.association.controller.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// ALL ROUTES REQUIRE AN AUTHENTICATED COUNTY PRESIDENT
router.use(authenticateUser);
router.use(authorizeRoles("county_president"));

// GET MY ACCOUNT PROFILE
router.get("/", getAssociationProfile);

// UPDATE MY PERSONAL PROFILE
router.put("/", updateAssociationProfile);

export default router;
