
import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

const API_URL = "https://bloodbank-4yqt.onrender.com/api";

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

export default function UserDashboard() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [requestGroup, setRequestGroup] = useState("");
  const [units, setUnits] = useState("1");
  const [hospitalName, setHospitalName] = useState("");
  const [requestCity, setRequestCity] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const searchDonors = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDonors([]);

    try {
      const params = {};

      if (bloodGroup) params.bloodGroup = bloodGroup;
      if (city.trim()) params.city = city.trim();

      const response = await axios.get(`${API_URL}/donors/search`, {
        headers: getHeaders(),
        params,
      });

      setDonors(response.data.donors || []);
      setMessage(`${response.data.count ?? 0} donors found.`);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to search donors."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get(`${API_URL}/blood-requests/my`, {
        headers: getHeaders(),
      });

      setRequests(response.data.requests || []);
      setMessage("Your blood requests loaded successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load your requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/blood-requests`,
        {
          patientName: patientName.trim(),
          bloodGroup: requestGroup,
          units: Number(units),
          hospitalName: hospitalName.trim(),
          city: requestCity.trim(),
          contactNumber: contactNumber.trim(),
        },
        { headers: getHeaders() }
      );

      setMessage(
        response.data.message || "Blood request created successfully."
      );

      setPatientName("");
      setRequestGroup("");
      setUnits("1");
      setHospitalName("");
      setRequestCity("");
      setContactNumber("");

      await loadMyRequests();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to create blood request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="User Dashboard">
      {message && (
        <div className="dashboard-message" role="status">
          {message}
        </div>
      )}

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="section-icon">🔎</span>
          <div>
            <h2>Search Blood Donors</h2>
            <p>Find donors by blood group and city.</p>
          </div>
        </div>

        <form onSubmit={searchDonors}>
          <div className="form-field">
            <label htmlFor="searchBloodGroup">Blood Group</label>
            <select
              id="searchBloodGroup"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">All blood groups</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="searchCity">City</label>
            <input
              id="searchCity"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bhagalpur"
            />
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Search Donors"}
          </button>
        </form>

        <div className="request-list">
          {donors.map((donor) => (
            <article className="request-card donor-card" key={donor._id}>
              <div>
                <h3>{donor.name}</h3>
                <p>City: {donor.city}</p>
              </div>
              <span className="blood-badge">{donor.bloodGroup}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="section-icon">🩸</span>
          <div>
            <h2>Create Blood Request</h2>
            <p>Enter the patient and hospital details.</p>
          </div>
        </div>

        <form onSubmit={createRequest}>
          <div className="form-field">
            <label htmlFor="patientName">Patient Name</label>
            <input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="requestGroup">Required Blood Group</label>
            <select
              id="requestGroup"
              value={requestGroup}
              onChange={(e) => setRequestGroup(e.target.value)}
              required
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="units">Units Required</label>
            <input
              id="units"
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="hospitalName">Hospital Name</label>
            <input
              id="hospitalName"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="requestCity">City</label>
            <input
              id="requestCity"
              value={requestCity}
              onChange={(e) => setRequestCity(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              id="contactNumber"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Blood Request"}
          </button>
        </form>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <span className="section-icon">📋</span>
          <div>
            <h2>My Blood Requests</h2>
            <p>Track your submitted requests.</p>
          </div>
        </div>

        <button
          className="secondary-btn"
          type="button"
          onClick={loadMyRequests}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh My Requests"}
        </button>

        <div className="request-list">
          {requests.map((request) => (
            <article className="request-card" key={request._id}>
              <div className="request-card-heading">
                <h3>{request.patientName}</h3>
                <span className="blood-badge">{request.bloodGroup}</span>
              </div>
              <p>Units: {request.units}</p>
              <p>Hospital: {request.hospitalName}</p>
              <p>City: {request.city}</p>
              <p>
                Status: <strong>{request.status}</strong>
              </p>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
