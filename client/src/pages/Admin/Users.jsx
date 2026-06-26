import React, { useState, useEffect } from 'react';
import { Shield, User, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/Loader/Loader';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users list:', err);
        setError('Failed to load user directory.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="admin-users-page">
      <div className="admin-page-header">
        <div>
          <h1>Registered Users</h1>
          <p className="admin-page-subtitle">View and audit all registered user and administrator accounts</p>
        </div>
      </div>

      {error && (
        <div className="admin-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-table-wrapper">
          {users.length === 0 ? (
            <p className="no-data-text">No registered users found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Type</th>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className={`user-icon-avatar ${isAdmin ? 'avatar-admin' : 'avatar-customer'}`}>
                          {isAdmin ? <Shield size={16} /> : <User size={16} />}
                        </div>
                      </td>
                      <td>
                        <span className="user-id-label">USR-{u.id}</span>
                      </td>
                      <td><b>{u.name}</b></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge badge-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
