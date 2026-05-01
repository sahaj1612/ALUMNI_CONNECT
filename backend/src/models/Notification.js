import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient_type: String,
    recipient_id: String,
    title: String,
    message: String,
    link: String,
    is_read: Boolean,
    created_at: Date,
  },
  {
    collection: "notifications",
    versionKey: false,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
