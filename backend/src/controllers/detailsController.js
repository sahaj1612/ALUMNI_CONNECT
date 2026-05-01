import mongoose from "mongoose";
import { Event } from "../models/Event.js";
import { Job } from "../models/Job.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeRecord } from "../utils/serializers.js";

export const getRecordDetails = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  if (!["job", "event"].includes(type)) {
    throw new ApiError(400, "Unsupported record type.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(404, "Record not found.");
  }

  const Model = type === "event" ? Event : Job;
  const record = await Model.findById(id).lean();

  if (!record) {
    throw new ApiError(404, "Record not found.");
  }

  res.json({
    type,
    record: normalizeRecord(record),
  });
});
