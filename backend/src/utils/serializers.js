function isValidDateValue(value) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function toPlainId(document) {
  return {
    ...document,
    id: String(document._id),
    _id: undefined,
  };
}

export function normalizeDate(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && value.$date) {
    return new Date(value.$date).toISOString();
  }

  if (isValidDateValue(value)) {
    return new Date(value).toISOString();
  }

  return String(value);
}

export function normalizeRecord(document) {
  const record = toPlainId(document);

  if ("created_at" in record) {
    record.created_at = normalizeDate(record.created_at);
  }

  if ("applied_at" in record) {
    record.applied_at = normalizeDate(record.applied_at);
  }

  if ("registered_at" in record) {
    record.registered_at = normalizeDate(record.registered_at);
  }

  if ("date" in record) {
    record.date = normalizeDate(record.date);
  }

  if ("event_date" in record) {
    record.event_date = normalizeDate(record.event_date);
  }

  return record;
}

export function fileUrl(req, relativePath) {
  if (!relativePath) {
    return "";
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/${relativePath.replace(/\\/g, "/")}`;
}
