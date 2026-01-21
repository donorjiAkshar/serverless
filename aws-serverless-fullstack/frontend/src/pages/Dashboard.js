import React from 'react';
import { useAuth } from '../auth/AuthContext';
import FileUpload from '../components/FileUpload';
import Notify from '../components/Notify';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <div className="user-info">
          <strong>Logged in as:</strong> {user?.attributes?.email}
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <h2>Dashboard</h2>
      
      <FileUpload />
      <Notify />
    </div>
  );
};

export default Dashboard;
