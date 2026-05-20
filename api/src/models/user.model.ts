import { Schema, model, Types, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  avatarId: number;
  siteId?: Types.ObjectId;
  gender?: "male" | "female" | "other";
  designation: string;
  organization?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const randomAvatarId = () => Math.floor(Math.random() * 10);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    avatarId: { type: Number, min: 0, max: 9, default: randomAvatarId },
    siteId: { type: Schema.Types.ObjectId, ref: "Site" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    designation: { type: String, required: true },
    organization: { type: String },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
