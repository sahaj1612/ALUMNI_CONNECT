import { Notification } from "../models/Notification.js";

export async function createNotification({
  recipientType,
  recipientId,
  title,
  message,
  link = "",
}) {
  await Notification.create({
    recipient_type: recipientType,
    recipient_id: String(recipientId),
    title,
    message,
    link,
    is_read: false,
    created_at: new Date(),
  });
}

export async function createBulkNotifications({
  recipientType,
  recipientIds,
  title,
  message,
  link = "",
}) {
  if (!recipientIds.length) {
    return;
  }

  await Notification.insertMany(
    recipientIds.map((recipientId) => ({
      recipient_type: recipientType,
      recipient_id: String(recipientId),
      title,
      message,
      link,
      is_read: false,
      created_at: new Date(),
    }))
  );
}
