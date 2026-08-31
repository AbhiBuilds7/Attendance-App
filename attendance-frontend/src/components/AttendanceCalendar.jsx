function AttendanceCalendar({ attendanceRecords }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const recordsByDate = {};
  attendanceRecords.forEach((r) => {
    recordsByDate[r.date] = r.status;
  });

  const statusColor = {
    PRESENT: "#2ecc71",
    LATE: "#e67e22",
    HALF_DAY: "#f1c40f",
    ABSENT: "#e74c3c",
  };

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = recordsByDate[dateStr];

    cells.push(
      <div
        key={day}
        className="calendar-cell"
        style={{ backgroundColor: status ? statusColor[status] : "#f4f6f8" }}
        title={status || "No record"}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="calendar-grid">{cells}</div>
      <div className="calendar-legend">
        <span><span className="legend-dot" style={{ background: "#2ecc71" }}></span> Present</span>
        <span><span className="legend-dot" style={{ background: "#e67e22" }}></span> Late</span>
        <span><span className="legend-dot" style={{ background: "#f1c40f" }}></span> Half Day</span>
        <span><span className="legend-dot" style={{ background: "#f4f6f8", border: "1px solid #ccc" }}></span> No Record</span>
      </div>
    </div>
  );
}

export default AttendanceCalendar;