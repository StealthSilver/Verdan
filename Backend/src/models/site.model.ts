import mongoose, { Schema, Document } from "mongoose";

export interface ISite extends Document {
  name: string;
  address: string;
  image?: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  status: "active" | "inactive";
  type?: string;
  teamMembers: mongoose.Types.ObjectId[];
}

const SiteSchema = new Schema<ISite>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    image: String,
    coordinates: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    type: String,
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export default mongoose.model<ISite>("Site", SiteSchema);
