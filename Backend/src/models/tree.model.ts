import mongoose, { Schema, Document } from "mongoose";

export interface ITree extends Document {
  siteId: mongoose.Types.ObjectId;
  plantedBy: mongoose.Types.ObjectId;
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
    images: [
      {
        url: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITree>("Tree", TreeSchema);
