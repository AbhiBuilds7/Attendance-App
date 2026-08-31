import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import "./Layout.css";
import api from "../api/axiosConfig";

function Layout({
  navItems = [],
  activeItem,
  onNavChange,
  children,
  userName,
  userEmail,
  userRole,
  companyName,
  logoUrl,
  onLogout,
  onEditProfile,
  title,
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeLabel =
    title || navItems.find((n) => n.key === activeItem)?.label || "";

  const handleNavClick = (key) => {
    onNavChange(key);
    setSidebarOpen(false); // auto-close drawer after picking a tab, mobile only (harmless on desktop)
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={sidebarOpen ? "app-sidebar open" : "app-sidebar"}>
        <div className="sidebar-brand">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="brand-logo" />
          ) : (
            <span className="brand-dot" />
          )}
          <span className="brand-name">{companyName || "Attendance App"}</span>
        </div>
        {navItems.length > 0 && (
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={
                  activeItem === item.key ? "nav-item active" : "nav-item"
                }
                onClick={() => handleNavClick(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          {navItems.length > 0 && (
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
          )}
          <h1 className="topbar-title">{activeLabel}</h1>
          <div className="topbar-right">
            <div className="notification-wrapper">
              <button className="bell-trigger" onClick={handleBellClick}>
                🔔
                {unreadCount > 0 && (
                  <span className="bell-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="profile-menu-backdrop"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="notification-dropdown">
                    <div className="notification-header">Notifications</div>
                    {notifications.length === 0 ? (
                      <p className="notification-empty">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={
                            n.read
                              ? "notification-item"
                              : "notification-item unread"
                          }
                          onClick={() => !n.read && handleMarkRead(n.id)}
                        >
                          <p className="notification-message">{n.message}</p>
                          <span className="notification-time">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="profile-menu-wrapper">
              {/* ...existing avatar dropdown unchanged... */}
            </div>

            {/* <button className="btn-logout" onClick={onLogout}>
              Logout
            </button> */}
            <div className="profile-menu-wrapper">
              <button
                className="avatar-trigger"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Avatar name={userName} size={32} />
                <span className="user-name">{userName}</span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="profile-menu-backdrop"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="profile-menu-dropdown">
                    <div className="profile-menu-header">
                      <Avatar name={userName} size={44} />
                      <div>
                        <p className="profile-menu-name">{userName}</p>
                        {/* <p className="profile-menu-email">{userEmail}</p> */}
                        {userRole && (
                          <span className="profile-menu-role">{userRole}</span>
                        )}
                      </div>
                    </div>
                    <div className="profile-menu-divider" />
                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onEditProfile && onEditProfile();
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>

            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="app-content">
          <div className="table-scroll-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
