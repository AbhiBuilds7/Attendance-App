function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic color from the name, so the same person always gets the same color
function getColor(name) {
  const colors = ["#4f46e5", "#7c3aed", "#0891b2", "#c2410c", "#15803d", "#be123c"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name, size = 36 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: getColor(name),
      }}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;