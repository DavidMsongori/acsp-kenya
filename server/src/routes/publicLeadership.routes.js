import express from "express";

import {
  getGeneralAssemblyMembers,
} from "../controllers/publicLeadership.controller.js";

const router = express.Router();

// Public endpoint: verified and active General Assembly members only
router.get("/general-assembly", getGeneralAssemblyMembers);

export default router;