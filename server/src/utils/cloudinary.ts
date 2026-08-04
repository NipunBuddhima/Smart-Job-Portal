import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
});

const buildCloudinaryPublicUrl = (result: any) => result?.secure_url ?? '';

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string, resourceType: 'image' | 'raw' = 'image'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        type: 'upload',
        access_mode: 'public',
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) resolve(buildCloudinaryPublicUrl(result));
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const uploadToCloudinaryWithFilename = (
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image',
  originalFilename?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      type: 'upload',
      access_mode: 'public',
      use_filename: Boolean(originalFilename),
      unique_filename: false,
      ...(originalFilename ? { filename_override: originalFilename } : {}),
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      if (result) resolve(buildCloudinaryPublicUrl(result));
    });

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};