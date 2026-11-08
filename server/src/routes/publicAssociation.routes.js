import express from "express";

import {
  getVerifiedAssociations,
} from "../controllers/publicAssociation.controller.js";

const router = express.Router();

// Public endpoint: verified county associations only
router.get("/", getVerifiedAssociations);

export default router;