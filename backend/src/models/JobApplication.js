import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    student_usn: String,
    student_name: String,
    student_email: String,
    job_id: mongoose.Schema.Types.ObjectId,
    alumni_email: String,
    posted_by: String,
    company: String,
    role: String,
    salary: String,
    location: String,
    resume_path: String,
    status: String,
    applied_at: Date,
  },
  {
    collection: "job_applications",
    versionKey: false,
  }
);

export const JobApplication = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);
