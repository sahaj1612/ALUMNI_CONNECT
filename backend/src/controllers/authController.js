import { Alumni } from "../models/Alumni.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function createAuthPayload({ role, identifier, profile }) {
  return {
    token: createToken({
      role,
      identifier,
      email: profile.email || "",
      name: profile.name || "",
    }),
    user: {
      role,
      identifier,
      name: profile.name || "",
      email: profile.email || "",
    },
  };
}

export const loginStudent = asyncHandler(async (req, res) => {
  const { usn, email, password } = req.body;

  if (!usn || !email || !password) {
    throw new ApiError(400, "USN, email, and password are required.");
  }

  const student = await Student.findOne({
    usn: usn.trim(),
    email: email.trim(),
    password,
  }).lean();

  if (!student) {
    throw new ApiError(401, "Invalid student credentials.");
  }

  res.json(
    createAuthPayload({
      role: "student",
      identifier: student.usn,
      profile: student,
    })
  );
});

export const loginAlumni = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const alumni = await Alumni.findOne({
    email: email.trim(),
    password,
  }).lean();

  if (!alumni) {
    throw new ApiError(401, "Invalid alumni credentials.");
  }

  res.json(
    createAuthPayload({
      role: "alumni",
      identifier: alumni.email,
      profile: alumni,
    })
  );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const profile =
    req.user.role === "student"
      ? await Student.findOne({ usn: req.user.identifier }).lean()
      : await Alumni.findOne({ email: req.user.identifier }).lean();

  if (!profile) {
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  res.json({
    user: {
      role: req.user.role,
      identifier: req.user.identifier,
      name: profile.name || req.user.name,
      email: profile.email || req.user.email,
    },
  });
});
