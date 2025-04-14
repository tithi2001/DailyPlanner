import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear any previous errors
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (
        err.response &&
        err.response.status === 401 &&
        err.response.data.message === "Invalid credentials"
      ) {
        setErrorMsg("Invalid credentials");
      } else {
        setErrorMsg("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
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
          placeholder="Password"
          type="password"
          required
        />

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        <button type="submit">Login</button>

        <p className="redirect-text">
          Don't have an account? <Link to="/">Signup</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
