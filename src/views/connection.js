import React, { useState, useEffect } from "react";
import "../styles/connection.css";

function ConnectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch requests from backend
  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        // Fetch all requests, not just pending
        const res = await fetch("http://localhost:5000/api/kyc/requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setRequests([]);
      }
      setLoading(false);
    }
    fetchRequests();
  }, []);

  // Approve/Reject handler
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/kyc/requests/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req._id === id ? { ...req, status: action } : req
          )
        );
      }
    } catch (err) {
      // handle error
    }
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "status-approved";
    if (status === "rejected") return "status-rejected";
    return "status-pending";
  };

  return (
    <div className="connection-floating-bg">
      <div className="connection-floating-box dark">
        <h2 className="connection-header">User Connection Requests</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
        <table className="requests-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={req._id}>
                <td>{idx + 1}</td>
                <td>{`${req.firstName || ""} ${req.lastName || ""}`.trim()}</td>
                <td>{req.email}</td>
                <td>{new Date(req.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`status ${getStatusClass(req.status)}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </td>
                <td className="action-buttons">
                  {req.status === "pending" ? (
                    <>
                      <button
                        className="btn btn-approve"
                        onClick={() => handleAction(req._id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => handleAction(req._id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="no-action">No Action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export default ConnectionRequests;