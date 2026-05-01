import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { formatDate } from "../utils/format.js";

export function DetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/details/${type}/${id}`, { token })
      .then((response) => {
        setRecord(response.record);
      })
      .catch((requestError) => {
        setError(requestError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, token, type]);

  const backPath =
    user?.role === "alumni"
      ? `/alumni-portal?section=${type === "event" ? "events" : "jobs"}`
      : `/student?section=${type === "event" ? "events" : "jobs"}`;

  if (loading) {
    return <div className="screen-loader">Loading details...</div>;
  }

  if (error || !record) {
    return (
      <div className="details-page">
        <div className="details-card">
          <h1>Unable to load this {type}</h1>
          <p>{error || "The requested record could not be found."}</p>
          <div className="inline-actions">
            <button type="button" className="primary-button" onClick={() => navigate(backPath)}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="details-card">
        <p className="eyebrow">{type === "event" ? "Event Preview" : "Job Preview"}</p>
        <h1>{type === "event" ? record.title : record.role}</h1>
        <p className="details-subtitle">
          {type === "event"
            ? `Hosted by ${record.posted_by || "Alumni"}`
            : `${record.company || "Company"} posted by ${record.posted_by || "Alumni"}`}
        </p>

        <div className="details-grid">
          {type === "job" ? (
            <>
              <DetailItem label="Company" value={record.company || "Not specified"} />
              <DetailItem label="Department" value={record.department || "All Departments"} />
              <DetailItem label="Salary" value={record.salary || "Not specified"} />
              <DetailItem label="Location" value={record.location || "Not specified"} />
              <DetailItem label="Eligibility" value={record.eligibility || "Not specified"} />
              <DetailItem label="Posted On" value={formatDate(record.created_at)} />
            </>
          ) : (
            <>
              <DetailItem label="Date" value={formatDate(record.date)} />
              <DetailItem label="Location" value={record.location || "Not specified"} />
              <DetailItem label="Hosted By" value={record.posted_by || "Alumni"} />
            </>
          )}
        </div>

        <section className="description-block">
          <h2>{type === "event" ? "About This Event" : "Job Description"}</h2>
          <p>{record.description || "No description provided yet."}</p>
        </section>

        <div className="inline-actions">
          <Link to={backPath} className="primary-button button-link">
            Back to {type === "event" ? "Events" : "Jobs"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
