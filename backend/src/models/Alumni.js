import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true },
    password: String,
    company: String,
    year: mongoose.Schema.Types.Mixed,
    profile_photo: String,
  },
  {
    collection: "alumni",
    versionKey: false,
  }
);

export const Alumni = mongoose.model("Alumni", alumniSchema);
