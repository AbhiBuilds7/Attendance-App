import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AttendanceCalendar from "../components/AttendanceCalendar";
import api from "../api/axiosConfig";
import Layout from "../components/Layout";
import Avatar from "../components/Avatar";

function EmployeeDashboard() {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    department: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  // const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const email = localStorage.getItem("email");
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "SICK",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const employeeId = localStorage.getItem("employeeId");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchAttendance();
    fetchMyLeaves();
    fetchBalance();
    fetchMonthlySummary();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance/employee/${employeeId}`);
      setAttendance(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const res = await api.get(`/attendance/monthly-summary/${employeeId}`);
      setMonthlySummary(res.data);
    } catch (err) {
      console.error("Failed to fetch monthly summary", err);
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get(`/leaves/employee/${employeeId}`);
      setMyLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get(`/leaves/balance/${employeeId}`);
      setBalance(res.data);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysRecord = attendance.find((a) => a.date === todayStr);

  useEffect(() => {
    if (!todaysRecord || todaysRecord.checkOutTime) {
      setElapsedTime("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const [h, m, s] = todaysRecord.checkInTime.split(":").map(Number);
      const checkInDate = new Date();
      checkInDate.setHours(h, m, s, 0);

      const now = new Date();
      let diffMs = now - checkInDate;

      // subtract all completed breaks
      diffMs -= (todaysRecord.totalBreakMinutes || 0) * 60000;

      // if currently on break, freeze the timer at this exact point
      if (todaysRecord.breakStartTime) {
        const [bh, bm, bs] = todaysRecord.breakStartTime.split(":").map(Number);
        const breakStartDate = new Date();
        breakStartDate.setHours(bh, bm, bs, 0);
        diffMs -= now - breakStartDate; // cancels the live "now" growth
      }

      if (diffMs < 0) diffMs = 0;

      const hours = String(Math.floor(diffMs / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diffMs % 3600000) / 60000)).padStart(
        2,
        "0",
      );
      const seconds = String(Math.floor((diffMs % 60000) / 1000)).padStart(
        2,
        "0",
      );

      setElapsedTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [todaysRecord]);

  const handleCheckIn = () => {
    setIsLoading(true);

    if (!navigator.geolocation) {
      performCheckIn(null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        performCheckIn(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLoading(false);
        setMessage(
          "Location permission is required to check in. Please allow location access.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const performCheckIn = async (latitude, longitude) => {
    try {
      const body = latitude != null ? { latitude, longitude } : {};
      await api.post(`/attendance/checkin/${employeeId}`, body);
      setMessage("Checked in successfully!");
      fetchAttendance();
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await api.post(`/attendance/checkout/${employeeId}`);
      setMessage("Checked out successfully!");
      fetchAttendance();
    } catch (err) {
      setMessage(err.response?.data?.message || "Check-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setIsLoading(true);
    try {
      await api.post(`/attendance/break-start/${employeeId}`);
      setMessage("Break started");
      fetchAttendance();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start break");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setIsLoading(true);
    try {
      await api.post(`/attendance/break-end/${employeeId}`);
      setMessage("Break ended");
      fetchAttendance();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to end break");
    } finally {
      setIsLoading(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.put("/employees/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password changed successfully!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/leaves/apply/${employeeId}`, leaveForm);
      setMessage("Leave applied successfully!");
      setLeaveForm({ leaveType: "SICK", fromDate: "", toDate: "", reason: "" });
      fetchMyLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || "Leave application failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleProfile = () => {
    if (!showProfile) {
      setProfileForm({
        name: name,
        email: email,
        department: localStorage.getItem("department") || "",
      });
    }
    setShowProfile(!showProfile);
  };

  //
  let statusLabel = "Not Checked In";
  let statusClass = "status-pending";

  if (todaysRecord) {
    if (todaysRecord.checkOutTime) {
      statusLabel = `Checked Out at ${todaysRecord.checkOutTime}`;
      statusClass = "status-done";
    } else {
      statusLabel = `Checked In at ${todaysRecord.checkInTime} (${todaysRecord.status})`;
      statusClass = "status-active";
    }
  }

  return (
    <Layout
      companyName={localStorage.getItem("companyName")}
      logoUrl={localStorage.getItem("logoUrl")}
      userName={name}
      userEmail={email}
      userRole={role}
      onLogout={handleLogout}
      onEditProfile={() => setShowProfile(true)}
      activeItem={activeTab}
      onNavChange={setActiveTab}
      navItems={[
        { key: "overview", label: "Overview", icon: "📊" },
        { key: "attendance", label: "Attendance", icon: "🕒" },
        { key: "leave", label: "Leave", icon: "🏖" },
      ]}
    >
      {showProfile && (
        <div className="profile-panel">
          <div className="profile-header">
            <Avatar name={name} size={64} />
            <div>
              <h3 className="profile-name">{name}</h3>
              <span className="profile-role-badge">
                {localStorage.getItem("department")}
              </span>
            </div>
            {/* {!isEditingProfile && (
        <button className="btn-secondary" onClick={() => setIsEditingProfile(true)}>
          Edit Profile
        </button>
      )} */}
            <button
              className="btn-secondary"
              onClick={() => setShowProfile(false)}
            >
              Close
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="profile-info-grid">
              <div className="profile-field">
                <span className="profile-label">Email</span>
                <span className="profile-value">{email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Department</span>
                <span className="profile-value">
                  {localStorage.getItem("department")}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Employee ID</span>
                <span className="profile-value">
                  {localStorage.getItem("employeeId")}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="leave-form">
              <input
                type="text"
                placeholder="Name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={profileForm.department}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, department: e.target.value })
                }
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </button>
            </form>
          )}

          <div className="profile-divider" />

          <h4 className="profile-subheading">Change Password</h4>
          <form onSubmit={handleChangePassword} className="leave-form">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  oldPassword: e.target.value,
                })
              }
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}

      {message && <p className="message">{message}</p>}

      {activeTab === "overview" && (
        <>
          <div className={`today-status ${statusClass}`}>
            <h3>Today's Status</h3>
            <p>{statusLabel}</p>
            {todaysRecord && !todaysRecord.checkOutTime && (
              <p className="working-timer">⏱ {elapsedTime}</p>
            )}
            {todaysRecord && todaysRecord.totalBreakMinutes > 0 && (
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-ink-soft)",
                  marginTop: "4px",
                }}
              >
                Total break today: {todaysRecord.totalBreakMinutes} min
              </p>
            )}
          </div>

          {monthlySummary && (
            <div className="stats-grid">
              <div className="stat-card present">
                <h4>Present Days</h4>
                <p>{monthlySummary.presentDays}</p>
              </div>
              <div className="stat-card">
                <h4>Late Days</h4>
                <p>{monthlySummary.lateDays}</p>
              </div>
              <div className="stat-card leave">
                <h4>Half Days</h4>
                <p>{monthlySummary.halfDays}</p>
              </div>
              <div className="stat-card">
                <h4>Leaves Taken</h4>
                <p>{monthlySummary.leavesApproved}</p>
              </div>
            </div>
          )}

          <div className="attendance-actions">
            <button onClick={handleCheckIn} disabled={isLoading}>
              {isLoading ? "..." : "Check In"}
            </button>
            <button onClick={handleCheckOut} disabled={isLoading}>
              {isLoading ? "..." : "Check Out"}
            </button>
            {todaysRecord &&
              !todaysRecord.checkOutTime &&
              (todaysRecord.breakStartTime ? (
                <button
                  className="btn-break-active"
                  onClick={handleEndBreak}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Break Over"}
                </button>
              ) : (
                <button
                  className="btn-break"
                  onClick={handleStartBreak}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Break"}
                </button>
              ))}
          </div>
        </>
      )}

      {activeTab === "attendance" && (
        <>
          <h3>My Attendance History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td data-label="Date">{a.date}</td>
                  <td data-label="Check In">{a.checkInTime || "-"}</td>
                  <td data-label="Check Out">{a.checkOutTime || "-"}</td>
                  <td data-label="Status">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Attendance Calendar</h3>
          <AttendanceCalendar attendanceRecords={attendance} />
        </>
      )}

      {activeTab === "leave" && (
        <>
          <h3>Apply for Leave</h3>
          <form onSubmit={handleLeaveSubmit} className="leave-form">
            <select
              value={leaveForm.leaveType}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, leaveType: e.target.value })
              }
            >
              <option value="SICK">None</option>
              <option value="SICK">Sick</option>
              <option value="CASUAL">Casual</option>
              <option value="PAID">Paid</option>
            </select>
            <input
              type="date"
              value={leaveForm.fromDate}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, fromDate: e.target.value })
              }
              required
            />
            <input
              type="date"
              value={leaveForm.toDate}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, toDate: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Reason"
              value={leaveForm.reason}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, reason: e.target.value })
              }
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Applying..." : "Apply Leave"}
            </button>
          </form>

          {balance && (
            <div className="leave-balance">
              <h3>Leave Balance</h3>
              <p>
                Sick: {balance.sickLeavesLeft} | Casual:{" "}
                {balance.casualLeavesLeft} | Paid: {balance.paidLeavesLeft}
              </p>
            </div>
          )}

          <h3>My Leave History</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((l) => (
                <tr key={l.id}>
                  <td data-label="Type">{l.leaveType}</td>
                  <td data-label="From">{l.fromDate}</td>
                  <td data-label="To">{l.toDate}</td>
                  <td data-label="Reason">{l.reason}</td>
                  <td data-label="Status">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Layout>
  );
}

export default EmployeeDashboard;
