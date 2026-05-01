import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { Job } from "../models/Job.js";
import { JobApplication } from "../models/JobApplication.js";
import { Notification } from "../models/Notification.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notifications.js";
import { fileUrl, normalizeRecord } from "../utils/serializers.js";

function matchesFilter(value = "", query = "") {
  return value.toLowerCase().includes(query.toLowerCase());
}

function enrichStudent(req, student) {
  return {
    ...student,
    id: String(student._id),
    profilePhotoUrl: fileUrl(req, student.profile_photo),
    resumeUrl: fileUrl(req, student.resume_path),
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

export const getStudentPortal = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ usn: req.user.identifier }).lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  const [jobs, events, appliedJobs, registrations, notifications] =
    await Promise.all([
      Job.find({}).sort({ created_at: -1 }).lean(),
      Event.find({}).sort({ created_at: -1 }).lean(),
      JobApplication.find({ student_usn: student.usn })
        .sort({ applied_at: -1 })
        .lean(),
      EventRegistration.find({ student_usn: student.usn })
        .sort({ registered_at: -1 })
        .lean(),
      Notification.find({
        recipient_type: "student",
        recipient_id: student.usn,
      })
        .sort({ created_at: -1 })
        .limit(20)
        .lean(),
    ]);

  const filters = {
    jobCompany: (req.query.jobCompany || "").trim(),
    jobRole: (req.query.jobRole || "").trim(),
    jobDepartment: (req.query.jobDepartment || "").trim(),
    jobLocation: (req.query.jobLocation || "").trim(),
    eventTitle: (req.query.eventTitle || "").trim(),
    eventLocation: (req.query.eventLocation || "").trim(),
    eventDate: (req.query.eventDate || "").trim(),
  };

  const filteredJobs = jobs.filter((job) => {
    return (
      matchesFilter(job.company || "", filters.jobCompany) &&
      matchesFilter(job.role || "", filters.jobRole) &&
      matchesFilter(job.department || "", filters.jobDepartment) &&
      matchesFilter(job.location || "", filters.jobLocation)
    );
  });

  const filteredEvents = events.filter((event) => {
    const normalized = normalizeRecord(event);
    const normalizedDate = normalized.date?.slice(0, 10) || "";

    return (
      matchesFilter(event.title || "", filters.eventTitle) &&
      matchesFilter(event.location || "", filters.eventLocation) &&
      (!filters.eventDate || normalizedDate === filters.eventDate)
    );
  });

  const unreadNotificationsCount = await Notification.countDocuments({
    recipient_type: "student",
    recipient_id: student.usn,
    is_read: false,
  });

  res.json({
    profile: enrichStudent(req, student),
    summary: {
      availableJobsCount: jobs.length,
      upcomingEventsCount: events.length,
      appliedJobsCount: appliedJobs.length,
      registeredEventsCount: registrations.length,
      unreadNotificationsCount,
    },
    jobs: enrichCollection(req, filteredJobs),
    events: enrichCollection(req, filteredEvents),
    appliedJobs: enrichCollection(req, appliedJobs),
    registrations: enrichCollection(req, registrations),
    notifications: enrichCollection(req, notifications),
    appliedJobIds: appliedJobs.map((item) => String(item.job_id)),
    registeredEventIds: registrations.map((item) => String(item.event_id)),
    filters,
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const student = await Student.findOne({ usn: req.user.identifier }).lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job.");
  }

  const job = await Job.findById(jobId).lean();

  if (!job) {
    throw new ApiError(404, "Job not found.");
  }

  const existing = await JobApplication.findOne({
    student_usn: student.usn,
    job_id: job._id,
  }).lean();

  if (existing) {
    throw new ApiError(409, "You have already applied for this job.");
  }

  await JobApplication.create({
    student_usn: student.usn,
    student_name: student.name || "",
    student_email: student.email || "",
    job_id: job._id,
    alumni_email: job.alumni_email || "",
    posted_by: job.posted_by || "",
    company: job.company || "",
    role: job.role || "",
    salary: job.salary || "",
    location: job.location || "",
    resume_path: student.resume_path || "",
    status: "Applied",
    applied_at: new Date(),
  });

  if (job.alumni_email) {
    await createNotification({
      recipientType: "alumni",
      recipientId: job.alumni_email,
      title: "New job application",
      message: `${student.name || student.usn} applied for ${job.role || "your job"}.`,
      link: "/alumni-portal?section=applications",
    });
  }

  await createNotification({
    recipientType: "student",
    recipientId: student.usn,
    title: "Application submitted",
    message: `Your application for ${job.role || "the job"} has been submitted.`,
    link: "/student?section=applied",
  });

  res.json({ message: "Job application submitted successfully." });
});

export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const student = await Student.findOne({ usn: req.user.identifier }).lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event.");
  }

  const event = await Event.findById(eventId).lean();

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  const existing = await EventRegistration.findOne({
    student_usn: student.usn,
    event_id: event._id,
  }).lean();

  if (existing) {
    throw new ApiError(409, "You have already registered for this event.");
  }

  await EventRegistration.create({
    student_usn: student.usn,
    student_name: student.name || "",
    student_email: student.email || "",
    event_id: event._id,
    event_title: event.title || "",
    event_date: event.date || "",
    location: event.location || "",
    alumni_email: event.alumni_email || "",
    status: "Registered",
    registered_at: new Date(),
  });

  if (event.alumni_email) {
    await createNotification({
      recipientType: "alumni",
      recipientId: event.alumni_email,
      title: "New event registration",
      message: `${student.name || student.usn} registered for ${event.title || "your event"}.`,
      link: "/alumni-portal?section=registrations",
    });
  }

  await createNotification({
    recipientType: "student",
    recipientId: student.usn,
    title: "Event registration confirmed",
    message: `You are registered for ${event.title || "the event"}.`,
    link: "/student?section=registrations",
  });

  res.json({ message: "Event registration successful." });
});

export const markStudentNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      recipient_type: "student",
      recipient_id: req.user.identifier,
      is_read: false,
    },
    { $set: { is_read: true } }
  );

  res.json({ message: "Notifications marked as read." });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ usn: req.user.identifier });

  if (!student) {
    throw new ApiError(404, "Student profile not found.");
  }

  student.name = req.body.name || "";
  student.phone = req.body.phone || "";
  student.department = req.body.department || "";
  student.batch = req.body.batch || "";
  student.skills = req.body.skills || "";

  const files = req.files || {};

  if (files.profile_photo?.[0]) {
    student.profile_photo = `uploads/profile_photos/${files.profile_photo[0].filename}`;
  }

  if (files.resume?.[0]) {
    student.resume_path = `uploads/resumes/${files.resume[0].filename}`;
  }

  await student.save();

  res.json({
    message: "Profile updated successfully.",
    profile: enrichStudent(req, student.toObject()),
  });
});
