import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/users/signup", {
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.message === "User already exists"
      ) {
        navigate("/login");
      } else {
        setErrors({ api: err.response?.data?.message || "Signup failed." });
      }
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Signup</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 characters)"
          type="password"
          required
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter Password"
          type="password"
          required
        />
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}

        {errors.api && <p className="error-text">{errors.api}</p>}

        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
