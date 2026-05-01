import mongoose from "mongoose";
import { Alumni } from "../models/Alumni.js";
import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { Job } from "../models/Job.js";
import { JobApplication } from "../models/JobApplication.js";
import { Notification } from "../models/Notification.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createBulkNotifications,
  createNotification,
} from "../utils/notifications.js";
import { fileUrl, normalizeRecord } from "../utils/serializers.js";

const allowedStatuses = [
  "Applied",
  "Reviewed",
  "Shortlisted",
  "Rejected",
  "Selected",
];

function enrichAlumni(req, alumni) {
  return {
    ...alumni,
    id: String(alumni._id),
    profilePhotoUrl: fileUrl(req, alumni.profile_photo),
  };
}

function enrichCollection(req, items) {
  return items.map((item) => {
    const normalized = normalizeRecord(item);
    if (normalized.resume_path) {
      normalized.resumeUrl = fileUrl(req, normalized.resume_path);
    }
    return normalized;
  });
}

async function getAlumniOrThrow(email) {
  const alumni = await Alumni.findOne({ email });
  if (!alumni) {
    throw new ApiError(404, "Alumni profile not found.");
  }
  return alumni;
}

export const getAlumniPortal = asyncHandler(async (req, res) => {
  const alumni = await getAlumniOrThrow(req.user.identifier);
  const alumniEmail = alumni.email;

  const [postedJobs, postedEvents, notifications] = await Promise.all([
    Job.find({ alumni_email: alumniEmail }).sort({ created_at: -1 }).lean(),
    Event.find({ alumni_email: alumniEmail }).sort({ created_at: -1 }).lean(),
    Notification.find({
      recipient_type: "alumni",
      recipient_id: alumniEmail,
    })
      .sort({ created_at: -1 })
      .limit(20)
      .lean(),
  ]);

  const jobIds = postedJobs.map((job) => job._id);
  const eventIds = postedEvents.map((event) => event._id);

  const [applications, registrations, unreadNotificationsCount] =
    await Promise.all([
      jobIds.length
        ? JobApplication.find({ job_id: { $in: jobIds } })
            .sort({ applied_at: -1 })
            .lean()
        : [],
      eventIds.length
        ? EventRegistration.find({ event_id: { $in: eventIds } })
            .sort({ registered_at: -1 })
            .lean()
        : [],
      Notification.countDocuments({
        recipient_type: "alumni",
        recipient_id: alumniEmail,
        is_read: false,
      }),
    ]);

  res.json({
    profile: enrichAlumni(req, alumni.toObject()),
    summary: {
      jobsCount: postedJobs.length,
      eventsCount: postedEvents.length,
      applicationsCount: applications.length,
      registrationsCount: registrations.length,
      unreadNotificationsCount,
    },
    postedJobs: enrichCollection(req, postedJobs),
    postedEvents: enrichCollection(req, postedEvents),
    applications: enrichCollection(req, applications),
    registrations: enrichCollection(req, registrations),
    notifications: enrichCollection(req, notifications),
  });
});

export const createJob = asyncHandler(async (req, res) => {
  const alumni = await getAlumniOrThrow(req.user.identifier);

  const job = await Job.create({
    company: (req.body.company || alumni.company || "").trim(),
    role: (req.body.role || "").trim(),
    salary: (req.body.salary || "").trim(),
    location: (req.body.location || "").trim(),
    department: (req.body.department || "").trim(),
    eligibility: (req.body.eligibility || "").trim(),
    description: (req.body.description || "").trim(),
    posted_by: alumni.name || "",
    alumni_email: alumni.email,
    created_at: new Date(),
  });

  const studentIds = await Student.distinct("usn");
  await createBulkNotifications({
    recipientType: "student",
    recipientIds: studentIds,
    title: "New job posted",
    message: `${job.company || alumni.name} posted a new job: ${job.role || "Open role"}`,
    link: "/student?section=jobs",
  });

  res.status(201).json({
    message: "Job posted successfully.",
    job: normalizeRecord(job.toObject()),
  });
});

export const updateJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job.");
  }

  const job = await Job.findOne({
    _id: jobId,
    alumni_email: req.user.identifier,
  });

  if (!job) {
    throw new ApiError(404, "Job not found.");
  }

  job.company = (req.body.company || "").trim();
  job.role = (req.body.role || "").trim();
  job.salary = (req.body.salary || "").trim();
  job.location = (req.body.location || "").trim();
  job.department = (req.body.department || "").trim();
  job.eligibility = (req.body.eligibility || "").trim();
  job.description = (req.body.description || "").trim();

  await job.save();

  res.json({
    message: "Job updated successfully.",
    job: normalizeRecord(job.toObject()),
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job.");
  }

  const job = await Job.findOneAndDelete({
    _id: jobId,
    alumni_email: req.user.identifier,
  });

  if (!job) {
    throw new ApiError(404, "Job not found.");
  }

  await JobApplication.deleteMany({ job_id: job._id });

  res.json({ message: "Job deleted successfully." });
});

export const createEvent = asyncHandler(async (req, res) => {
  const alumni = await getAlumniOrThrow(req.user.identifier);

  const event = await Event.create({
    title: (req.body.title || "").trim(),
    date: req.body.eventDate || "",
    location: (req.body.location || "").trim(),
    description: (req.body.description || "").trim(),
    posted_by: alumni.name || "",
    alumni_email: alumni.email,
    created_at: new Date(),
  });

  const studentIds = await Student.distinct("usn");
  await createBulkNotifications({
    recipientType: "student",
    recipientIds: studentIds,
    title: "New event posted",
    message: `${alumni.name || "Alumni"} posted a new event: ${event.title || "Event"}`,
    link: "/student?section=events",
  });

  res.status(201).json({
    message: "Event posted successfully.",
    event: normalizeRecord(event.toObject()),
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event.");
  }

  const event = await Event.findOne({
    _id: eventId,
    alumni_email: req.user.identifier,
  });

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  event.title = (req.body.title || "").trim();
  event.date = req.body.eventDate || "";
  event.location = (req.body.location || "").trim();
  event.description = (req.body.description || "").trim();

  await event.save();

  res.json({
    message: "Event updated successfully.",
    event: normalizeRecord(event.toObject()),
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event.");
  }

  const event = await Event.findOneAndDelete({
    _id: eventId,
    alumni_email: req.user.identifier,
  });

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  await EventRegistration.deleteMany({ event_id: event._id });

  res.json({ message: "Event deleted successfully." });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, "Invalid application.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid application status.");
  }

  const application = await JobApplication.findById(applicationId);

  if (!application) {
    throw new ApiError(404, "Application not found.");
  }

  if (application.alumni_email !== req.user.identifier) {
    throw new ApiError(403, "You can only manage your own applications.");
  }

  application.status = status;
  await application.save();

  if (application.student_usn) {
    await createNotification({
      recipientType: "student",
      recipientId: application.student_usn,
      title: "Application status updated",
      message: `Your application for ${application.role || "the job"} is now ${status}.`,
      link: "/student?section=applied",
    });
  }

  res.json({ message: "Application status updated." });
});

export const markAlumniNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      recipient_type: "alumni",
      recipient_id: req.user.identifier,
      is_read: false,
    },
    { $set: { is_read: true } }
  );

  res.json({ message: "Notifications marked as read." });
});

export const updateAlumniProfile = asyncHandler(async (req, res) => {
  const alumni = await getAlumniOrThrow(req.user.identifier);

  alumni.name = req.body.name || "";
  alumni.company = req.body.company || "";
  alumni.year = req.body.year || "";

  const files = req.files || {};

  if (files.profile_photo?.[0]) {
    alumni.profile_photo = `uploads/profile_photos/${files.profile_photo[0].filename}`;
  }

  await alumni.save();

  res.json({
    message: "Profile updated successfully.",
    profile: enrichAlumni(req, alumni.toObject()),
  });
});
