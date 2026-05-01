function initialsFromName(name = "", fallback = "A") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return fallback;
  }

  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export function createAvatarPlaceholder(name = "", fallback = "A") {
  const initials = initialsFromName(name, fallback);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef334a" />
          <stop offset="100%" stop-color="#8f0f21" />
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="28" fill="url(#bg)" />
      <circle cx="90" cy="72" r="28" fill="rgba(255,255,255,0.18)" />
      <path d="M45 146c8-24 26-36 45-36s37 12 45 36" fill="rgba(255,255,255,0.18)" />
      <text x="90" y="100" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
