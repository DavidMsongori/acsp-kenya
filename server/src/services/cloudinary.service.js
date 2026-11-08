
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (
  file,
  folder,
  publicId = undefined
) => {
  if (!file?.buffer) {
    throw new Error("Invalid image file");
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `acsp-kenya/${folder}`,
          ...(publicId ? { public_id: publicId } : {}),
          resource_type: "image",
          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, uploadedImage) => {
          if (error) {
            return reject(error);
          }

          resolve(uploadedImage);
        }
      );

      Readable.from([file.buffer]).pipe(uploadStream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      details: error.error?.message,
    });

    throw new Error("Image upload failed");
  }
};

export const deleteImage = async (publicId) => {
  if (!publicId) {
    throw new Error("Cloudinary public ID is required");
  }

  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    throw new Error("Image deletion failed");
  }
};
