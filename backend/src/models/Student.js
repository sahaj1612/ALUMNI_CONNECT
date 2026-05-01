import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: String,
    usn: { type: String, required: true },
    email: String,
    password: String,
    phone: String,
    department: String,
    batch: String,
    skills: String,
    profile_photo: String,
    resume_path: String,
  },
  {
    collection: "students",
    versionKey: false,
  }
);

export const Student = mongoose.model("Student", studentSchema);
