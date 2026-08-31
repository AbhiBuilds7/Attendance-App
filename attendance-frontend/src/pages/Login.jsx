import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
// import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companySlug, setCompanySlug] = useState(localStorage.getItem("lastCompanySlug") || "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/employees/${employeeId}`, profileForm);
      localStorage.setItem("name", profileForm.name);
      localStorage.setItem("email", profileForm.email);
      localStorage.setItem("department", profileForm.department);
      
      setMessage("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        companySlug,
        email,
        password,
      });
      // const response = await api.post("/auth/login", {
      //   companySlug,
      //   email,
      //   password,
      // });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("employeeId", response.data.employeeId);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("department", response.data.department);
      localStorage.setItem("companyName", response.data.companyName);
      localStorage.setItem("logoUrl", response.data.logoUrl || "");
      localStorage.setItem("lastCompanySlug", companySlug);

      if (
        response.data.role === "ADMIN" ||
        response.data.role === "SUPER_ADMIN"
      ) {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-label">
            <span className="auth-pulse-dot" />
            Live attendance, wherever work happens
          </div>
          <h1 className="auth-brand-title">
            Run your team's attendance without the spreadsheets.
          </h1>
          <p className="auth-brand-subtitle">
            Check-ins, leave, shifts, and reporting — all in one place, built
            for teams that move fast.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form onSubmit={handleLogin} className="auth-form-box">
          <h2>Welcome back</h2>
          <p className="auth-form-subtitle">Log in to your company workspace</p>

          {error && <p className="error-text">{error}</p>}

          <input
            type="text"
            placeholder="Company Code"
            value={companySlug}
            onChange={(e) => setCompanySlug(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          <p className="auth-switch-link">
            New here? <Link to="/signup">Create your company</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
