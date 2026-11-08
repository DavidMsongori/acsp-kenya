
import {
  uploadImage,
  deleteImage,
} from "../services/cloudinary.service.js";

// ==========================================
// ASSOCIATION APPLICATION IMAGES
// ==========================================

export const uploadApplicationImages = async (req, res) => {
  let uploadedLogo = null;

  try {
    const associationLogo = req.files?.associationLogo?.[0];
    const profilePhoto = req.files?.profilePhoto?.[0];

    if (!associationLogo || !profilePhoto) {
      return res.status(400).json({
        success: false,
        message:
          "Both association logo and profile photograph are required.",
      });
    }

    uploadedLogo = await uploadImage(
      associationLogo,
      `association-logos/${req.user.id}`
    );

    const uploadedPhoto = await uploadImage(
      profilePhoto,
      `president-photos/${req.user.id}`
    );

    return res.status(200).json({
      success: true,
      message: "Application images uploaded successfully.",
      images: {
        associationLogo: uploadedLogo,
        profilePhoto: uploadedPhoto,
      },
    });
  } catch (error) {
    console.error("Application image upload error:", error.message);

    if (uploadedLogo?.publicId) {
      await deleteImage(uploadedLogo.publicId).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Unable to upload application images.",
    });
  }
};


// ==========================================
// NATIONAL PROGRAMME COVER IMAGE
// ==========================================

export const uploadProgrammeCover = async (req, res) => {
  try {
    const coverImage = req.file;

    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: "Programme cover image is required.",
      });
    }

    const uploadedImage = await uploadImage(
      coverImage,
      `programme-covers/${req.user.id}`
    );

    return res.status(200).json({
      success: true,
      message: "Programme cover image uploaded successfully.",
      image: uploadedImage,
    });
  } catch (error) {
    console.error("Programme cover upload error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to upload programme cover image.",
    });
  }
};


// ==========================================
// PROGRAMME ACTIVITY PHOTOGRAPHS
// ==========================================

export const uploadActivityImages = async (req, res) => {
  const uploadedImages = [];

  try {
    const activityImages = req.files || [];

    if (activityImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one activity photograph is required.",
      });
    }

    for (const image of activityImages) {
      const uploadedImage = await uploadImage(
        image,
        `activity-images/${req.user.id}`
      );

      uploadedImages.push(uploadedImage);
    }

    return res.status(200).json({
      success: true,
      message: "Activity photographs uploaded successfully.",
      count: uploadedImages.length,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Activity images upload error:", error.message);

    // Clean up successfully uploaded images if a later upload fails.
    await Promise.all(
      uploadedImages.map((image) =>
        deleteImage(image.publicId).catch(() => {})
      )
    );

    return res.status(500).json({
      success: false,
      message: "Unable to upload activity photographs.",
    });
  }
};


// ==========================================
// DELETE PROGRAMME / ACTIVITY IMAGE
// ==========================================

export const deleteProgrammeImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId || typeof publicId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid image public ID is required.",
      });
    }

    const allowedFolders = [
      "acsp-kenya/programme-covers/",
      "acsp-kenya/activity-images/",
    ];

    const isAllowed = allowedFolders.some((folder) =>
      publicId.startsWith(folder)
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "This image cannot be deleted through this endpoint.",
      });
    }

    const result = await deleteImage(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("Cloudinary could not delete the image.");
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error("Programme image deletion error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete image.",
    });
  }
};
