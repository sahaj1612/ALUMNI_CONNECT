import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PortalLayout } from "../components/PortalLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { createAvatarPlaceholder } from "../utils/avatar.js";
import { formatDate, formatDateTime } from "../utils/format.js";

const navigation = [
  { key: "dashboard", label: "Dashboard" },
  { key: "jobs", label: "View Jobs" },
  { key: "events", label: "View Events" },
  { key: "applied", label: "Applied Jobs" },
  { key: "registrations", label: "Event Registrations" },
  { key: "notifications", label: "Notifications" },
  { key: "profile", label: "Profile" },
];

const defaultFilters = {
  jobCompany: "",
  jobRole: "",
  jobDepartment: "",
  jobLocation: "",
  eventTitle: "",
  eventLocation: "",
  eventDate: "",
};

export function StudentPortalPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [portal, setPortal] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    department: "",
    batch: "",
    skills: "",
    profilePhoto: null,
    resume: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");

  const section = navigation.some((item) => item.key === searchParams.get("section"))
    ? searchParams.get("section")
    : "dashboard";

  async function loadPortal(activeFilters = filters) {
    const query = new URLSearchParams(
      Object.entries(activeFilters).filter(([, value]) => value)
    ).toString();

    const response = await apiRequest(`/student/portal${query ? `?${query}` : ""}`, { token });
    setPortal(response);
    setFilters(response.filters);
    setProfileForm({
      name: response.profile.name || "",
      phone: response.profile.phone || "",
      department: response.profile.department || "",
      batch: response.profile.batch || "",
      skills: response.profile.skills || "",
      profilePhoto: null,
      resume: null,
    });
  }

  useEffect(() => {
    loadPortal()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

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
    return <div className="screen-loader">Loading student dashboard...</div>;
  }

  if (!portal) {
    return <div className="screen-loader">{error || "Unable to load the dashboard."}</div>;
  }

  return (
    <PortalLayout
      title="Student Panel"
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
              ["Available Jobs", portal.summary.availableJobsCount],
              ["Upcoming Events", portal.summary.upcomingEventsCount],
              ["Applied Jobs", portal.summary.appliedJobsCount],
              ["Registered Events", portal.summary.registeredEventsCount],
              ["Unread Notifications", portal.summary.unreadNotificationsCount],
            ]}
          />
        </section>
      )}

      {section === "jobs" && (
        <section className="content-stack">
          <FilterGrid
            fields={[
              ["Company", "jobCompany"],
              ["Role", "jobRole"],
              ["Department", "jobDepartment"],
              ["Location", "jobLocation"],
            ]}
            filters={filters}
            onChange={setFilters}
            onApply={() =>
              handleAction(() => loadPortal(filters), "Job filters updated.")
            }
            onReset={() =>
              handleAction(() => loadPortal(defaultFilters), "Job filters cleared.")
            }
          />
          <div className="panel-card">
            <h3>Jobs List</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {portal.jobs.length ? (
                  portal.jobs.map((job) => (
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
                            className="primary-button"
                            disabled={portal.appliedJobIds.includes(job.id) || submitting}
                            onClick={() =>
                              handleAction(
                                () => apiRequest(`/student/jobs/${job.id}/apply`, { method: "POST", token }),
                                "Job application submitted successfully."
                              )
                            }
                          >
                            {portal.appliedJobIds.includes(job.id) ? "Applied" : "Apply"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No jobs are available right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {section === "events" && (
        <section className="content-stack">
          <FilterGrid
            fields={[
              ["Event Title", "eventTitle"],
              ["Location", "eventLocation"],
              ["Date", "eventDate", "date"],
            ]}
            filters={filters}
            onChange={setFilters}
            onApply={() =>
              handleAction(() => loadPortal(filters), "Event filters updated.")
            }
            onReset={() =>
              handleAction(() => loadPortal(defaultFilters), "Event filters cleared.")
            }
          />
          <div className="panel-card">
            <h3>Events</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {portal.events.length ? (
                  portal.events.map((event) => (
                    <tr key={event.id}>
                      <td>{event.title || ""}</td>
                      <td>{formatDate(event.date)}</td>
                      <td>{event.location || "Not specified"}</td>
                      <td>
                        <div className="inline-actions">
                          <Link className="secondary-button button-link" to={`/details/event/${event.id}`}>
                            View
                          </Link>
                          <button
                            type="button"
                            className="primary-button"
                            disabled={portal.registeredEventIds.includes(event.id) || submitting}
                            onClick={() =>
                              handleAction(
                                () =>
                                  apiRequest(`/student/events/${event.id}/register`, {
                                    method: "POST",
                                    token,
                                  }),
                                "Event registration successful."
                              )
                            }
                          >
                            {portal.registeredEventIds.includes(event.id) ? "Registered" : "Register"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No events have been posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {section === "applied" && (
        <section className="panel-card">
          <h3>Applied Jobs</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {portal.appliedJobs.length ? (
                portal.appliedJobs.map((application) => (
                  <tr key={application.id}>
                    <td>{application.company || ""}</td>
                    <td>{application.role || ""}</td>
                    <td>{application.status || "Applied"}</td>
                    <td>{formatDateTime(application.applied_at)}</td>
                    <td>
                      {application.resumeUrl ? (
                        <a href={application.resumeUrl} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        "Not uploaded"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    You have not applied for any jobs yet.
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
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {portal.registrations.length ? (
                portal.registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.event_title || ""}</td>
                    <td>{formatDate(registration.event_date)}</td>
                    <td>{registration.location || ""}</td>
                    <td>{registration.status || "Registered"}</td>
                    <td>{formatDateTime(registration.registered_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    You have not registered for any events yet.
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
              <p>Recent activity across your jobs, events, and applications.</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                handleAction(
                  () =>
                    apiRequest("/student/notifications/read-all", {
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
              formData.append("phone", profileForm.phone);
              formData.append("department", profileForm.department);
              formData.append("batch", profileForm.batch);
              formData.append("skills", profileForm.skills);
              if (profileForm.profilePhoto) {
                formData.append("profile_photo", profileForm.profilePhoto);
              }
              if (profileForm.resume) {
                formData.append("resume", profileForm.resume);
              }

              handleAction(
                () =>
                  apiRequest("/student/profile", {
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
                  createAvatarPlaceholder(portal.profile.name || "Student", "S")
                }
                alt="Student profile"
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
              <label>
                Resume
                <input
                  type="file"
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      resume: event.target.files?.[0] || null,
                    }))
                  }
                />
              </label>
              {portal.profile.resumeUrl ? (
                <a href={portal.profile.resumeUrl} target="_blank" rel="noreferrer">
                  Current Resume
                </a>
              ) : null}
            </div>
            <div className="form-grid">
              <Field
                label="Name"
                value={profileForm.name}
                onChange={(value) => setProfileForm((current) => ({ ...current, name: value }))}
              />
              <Field label="Email" value={portal.profile.email || ""} readOnly />
              <Field
                label="Phone"
                value={profileForm.phone}
                onChange={(value) => setProfileForm((current) => ({ ...current, phone: value }))}
              />
              <Field
                label="Department"
                value={profileForm.department}
                onChange={(value) =>
                  setProfileForm((current) => ({ ...current, department: value }))
                }
              />
              <Field
                label="Batch"
                value={profileForm.batch}
                onChange={(value) => setProfileForm((current) => ({ ...current, batch: value }))}
              />
              <Field
                label="Skills"
                value={profileForm.skills}
                onChange={(value) => setProfileForm((current) => ({ ...current, skills: value }))}
              />
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

function FilterGrid({ fields, filters, onChange, onApply, onReset }) {
  return (
    <div className="panel-card">
      <div className="form-grid">
        {fields.map(([label, key, type = "text"]) => (
          <label key={key}>
            {label}
            <input
              type={type}
              value={filters[key] || ""}
              onChange={(event) =>
                onChange((current) => ({ ...current, [key]: event.target.value }))
              }
            />
          </label>
        ))}
        <div className="inline-actions form-span">
          <button type="button" className="primary-button" onClick={onApply}>
            Apply Filters
          </button>
          <button type="button" className="secondary-button" onClick={onReset}>
            Clear
          </button>
        </div>
      </div>
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

function Field({ label, value, onChange, readOnly = false }) {
  return (
    <label>
      {label}
      <input
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </label>
  );
}
