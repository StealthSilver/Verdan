import mongoose, { Schema, Document } from "mongoose";

export interface ITree extends Document {
  siteId: mongoose.Types.ObjectId;
  plantedBy: mongoose.Types.ObjectId;
  plantedByName?: string;
  treeName: string;
  treeType?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  datePlanted: Date;
  timestamp?: Date;
  status: string;
  remarks?: string;
  verified: boolean;
  images: {
    url: string;
    timestamp: Date;
  }[];
}

const TreeSchema = new Schema<ITree>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    plantedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plantedByName: { type: String },
    treeName: { type: String, required: true },
    treeType: { type: String, default: "" },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    datePlanted: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: "healthy" },
    remarks: String,
    verified: { type: Boolean, default: false },
    // Ensure each image subdocument has its own _id so we can target and delete reliably
    images: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        url: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Database indexes for optimized queries
TreeSchema.index({ siteId: 1, datePlanted: -1 }); // Composite index for site-based sorted queries
TreeSchema.index({ verified: 1 }); // Index for filtering by verification status
TreeSchema.index({ plantedBy: 1 }); // Index for user-based queries

export default mongoose.model<ITree>("Tree", TreeSchema);
