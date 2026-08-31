import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";

function Signup() {
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/signup-company", {
        companyName,
        companySlug,
        adminName,
        adminEmail,
        adminPassword,
        logoUrl,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("employeeId", response.data.employeeId);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("companyName", response.data.companyName);
      localStorage.setItem("logoUrl", response.data.logoUrl || "");

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-label">
            <span className="auth-pulse-dot" />
            Set up in under a minute
          </div>
          <h1 className="auth-brand-title">
            Bring your whole company on board.
          </h1>
          <p className="auth-brand-subtitle">
            Create your workspace, invite your team, and start tracking
            attendance today — no credit card required.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form onSubmit={handleSignup} className="auth-form-box">
          <h2>Create your company</h2>
          <p className="auth-form-subtitle">Get started in a few quick steps</p>

          {error && <p className="error-text">{error}</p>}

          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Company Code (e.g. acme)"
            value={companySlug}
            onChange={(e) => setCompanySlug(e.target.value.toLowerCase())}
            required
          />
          <input
            type="text"
            placeholder="Logo URL (optional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />

          <button type="submit">Create Company</button>

          <p className="auth-switch-link">
            Already have a company? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
