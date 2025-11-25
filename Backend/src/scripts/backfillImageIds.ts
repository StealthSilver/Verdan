import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import Tree from "../models/tree.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/verdan";

async function backfill() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Find trees with images missing _id
  const trees = await Tree.find({}).select("_id images");
  let updatedTrees = 0;
  for (const tree of trees) {
    let needsUpdate = false;
    const newImages = (tree.images as any[]).map((img) => {
      if (!img._id) {
        needsUpdate = true;
        return {
          _id: new Types.ObjectId(),
          url: img.url,
          timestamp: img.timestamp || new Date(),
        };
      }
      return img; // already has _id
    });
    if (needsUpdate) {
      await Tree.updateOne({ _id: tree._id }, { $set: { images: newImages } });
      console.log(
        `Updated tree ${tree._id} - added _id to ${
          newImages.filter(
            (i) =>
              i._id &&
              !tree.images.find((o: any) => String(o._id) === String(i._id))
          ).length
        } images`
      );
      updatedTrees++;
    }
  }

  console.log(`Backfill complete. Trees updated: ${updatedTrees}`);
  await mongoose.disconnect();
  console.log("Disconnected");
}

backfill().catch((err) => {
  console.error("Backfill error", err);
  mongoose.disconnect();
  process.exit(1);
});
