import React, { useEffect, useState } from "react";
import "../styles/adminuser.css";

function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApprovedUsers() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/kyc/requests?status=approved");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setUsers([]);
      }
      setLoading(false);
    }
    fetchApprovedUsers();
  }, []);

  return (
    <div className="admin-userlist-container" style={{ padding: "2rem" }}>
      <h2>Approved Users</h2>
      {loading ? (
        <div className="admin-userlist-message">Loading...</div>
      ) : users.length === 0 ? (
        <div className="admin-userlist-message">No approved users found.</div>
      ) : (
        <table className="admin-userlist-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Approved At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u._id}>
                <td>{idx + 1}</td>
                <td>{`${u.firstName || ""} ${u.lastName || ""}`.trim()}</td>
                <td>{u.email}</td>
                <td>{u.mobileNumber}</td>
                <td>
                  {`${u.houseName || ""}, ${u.landmark || ""}, ${u.city || ""}, ${u.state || ""}, ${u.pinCode || ""}`}
                </td>
                <td>{new Date(u.updatedAt || u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUserList;
