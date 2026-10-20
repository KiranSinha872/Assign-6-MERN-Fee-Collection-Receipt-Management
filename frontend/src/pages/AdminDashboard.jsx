
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = "http://localhost:5002/api/blood-requests";

const STATUSES = ["Pending", "Accepted", "Completed", "Cancelled"];

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const params = {};

      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (city.trim()) params.city = city.trim();
      if (status) params.status = status;

      const response = await axios.get(API_URL, {
        headers: getHeaders(),
        params,
      });

      setRequests(response.data.requests || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Requests load nahi hui. Admin login check karo."
      );
    } finally {
      setLoading(false);
    }
  }, [bloodGroup, city, status]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const updateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    setMessage("");

    try {
      await axios.patch(
        `${API_URL}/${requestId}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );

      setRequests((previous) =>
        previous.map((request) =>
          request._id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );

      setMessage("Blood request status updated successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Status update nahi hua. Please try again."
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {message && (
        <div className="dashboard-message" role="status">
          {message}
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon">📋</span>
          <p>Total Requests</p>
          <h2>{requests.length}</h2>
        </article>

        <article className="stat-card">
          <span className="stat-icon">⏳</span>
          <p>Pending</p>
          <h2>
            {requests.filter((item) => item.status === "Pending").length}
          </h2>
        </article>

        <article className="stat-card">
          <span className="stat-icon">✅</span>
          <p>Completed</p>
          <h2>
            {requests.filter((item) => item.status === "Completed").length}
          </h2>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="section-icon">🩸</span>
          <div>
            <h2>Manage Blood Requests</h2>
            <p>Review requests and update their status.</p>
          </div>
        </div>

        <form
          className="filter-form"
          onSubmit={(e) => {
            e.preventDefault();
            loadRequests();
          }}
        >
          <div className="form-field">
            <label htmlFor="adminBloodGroup">Blood Group</label>
            <select
              id="adminBloodGroup"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">All groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="adminCity">City</label>
            <input
              id="adminCity"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city"
            />
          </div>

          <div className="form-field">
            <label htmlFor="adminStatus">Status</label>
            <select
              id="adminStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            Apply Filters
          </button>

          <button
            className="secondary-btn"
            type="button"
            onClick={() => {
              setBloodGroup("");
              setCity("");
              setStatus("");
            }}
          >
            Clear Filters
          </button>
        </form>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="section-icon">📑</span>
          <div>
            <h2>Blood Requests</h2>
            <p>{requests.length} request(s) found.</p>
          </div>
        </div>

        <button
          type="button"
          className="secondary-btn"
          onClick={loadRequests}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Requests"}
        </button>

        {loading && requests.length === 0 ? (
          <p>Loading blood requests...</p>
        ) : requests.length === 0 ? (
          <p className="empty-state">No blood requests found.</p>
        ) : (
          <div className="request-list">
            {requests.map((request) => (
              <article className="request-card" key={request._id}>
                <div className="request-card-heading">
                  <div>
                    <h3>{request.patientName}</h3>
                    <p className="request-id">
                      ID: {request._id}
                    </p>
                  </div>

                  <span className="blood-badge">
                    {request.bloodGroup}
                  </span>
                </div>

                <div className="request-details">
                  <p><strong>Units:</strong> {request.units}</p>
                  <p><strong>Hospital:</strong> {request.hospitalName}</p>
                  <p><strong>City:</strong> {request.city}</p>
                  <p><strong>Contact:</strong> {request.contactNumber}</p>
                  <p><strong>Requester ID:</strong> {request.requester}</p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="status-controls">
                  <span className="status-label">
                    Current: <strong>{request.status}</strong>
                  </span>

                  <label htmlFor={`status-${request._id}`}>
                    Update status
                  </label>

                  <select
                    id={`status-${request._id}`}
                    value={request.status}
                    disabled={updatingId === request._id}
                    onChange={(e) =>
                      updateStatus(request._id, e.target.value)
                    }
                  >
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  {updatingId === request._id && (
                    <span>Updating...</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
