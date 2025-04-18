import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profileImage from "../assets/profile.png";
import "./logOut.css";

const Logout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-dropdown">
      <img
        src={profileImage}
        alt="Profile"
        className="profile-icon"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="dropdown-menu">
          <p onClick={handleLogout}>Logout</p>
        </div>
      )}
    </div>
  );
};

export default Logout;
