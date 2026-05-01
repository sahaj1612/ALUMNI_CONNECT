import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PortalLayout } from "../components/PortalLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { createAvatarPlaceholder } from "../utils/avatar.js";
import { formatDate, formatDateTime } from "../utils/format.js";

const navigation = [
  { key: "dashboard", label: "Dashboard" },
  { key: "post-job", label: "Post Job" },
  { key: "jobs", label: "My Jobs" },
  { key: "post-event", label: "Post Event" },
  { key: "events", label: "My Events" },
  { key: "applications", label: "Job Applications" },
  { key: "registrations", label: "Event Registrations" },
  { key: "notifications", label: "Notifications" },
  { key: "profile", label: "Profile" },
];

const initialJobForm = {
  company: "",
  role: "",
  salary: "",
  location: "",
  department: "",
  eligibility: "",
  description: "",
};

const initialEventForm = {
  title: "",
  eventDate: "",
  location: "",
  description: "",
};

export function AlumniPortalPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [portal, setPortal] = useState(null);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [eventForm, setEventForm] = useState(initialEventForm);
  const [profileForm, setProfileForm] = useState({
    name: "",
    company: "",
    year: "",
    profilePhoto: null,
  });
  const [editingJobId, setEditingJobId] = useState("");
  const [editingEventId, setEditingEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  const section = navigation.some((item) => item.key === searchParams.get("section"))
    ? searchParams.get("section")
    : "dashboard";

  async function loadPortal() {
    const response = await apiRequest("/alumni/portal", { token });
    setPortal(response);
    setProfileForm({
      name: response.profile.name || "",
      company: response.profile.company || "",
      year: response.profile.year || "",
      profilePhoto: null,
    });
    setJobForm((current) =>
      editingJobId
        ? current
        : {
            ...initialJobForm,
            company: response.profile.company || "",
          }
    );
  }

  useEffect(() => {
    loadPortal()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const editingJob = useMemo(
    () => portal?.postedJobs.find((job) => job.id === editingJobId) || null,
    [editingJobId, portal]
  );
  const editingEvent = useMemo(
    () => portal?.postedEvents.find((event) => event.id === editingEventId) || null,
    [editingEventId, portal]
  );

  useEffect(() => {
    if (editingJob) {
      setJobForm({
        company: editingJob.company || "",
        role: editingJob.role || "",
        salary: editingJob.salary || "",
        location: editingJob.location || "",
        department: editingJob.department || "",
        eligibility: editingJob.eligibility || "",
        description: editingJob.description || "",
      });
    } else if (portal) {
      setJobForm({
        ...initialJobForm,
        company: portal.profile.company || "",
      });
    }
  }, [editingJob, portal]);

  useEffect(() => {
    if (editingEvent) {
      setEventForm({
        title: editingEvent.title || "",
        eventDate: editingEvent.date ? editingEvent.date.slice(0, 10) : "",
        location: editingEvent.location || "",
        description: editingEvent.description || "",
      });
    } else {
      setEventForm(initialEventForm);
    }
  }, [editingEvent]);

  function updateSection(nextSection) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("section", nextSection);
    setSearchParams(nextParams);
  }

  async function handleAction(action, successMessage) {
    setSubmitting(true);
    setError("");

    try {
      await action();
      await loadPortal();
      setFlash(successMessage);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="screen-loader">Loading alumni dashboard...</div>;
  }

  if (!portal) {
    return <div className="screen-loader">{error || "Unable to load the dashboard."}</div>;
  }

  return (
    <PortalLayout
      title="Alumni Panel"
      section={section}
      onSectionChange={updateSection}
      navigation={navigation}
    >
      {flash ? <div className="alert success">{flash}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {section === "dashboard" && (
        <section className="content-stack">
          <SummaryGrid
            items={[
              ["Jobs Posted", portal.summary.jobsCount],
              ["Events Posted", portal.summary.eventsCount],
              ["Applications Received", portal.summary.applicationsCount],
              ["Event Registrations", portal.summary.registrationsCount],
              ["Unread Notifications", portal.summary.unreadNotificationsCount],
            ]}
          />
        </section>
      )}

      {section === "post-job" && (
        <section className="panel-card">
          <div className="section-header">
            <div>
              <h3>{editingJob ? "Edit Job" : "Post Job"}</h3>
              <p>Create or update a job opportunity for students.</p>
            </div>
            {editingJob ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingJobId("");
                  setJobForm({
                    ...initialJobForm,
                    company: portal.profile.company || "",
                  });
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              handleAction(
                () =>
                  apiRequest(
                    editingJobId ? `/alumni/jobs/${editingJobId}` : "/alumni/jobs",
                    {
                      method: editingJobId ? "PATCH" : "POST",
                      token,
                      body: jobForm,
                    }
                  ),
                editingJobId ? "Job updated successfully." : "Job posted successfully."
              );
            }}
          >
            <Field label="Company" value={jobForm.company} onChange={(value) => setJobForm((current) => ({ ...current, company: value }))} />
            <Field label="Role" value={jobForm.role} onChange={(value) => setJobForm((current) => ({ ...current, role: value }))} />
            <Field label="Salary" value={jobForm.salary} onChange={(value) => setJobForm((current) => ({ ...current, salary: value }))} />
            <Field label="Location" value={jobForm.location} onChange={(value) => setJobForm((current) => ({ ...current, location: value }))} />
            <Field label="Department" value={jobForm.department} onChange={(value) => setJobForm((current) => ({ ...current, department: value }))} />
            <Field label="Eligibility" value={jobForm.eligibility} onChange={(value) => setJobForm((current) => ({ ...current, eligibility: value }))} />
            <label className="form-span">
              Description
              <textarea
                value={jobForm.description}
                onChange={(event) =>
                  setJobForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <div className="form-span">
              <button type="submit" className="primary-button" disabled={submitting}>
                {editingJob ? "Update Job" : "Post Job"}
              </button>
            </div>
          </form>
        </section>
      )}

      {section === "jobs" && (
        <section className="panel-card">
          <h3>My Jobs</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portal.postedJobs.length ? (
                portal.postedJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.company || ""}</td>
                    <td>{job.role || ""}</td>
                    <td>{job.department || "All Departments"}</td>
                    <td>{job.salary || "Not specified"}</td>
                    <td>{job.location || "Not specified"}</td>
                    <td>
                      <div className="inline-actions">
                        <Link className="secondary-button button-link" to={`/details/job/${job.id}`}>
                          View
                        </Link>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setEditingJobId(job.id);
                            updateSection("post-job");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          disabled={submitting}
                          onClick={() =>
                            handleAction(
                              () =>
                                apiRequest(`/alumni/jobs/${job.id}`, {
                                  method: "DELETE",
                                  token,
                                }),
                              "Job deleted successfully."
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No jobs posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {section === "post-event" && (
        <section className="panel-card">
          <div className="section-header">
            <div>
              <h3>{editingEvent ? "Edit Event" : "Post Event"}</h3>
              <p>Keep students informed about new alumni events.</p>
            </div>
            {editingEvent ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingEventId("");
                  setEventForm(initialEventForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              handleAction(
                () =>
                  apiRequest(
                    editingEventId ? `/alumni/events/${editingEventId}` : "/alumni/events",
                    {
                      method: editingEventId ? "PATCH" : "POST",
                      token,
                      body: eventForm,
                    }
                  ),
                editingEventId ? "Event updated successfully." : "Event posted successfully."
              );
            }}
          >
            <Field label="Event Title" value={eventForm.title} onChange={(value) => setEventForm((current) => ({ ...current, title: value }))} />
            <Field label="Event Date" type="date" value={eventForm.eventDate} onChange={(value) => setEventForm((current) => ({ ...current, eventDate: value }))} />
            <Field label="Location" value={eventForm.location} onChange={(value) => setEventForm((current) => ({ ...current, location: value }))} />
            <label className="form-span">
              Description
              <textarea
                value={eventForm.description}
                onChange={(event) =>
                  setEventForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <div className="form-span">
              <button type="submit" className="primary-button" disabled={submitting}>
                {editingEvent ? "Update Event" : "Post Event"}
              </button>
            </div>
          </form>
        </section>
      )}

      {section === "events" && (
        <section className="panel-card">
          <h3>My Events</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portal.postedEvents.length ? (
                portal.postedEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title || ""}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.location || ""}</td>
                    <td>
                      <div className="inline-actions">
                        <Link className="secondary-button button-link" to={`/details/event/${event.id}`}>
                          View
                        </Link>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setEditingEventId(event.id);
                            updateSection("post-event");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          disabled={submitting}
                          onClick={() =>
                            handleAction(
                              () =>
                                apiRequest(`/alumni/events/${event.id}`, {
                                  method: "DELETE",
                                  token,
                                }),
                              "Event deleted successfully."
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No events posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {section === "applications" && (
        <section className="panel-card">
          <h3>Job Applications</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {portal.applications.length ? (
                portal.applications.map((application) => (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                    disabled={submitting}
                    onSave={(status) =>
                      handleAction(
                        () =>
                          apiRequest(`/alumni/applications/${application.id}/status`, {
                            method: "PATCH",
                            token,
                            body: { status },
                          }),
                        "Application status updated."
                      )
                    }
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No student applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {section === "registrations" && (
        <section className="panel-card">
          <h3>Event Registrations</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Event</th>
                <th>Date</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {portal.registrations.length ? (
                portal.registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.student_name || registration.student_usn}</td>
                    <td>{registration.student_email || ""}</td>
                    <td>{registration.event_title || ""}</td>
                    <td>{formatDate(registration.event_date)}</td>
                    <td>{formatDateTime(registration.registered_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No student registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {section === "notifications" && (
        <section className="content-stack">
          <div className="section-header">
            <div>
              <h3>Notifications</h3>
              <p>Recent updates from your jobs, events, and student activity.</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                handleAction(
                  () =>
                    apiRequest("/alumni/notifications/read-all", {
                      method: "PATCH",
                      token,
                    }),
                  "Notifications marked as read."
                )
              }
            >
              Mark All Read
            </button>
          </div>
          <NotificationList notifications={portal.notifications} />
        </section>
      )}

      {section === "profile" && (
        <section className="panel-card">
          <h3>My Profile</h3>
          <form
            className="profile-grid"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData();
              formData.append("name", profileForm.name);
              formData.append("company", profileForm.company);
              formData.append("year", profileForm.year);
              if (profileForm.profilePhoto) {
                formData.append("profile_photo", profileForm.profilePhoto);
              }

              handleAction(
                () =>
                  apiRequest("/alumni/profile", {
                    method: "PATCH",
                    token,
                    body: formData,
                  }),
                "Profile updated successfully."
              );
            }}
          >
            <div className="profile-side">
              <img
                className="avatar"
                src={
                  portal.profile.profilePhotoUrl ||
                  createAvatarPlaceholder(portal.profile.name || "Alumni", "A")
                }
                alt="Alumni profile"
              />
              <label>
                Profile Photo
                <input
                  type="file"
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      profilePhoto: event.target.files?.[0] || null,
                    }))
                  }
                />
              </label>
            </div>
            <div className="form-grid">
              <Field label="Name" value={profileForm.name} onChange={(value) => setProfileForm((current) => ({ ...current, name: value }))} />
              <Field label="Email" value={portal.profile.email || ""} readOnly />
              <Field label="Company" value={profileForm.company} onChange={(value) => setProfileForm((current) => ({ ...current, company: value }))} />
              <Field label="Graduation Year" value={profileForm.year} onChange={(value) => setProfileForm((current) => ({ ...current, year: value }))} />
              <div className="form-span">
                <button type="submit" className="primary-button" disabled={submitting}>
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        </section>
      )}
    </PortalLayout>
  );
}

function SummaryGrid({ items }) {
  return (
    <div className="summary-grid">
      {items.map(([label, value]) => (
        <article key={label} className="summary-card">
          <strong>{value}</strong>
          <span>{label}</span>
        </article>
      ))}
    </div>
  );
}

function NotificationList({ notifications }) {
  if (!notifications.length) {
    return <div className="panel-card">No notifications yet.</div>;
  }

  return (
    <div className="content-stack">
      {notifications.map((notification) => (
        <article key={notification.id} className="panel-card">
          <div className="section-header">
            <div>
              <h3>{notification.title || "Notification"}</h3>
              <p>{notification.message || ""}</p>
              <small>{formatDateTime(notification.created_at)}</small>
            </div>
            {notification.link ? (
              <Link className="secondary-button button-link" to={notification.link}>
                Open
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function ApplicationRow({ application, onSave, disabled }) {
  const [status, setStatus] = useState(application.status || "Applied");

  useEffect(() => {
    setStatus(application.status || "Applied");
  }, [application.status]);

  return (
    <tr>
      <td>{application.student_name || application.student_usn}</td>
      <td>{application.student_email || ""}</td>
      <td>{application.role || ""}</td>
      <td>{application.status || "Applied"}</td>
      <td>
        <div className="inline-actions">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {["Applied", "Reviewed", "Shortlisted", "Rejected", "Selected"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="primary-button"
            disabled={disabled}
            onClick={() => onSave(status)}
          >
            Save
          </button>
        </div>
      </td>
    </tr>
  );
}

function Field({ label, value, onChange, readOnly = false, type = "text" }) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </label>
  );
}
