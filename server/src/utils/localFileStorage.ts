import fs from 'fs/promises';
import path from 'path';

const sanitizeFileName = (fileName: string) =>
  fileName
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_+/g, '_');

export const saveUploadedFileLocally = async (
  fileBuffer: Buffer,
  folder: 'job_portal/resumes' | 'job_portal/applications',
  originalFilename: string,
  userId?: string
): Promise<string> => {
  const targetDir = path.resolve(__dirname, '../../uploads', folder.replace('job_portal/', ''));
  await fs.mkdir(targetDir, { recursive: true });

  const safeOriginalName = sanitizeFileName(originalFilename || 'resume.pdf');
  const uniqueFileName = `${Date.now()}-${userId ?? 'user'}-${safeOriginalName}`;
  const filePath = path.join(targetDir, uniqueFileName);

  await fs.writeFile(filePath, fileBuffer);

  const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${folder.replace('job_portal/', '')}/${uniqueFileName}`;
};
