import { Schema, model, Types, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  siteId?: Types.ObjectId;
  gender?: "male" | "female" | "other";
  designation: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    siteId: { type: Schema.Types.ObjectId, ref: "Site" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    designation: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
