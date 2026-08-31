import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import AttendanceCalendar from "../components/AttendanceCalendar";
import Pagination from "../components/Pagination";
import Layout from "../components/Layout";
import Avatar from "../components/Avatar";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const isSuperAdmin = role === "SUPER_ADMIN";
  // const availablePermissions = ["CREATE_EMPLOYEE", "EDIT_EMPLOYEE", "APPROVE_LEAVE", "EXPORT_REPORTS", "MANAGE_LEAVE_BALANCE"];

  const [employeePage, setEmployeePage] = useState(1);
  const itemsPerPage = 5;
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [editingBalance, setEditingBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [locationForm, setLocationForm] = useState({
    latitude: "",
    longitude: "",
    radius: "",
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [selectedEmpForCalendar, setSelectedEmpForCalendar] = useState(null);
  const [attendancePage, setAttendancePage] = useState(1);
  const [calendarAttendance, setCalendarAttendance] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });
  const [newEmployee, setNewEmployee] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    department: "",
    role: "EMPLOYEE",
  });
  const pieData = [
    { name: "Present", value: stats?.presentToday },
    { name: "Absent", value: stats?.absentToday },
    { name: "On Leave", value: stats?.onLeaveToday },
  ];
  const pieColors = ["#2ecc71", "#e74c3c", "#e67e22"];

  // useEffect(() => {
  //   fetchEmployees();
  //   fetchPendingLeaves();
  //   fetchStats();
  // }, []);

  // useEffect(() => {
  //   fetchEmployees();
  //   fetchPendingLeaves();
  // }, []);

  //   useEffect(() => {
  //   setAttendancePage(1);
  // }, [searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    fetchEmployees();
    fetchPendingLeaves();
    fetchStats();
    fetchShifts();
    fetchAllAttendance();
    fetchDepartments();
    fetchWeeklyTrend();
    setAttendancePage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const fetchAllAttendance = async () => {
    try {
      const res = await api.get("/attendance");
      setAllAttendance(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get("/shifts");
      setShifts(res.data);
    } catch (err) {
      console.error("Failed to fetch shifts", err);
    }
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shifts", newShift);
      setMessage("Shift added");
      setNewShift({ name: "", startTime: "", endTime: "" });
      fetchShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add shift");
    }
  };

  const handleDeleteShift = async (id) => {
    try {
      await api.delete(`/shifts/${id}`);
      setMessage("Shift removed");
      fetchShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove shift");
    }
  };

  const viewEmployeeCalendar = async (emp) => {
    try {
      const res = await api.get(`/attendance/employee/${emp.id}`);
      setCalendarAttendance(res.data);
      setSelectedEmpForCalendar(emp.name);
    } catch (err) {
      setMessage("Failed to load calendar");
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await api.get("/holidays");
      setHolidays(res.data);
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    }
  };
  const fetchWeeklyTrend = async () => {
    try {
      const res = await api.get("/attendance/weekly-trend");
      setWeeklyTrend(res.data);
    } catch (err) {
      console.error("Failed to fetch weekly trend", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPendingLeaves();
    fetchStats();
    fetchAllAttendance();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const startEdit = (emp) => {
    setEditingEmployee({ ...emp });
  };

  const startEditBalance = async (emp) => {
    try {
      const res = await api.get(`/leaves/balance/${emp.id}`);
      setEditingBalance({
        employeeId: emp.id,
        employeeName: emp.name,
        ...res.data,
      });
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to fetch leave balance",
      );
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
      setMessage("Password changed successfully");
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

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(
        `/leaves/balance/${editingBalance.employeeId}`,
        editingBalance,
      );
      setMessage("Leave balance updated!");
      setEditingBalance(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update balance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/company/location", {
        officeLatitude: parseFloat(locationForm.latitude),
        officeLongitude: parseFloat(locationForm.longitude),
        allowedRadiusMeters: parseInt(locationForm.radius),
      });
      setMessage("Office location saved");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save location");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/employees/${editingEmployee.id}`, editingEmployee);
      setMessage("Employee updated successfully!");
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update employee");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/attendance/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/employees", newEmployee);
      setMessage("Employee created successfully!");
      setNewEmployee({
        employeeId: "",
        name: "",
        email: "",
        password: "",
        department: "",
        role: "EMPLOYEE",
      });
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create employee");
    } finally {
      setIsLoading(false);
    }
  };

  const availablePermissions = [
    "CREATE_EMPLOYEE",
    "EDIT_EMPLOYEE",
    "APPROVE_LEAVE",
    "EXPORT_REPORTS",
    "MANAGE_LEAVE_BALANCE",
  ];

  const handlePermissionToggle = async (
    empId,
    currentPermissions,
    permission,
  ) => {
    const updated = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];

    try {
      await api.put(`/employees/${empId}/permissions`, updated);
      setMessage("Permissions updated");
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update permissions");
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get("/leaves/pending");
      setPendingLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch pending leaves", err);
    }
  };

  const handleLeaveDecision = async (leaveId, status) => {
    setIsLoading(true);
    try {
      await api.put(`/leaves/${leaveId}/status?status=${status}`);
      setMessage(`Leave ${status.toLowerCase()} successfully`);
      fetchPendingLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.post("/holidays", newHoliday);
      setMessage("Holiday added");
      setNewHoliday({ date: "", name: "" });
      fetchHolidays();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await api.delete(`/holidays/${id}`);
      setMessage("Holiday removed");
      fetchHolidays();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove holiday");
    }
  };

  const handleToggleActive = async (empId, isActive) => {
    try {
      const endpoint = isActive ? "deactivate" : "activate";
      await api.put(`/employees/${empId}/${endpoint}`);
      setMessage(`Employee ${isActive ? "deactivated" : "activated"}`);
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/attendance/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setMessage("Failed to export report");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredAttendance = allAttendance.filter((a) => {
    const matchesSearch =
      a.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchesDate = dateFilter === "" || a.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const attendanceTotalPages = Math.ceil(
    filteredAttendance.length / itemsPerPage,
  );
  const paginatedAttendance = filteredAttendance.slice(
    (attendancePage - 1) * itemsPerPage,
    attendancePage * itemsPerPage,
  );

  const employeeTotalPages = Math.ceil(employees.length / itemsPerPage);
  const paginatedEmployees = employees.slice(
    (employeePage - 1) * itemsPerPage,
    employeePage * itemsPerPage,
  );

  return (
    // <div className="dashboard-container">
    <Layout
      companyName={localStorage.getItem("companyName")}
      logoUrl={localStorage.getItem("logoUrl")}
      userName={name}
      userEmail={localStorage.getItem("email")}
      userRole={role}
      onLogout={handleLogout}
      onEditProfile={() => setShowProfile(true)}
      activeItem={activeTab}
      onNavChange={setActiveTab}
      navItems={[
        { key: "overview", label: "Overview", icon: "📊" },
        { key: "employees", label: "Employees", icon: "👥" },
        { key: "attendance", label: "Attendance", icon: "🕒" },
        { key: "leaves", label: "Leave Requests", icon: "🏖" },
        { key: "holidays", label: "Holidays", icon: "📅" },
        { key: "shifts", label: "Shifts", icon: "⏱" },
        ...(isSuperAdmin
          ? [{ key: "permissions", label: "Admin Permissions", icon: "🔐" }]
          : []),
      ]}
    >
      {showProfile && (
        <div className="profile-panel">
          <div className="profile-header">
            <Avatar name={name} size={64} />
            <div>
              <h3 className="profile-name">{name}</h3>
              <span className="profile-role-badge">{role}</span>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setShowProfile(false)}
            >
              Close
            </button>
          </div>

          <div className="profile-info-grid">
            <div className="profile-field">
              <span className="profile-label">Email</span>
              <span className="profile-value">
                {localStorage.getItem("email")}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Employee ID</span>
              <span className="profile-value">
                {localStorage.getItem("employeeId")}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-label">Role</span>
              <span className="profile-value">{role}</span>
            </div>
          </div>

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
      <button onClick={handleExportCSV} style={{ marginBottom: "12px" }}>
        Export Attendance CSV
      </button>
      {activeTab === "employees" && (
        <>
          <h3>Create New Employee</h3>
          <form onSubmit={handleCreateEmployee} className="leave-form">
            <input
              type="text"
              placeholder="Employee ID (e.g. EM004)"
              value={newEmployee.employeeId}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, employeeId: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newEmployee.password}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, password: e.target.value })
              }
              required
            />
            <select
              value={newEmployee.department}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, department: e.target.value })
              }
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                  {/* {<option value={d.name}>IT</option> } */}
                </option>
              ))}
            </select>
            <select
              value={newEmployee.role}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, role: e.target.value })
              }
            >
              <option value="EMPLOYEE">Employee</option>
              {isSuperAdmin && <option value="ADMIN">Admin</option>}
            </select>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Employee"}
            </button>
          </form>

          <h3>Employee List</h3>
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td data-label="Emp ID">{emp.employeeId}</td>
                  <td data-label="Name">{emp.name}</td>
                  <td data-label="Email">{emp.email}</td>
                  <td data-label="Department">{emp.department}</td>
                  <td data-label="Role">{emp.role}</td>
                  <td data-label="Status">
                    {emp.active ? "Active" : "Inactive"}
                  </td>
                  <td data-label="Action">
                    <div className="btn-group">
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-balance"
                        onClick={() => startEditBalance(emp)}
                      >
                        Balance
                      </button>
                      <button
                        className="btn-toggle"
                        onClick={() => handleToggleActive(emp.id, emp.active)}
                      >
                        {emp.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => viewEmployeeCalendar(emp)}
                      >
                        Calendar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={employeePage}
            totalPages={employeeTotalPages}
            onPageChange={setEmployeePage}
          />

          {editingEmployee && (
            <div className="leave-balance">
              <h3>Edit Employee</h3>
              <form onSubmit={handleEditSubmit} className="leave-form">
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={editingEmployee.employeeId}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      employeeId: e.target.value,
                    })
                  }
                />

                <select
                  value={editingEmployee.shift?.id || ""}
                  onChange={(e) => {
                    const selectedShift = shifts.find(
                      (s) => s.id === Number(e.target.value),
                    );
                    setEditingEmployee({
                      ...editingEmployee,
                      shift: selectedShift || null,
                    });
                  }}
                >
                  <option value="">No Shift (Default)</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime}-{s.endTime})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Name"
                  value={editingEmployee.name}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      name: e.target.value,
                    })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editingEmployee.email}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      email: e.target.value,
                    })
                  }
                />
                <select
                  value={newEmployee.department}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      department: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                      {/* <option value={d.name}>IT</option> */}
                    </option>
                  ))}
                </select>
                <select
                  value={editingEmployee.role}
                  onChange={(e) =>
                    setEditingEmployee({
                      ...editingEmployee,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="EMPLOYEE">Employee</option>
                  {isSuperAdmin && <option value="ADMIN">Admin</option>}
                  {isSuperAdmin && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </select>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {editingBalance && (
            <div className="leave-balance">
              <h3>Edit Leave Balance — {editingBalance.employeeName}</h3>
              <form onSubmit={handleBalanceSubmit} className="leave-form">
                <label>
                  Sick:
                  <input
                    type="number"
                    min=""
                    value={editingBalance.sickLeavesLeft}
                    onChange={(e) =>
                      setEditingBalance({
                        ...editingBalance,
                        sickLeavesLeft: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Casual:
                  <input
                    type="number"
                    min=""
                    value={editingBalance.casualLeavesLeft}
                    onChange={(e) =>
                      setEditingBalance({
                        ...editingBalance,
                        casualLeavesLeft: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Paid:
                  <input
                    type="number"
                    min=""
                    value={editingBalance.paidLeavesLeft}
                    onChange={(e) =>
                      setEditingBalance({
                        ...editingBalance,
                        paidLeavesLeft: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Balance"}
                </button>
                <button type="button" onClick={() => setEditingBalance(null)}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </>
      )}
      {activeTab === "overview" && stats && (
        <div className="stats-grid">
          <div className="charts-row">
            <div className="chart-card">
              <h4>Today's Breakdown</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h4>Last 7 Days — Present Count</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#2b3a55" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="stat-card">
            <h4>Total Employees</h4>
            <p>{stats.totalEmployees}</p>
          </div>
          <div className="stat-card present">
            <h4>Present Today</h4>
            <p>{stats.presentToday}</p>
          </div>
          <div className="stat-card absent">
            <h4>Absent Today</h4>
            <p>{stats.absentToday}</p>
          </div>
          <div className="stat-card leave">
            <h4>On Leave Today</h4>
            <p>{stats.onLeaveToday}</p>
          </div>
        </div>
      )}
      {selectedEmpForCalendar && (
        <div className="leave-balance">
          <h3>Attendance Calendar — {selectedEmpForCalendar}</h3>
          <AttendanceCalendar attendanceRecords={calendarAttendance} />
          <button onClick={() => setSelectedEmpForCalendar(null)}>Close</button>
        </div>
      )}
      {activeTab === "attendance" && (
        <>
          <h3>All Attendance Records</h3>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {(searchTerm || statusFilter !== "ALL" || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setDateFilter("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Emp ID</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendance.map((a) => (
                <tr key={a.id}>
                  <td data-label="Employee">{a.employee.name}</td>
                  <td data-label="Emp ID">{a.employee.employeeId}</td>
                  <td data-label="Date">{a.date}</td>
                  <td data-label="Check In">{a.checkInTime || "-"}</td>
                  <td data-label="Check Out">{a.checkOutTime || "-"}</td>
                  <td data-label="Status">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={attendancePage}
            totalPages={attendanceTotalPages}
            onPageChange={setAttendancePage}
          />
          {paginatedAttendance.length === 0 && (
            <p className="message">No records match your filters.</p>
          )}
        </>
      )}
      {activeTab === "leaves" && (
        <>
          <h3>Pending Leave Requests ({pendingLeaves.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td data-label="Employee">{leave.employee.name}</td>
                  <td data-label="Type">{leave.leaveType}</td>
                  <td data-label="From">{leave.fromDate}</td>
                  <td data-label="To">{leave.toDate}</td>
                  <td data-label="Reason">{leave.reason}</td>
                  <td data-label="Action">
                    <div className="btn-group">
                      <button
                        onClick={() =>
                          handleLeaveDecision(leave.id, "APPROVED")
                        }
                        disabled={isLoading}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleLeaveDecision(leave.id, "REJECTED")
                        }
                        disabled={isLoading}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {activeTab === "holidays" && (
        <>
          <h3>Add Holiday</h3>
          <form onSubmit={handleAddHoliday} className="leave-form">
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Holiday name (e.g. Diwali)"
              value={newHoliday.name}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, name: e.target.value })
              }
              required
            />
            <button type="submit">Add Holiday</button>
          </form>

          <h3>Holiday List</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id}>
                  <td data-label="Date">{h.date}</td>
                  <td data-label="Name">{h.name}</td>
                  <td data-label="Action">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteHoliday(h.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {activeTab === "shifts" && (
        <>
          <h3>Add Shift</h3>
          <form onSubmit={handleAddShift} className="leave-form">
            <input
              type="text"
              placeholder="Shift name (e.g. Morning)"
              value={newShift.name}
              onChange={(e) =>
                setNewShift({ ...newShift, name: e.target.value })
              }
              required
            />
            <input
              type="time"
              value={newShift.startTime}
              onChange={(e) =>
                setNewShift({ ...newShift, startTime: e.target.value })
              }
              required
            />
            <input
              type="time"
              value={newShift.endTime}
              onChange={(e) =>
                setNewShift({ ...newShift, endTime: e.target.value })
              }
              required
            />
            <button type="submit">Add Shift</button>
          </form>

          <h3>Shift List</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id}>
                  <td data-label="Name">{s.name}</td>
                  <td data-label="Start">{s.startTime}</td>
                  <td data-label="End">{s.endTime}</td>
                  <td data-label="Action">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteShift(s.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {activeTab === "permissions" && (
        <>
          {isSuperAdmin && (
            <>
              <h3>Manage Admin Permissions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    {availablePermissions.map((p) => (
                      <th key={p}>{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .filter((emp) => emp.role === "ADMIN")
                    .map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td>{emp.role}</td>
                        {availablePermissions.map((p) => (
                          <td key={p}>
                            <input
                              type="checkbox"
                              checked={emp.permissions?.includes(p) || false}
                              onChange={() =>
                                handlePermissionToggle(
                                  emp.id,
                                  emp.permissions || [],
                                  p,
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}
          {isSuperAdmin && (
            <div className="leave-balance" style={{ marginBottom: 20 }}>
              <h3>Office Location (for check-in radius)</h3>
              <form onSubmit={handleLocationUpdate} className="leave-form">
                <input
                  type="text"
                  placeholder="Latitude (e.g. 12.9716)"
                  value={locationForm.latitude}
                  onChange={(e) =>
                    setLocationForm({
                      ...locationForm,
                      latitude: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Longitude (e.g. 77.5946)"
                  value={locationForm.longitude}
                  onChange={(e) =>
                    setLocationForm({
                      ...locationForm,
                      longitude: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Allowed radius (meters, e.g. 200)"
                  value={locationForm.radius}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, radius: e.target.value })
                  }
                />
                <button type="submit">Save Location</button>
              </form>
            </div>
          )}
        </>
      )}
    </Layout>

    // </div>
  );
}

export default AdminDashboard;
