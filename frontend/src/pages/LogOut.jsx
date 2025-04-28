import React from "react";
import { useNavigate } from "react-router-dom";
import "./logOut.css";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="logout-container">
      <div className="logout-item" onClick={handleLogout}>
        <span className="logout-icon">⎋</span>
        <span>Log Out</span>
      </div>
    </div>
  );
};

export default Logout;
