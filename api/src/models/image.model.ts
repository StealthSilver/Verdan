import mongoose, { Schema, Document } from "mongoose";

export interface IImage extends Document {
  imageUrl: string | null;
  s3Uploaded: boolean;
  localImagePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    imageUrl: { type: String, default: null },
    s3Uploaded: { type: Boolean, default: false },
    localImagePath: { type: String, default: null },
  },
  { timestamps: true },
);

ImageSchema.index({ s3Uploaded: 1, localImagePath: 1 });

export default mongoose.model<IImage>("Image", ImageSchema);
