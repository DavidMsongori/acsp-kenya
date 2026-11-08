
import express from "express";

import {
  applicationUpload,
  programmeCoverUpload,
  activityImagesUpload,
} from "../middleware/upload.middleware.js";

import { authenticateUser } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  uploadApplicationImages,
  uploadProgrammeCover,
  uploadActivityImages,
  deleteProgrammeImage,
} from "../controllers/upload.controller.js";

const router = express.Router();

// ==========================================
// UPLOAD ERROR HANDLER
// ==========================================

const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

// ==========================================
// ASSOCIATION APPLICATION IMAGES
// ==========================================

router.post(
  "/application-images",
  authenticateUser,
  handleUpload(
    applicationUpload.fields([
      { name: "associationLogo", maxCount: 1 },
      { name: "profilePhoto", maxCount: 1 },
    ])
  ),
  uploadApplicationImages
);

// ==========================================
// NATIONAL PROGRAMME COVER IMAGE
// ==========================================

router.post(
  "/programme-cover",
  authenticateUser,
  authorizeRoles("super_admin", "nec_admin"),
  handleUpload(programmeCoverUpload.single("coverImage")),
  uploadProgrammeCover
);

// ==========================================
// PROGRAMME ACTIVITY PHOTOGRAPHS
// ==========================================

router.post(
  "/activity-images",
  authenticateUser,
  authorizeRoles("super_admin", "nec_admin"),
  handleUpload(activityImagesUpload.array("activityImages", 10)),
  uploadActivityImages
);

// ==========================================
// DELETE PROGRAMME / ACTIVITY IMAGE
// ==========================================

router.delete(
  "/programme-image",
  authenticateUser,
  authorizeRoles("super_admin", "nec_admin"),
  deleteProgrammeImage
);

export default router;
