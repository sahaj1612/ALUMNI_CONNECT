import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    salary: String,
    location: String,
    department: String,
    eligibility: String,
    description: String,
    posted_by: String,
    alumni_email: String,
    created_at: Date,
  },
  {
    collection: "jobs",
    versionKey: false,
  }
);

export const Job = mongoose.model("Job", jobSchema);
