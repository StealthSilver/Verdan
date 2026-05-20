import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/verdan";

const randomAvatarId = () => Math.floor(Math.random() * 10);

async function backfillAvatars() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const users = await User.find(
    {
      $or: [{ avatarId: { $exists: false } }, { avatarId: null }],
    },
    { _id: 1, email: 1 }
  );

  if (users.length === 0) {
    console.log("No users missing avatarId.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Backfilling avatarId for ${users.length} users...`);
  for (const u of users) {
    const avatarId = randomAvatarId();
    await User.updateOne({ _id: u._id }, { $set: { avatarId } });
  }

  console.log("Done.");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

backfillAvatars().catch(async (e) => {
  console.error("Backfill failed:", e);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

