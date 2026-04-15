import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

/**
 * Upload file to S3
 * @param file - File buffer from multer
 * @param folder - Folder path in S3 (e.g., 'trees', 'sites', 'documents')
 * @param originalFileName - Original file name
 * @returns URL of uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  folder: string,
  originalFileName: string,
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  // Generate unique file name to avoid conflicts
  const fileExtension = originalFileName.split(".").pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const key = `${folder}/${uniqueFileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: getContentType(originalFileName),
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "us-east-1"
    }.amazonaws.com/${key}`;
    return fileUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Delete file from S3
 * @param fileUrl - Full URL of the file
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  try {
    // Extract key from URL
    const key = fileUrl.split(`${BUCKET_NAME}/`)[1];
    if (!key) {
      throw new Error("Invalid S3 URL");
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
}

/**
 * Helper function to determine content type based on file extension
 */
function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const contentTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    csv: "text/csv",
    txt: "text/plain",
  };
  return contentTypes[ext || ""] || "application/octet-stream";
}

export default { uploadToS3, deleteFromS3 };
