import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: String,
    date: mongoose.Schema.Types.Mixed,
    location: String,
    description: String,
    posted_by: String,
    alumni_email: String,
    created_at: Date,
  },
  {
    collection: "events",
    versionKey: false,
  }
);

export const Event = mongoose.model("Event", eventSchema);
