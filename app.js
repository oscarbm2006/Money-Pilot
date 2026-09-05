const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId
} = React;

/* ============================================================
   SUPABASE — cliente y configuración
   ============================================================ */
const SUPABASE_URL = "https://yhxebtkxagxowrvrqssf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeGVidGt4YWd4b3dydnJxc3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTc0MTMsImV4cCI6MjEwMzA5MzQxM30.Mt9vWxpTP-YnZp38qtBAuZVmMMKmIxIKyXA4ni4WZzM";
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   PALETA
   ============================================================ */
const PATTERN_URI_STATIC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCAxNjAwIDEwMDAiPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJnYmxvYiIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDIxNywxNzgsMTE4LDAuMTYpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJyZ2JhKDIxNywxNzgsMTE4LDApIi8+PC9yYWRpYWxHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJ0YmxvYiIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDExMSwxOTAsMTc4LDAuMTYpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJyZ2JhKDExMSwxOTAsMTc4LDApIi8+PC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8cG9seWdvbiBwb2ludHM9IjIyNC4wMCw2MC4wMCAyNzUuOTYsOTAuMDAgMjc1Ljk2LDE1MC4wMCAyMjQuMDAsMTgwLjAwIDE3Mi4wNCwxNTAuMDAgMTcyLjA0LDkwLjAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNzAiLz48cG9seWdvbiBwb2ludHM9IjIyNC4wMCwtMi4wMCAzMjkuNjYsNTkuMDAgMzI5LjY2LDE4MS4wMCAyMjQuMDAsMjQyLjAwIDExOC4zNCwxODEuMDAgMTE4LjM0LDU5LjAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNjEiLz48cG9seWdvbiBwb2ludHM9IjIyNC4wMCwtNjQuMDAgMzgzLjM1LDI4LjAwIDM4My4zNSwyMTIuMDAgMjI0LjAwLDMwNC4wMCA2NC42NSwyMTIuMDAgNjQuNjUsMjguMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC41MiIvPjxwb2x5Z29uIHBvaW50cz0iMjI0LjAwLC0xMjYuMDAgNDM3LjA0LC0zLjAwIDQzNy4wNCwyNDMuMDAgMjI0LjAwLDM2Ni4wMCAxMC45NiwyNDMuMDAgMTAuOTYsLTMuMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC40MyIvPjxwb2x5Z29uIHBvaW50cz0iMjI0LjAwLC0xODguMDAgNDkwLjc0LC0zNC4wMCA0OTAuNzQsMjc0LjAwIDIyNC4wMCw0MjguMDAgLTQyLjc0LDI3NC4wMCAtNDIuNzQsLTM0LjAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuMzQiLz48cG9seWdvbiBwb2ludHM9IjIyNC4wMCwtMjUwLjAwIDU0NC40MywtNjUuMDAgNTQ0LjQzLDMwNS4wMCAyMjQuMDAsNDkwLjAwIC05Ni40MywzMDUuMDAgLTk2LjQzLC02NS4wMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjI1Ii8+PHBvbHlnb24gcG9pbnRzPSIxNDkwLjEyLDgxMi4zOSAxNTM5LjYxLDg2MS44OCAxNTIxLjUwLDkyOS41MCAxNDUzLjg4LDk0Ny42MSAxNDA0LjM5LDg5OC4xMiAxNDIyLjUwLDgzMC41MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDExMSwxOTAsMTc4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjcwIi8+PHBvbHlnb24gcG9pbnRzPSIxNTA1LjEzLDc1Ni4zNiAxNTk1LjY0LDg0Ni44NyAxNTYyLjUxLDk3MC41MSAxNDM4Ljg3LDEwMDMuNjQgMTM0OC4zNiw5MTMuMTMgMTM4MS40OSw3ODkuNDkiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMTEsMTkwLDE3OCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC42MSIvPjxwb2x5Z29uIHBvaW50cz0iMTUyMC4xNCw3MDAuMzQgMTY1MS42Niw4MzEuODYgMTYwMy41MiwxMDExLjUyIDE0MjMuODYsMTA1OS42NiAxMjkyLjM0LDkyOC4xNCAxMzQwLjQ4LDc0OC40OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDExMSwxOTAsMTc4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjUyIi8+PHBvbHlnb24gcG9pbnRzPSIxNTM1LjE1LDY0NC4zMSAxNzA3LjY5LDgxNi44NSAxNjQ0LjUzLDEwNTIuNTMgMTQwOC44NSwxMTE1LjY5IDEyMzYuMzEsOTQzLjE1IDEyOTkuNDcsNzA3LjQ3IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTExLDE5MCwxNzgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNDMiLz48cG9seWdvbiBwb2ludHM9IjE1NTAuMTYsNTg4LjI5IDE3NjMuNzEsODAxLjg0IDE2ODUuNTUsMTA5My41NSAxMzkzLjg0LDExNzEuNzEgMTE4MC4yOSw5NTguMTYgMTI1OC40NSw2NjYuNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMTEsMTkwLDE3OCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC4zNCIvPjxwb2x5Z29uIHBvaW50cz0iMTU2NS4xNyw1MzIuMjcgMTgxOS43Myw3ODYuODMgMTcyNi41NiwxMTM0LjU2IDEzNzguODMsMTIyNy43MyAxMTI0LjI3LDk3My4xNyAxMjE3LjQ0LDYyNS40NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDExMSwxOTAsMTc4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjI1Ii8+PHBvbHlnb24gcG9pbnRzPSIxNTgwLjE5LDQ3Ni4yNCAxODc1Ljc2LDc3MS44MSAxNzY3LjU3LDExNzUuNTcgMTM2My44MSwxMjgzLjc2IDEwNjguMjQsOTg4LjE5IDExNzYuNDMsNTg0LjQzIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTExLDE5MCwxNzgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuMTYiLz48cG9seWdvbiBwb2ludHM9IjEzNjUuNTcsNjAuMzkgMTM5Ny4wOSw4NS4wMiAxMzkxLjUyLDEyNC42MyAxMzU0LjQzLDEzOS42MSAxMzIyLjkxLDExNC45OCAxMzI4LjQ4LDc1LjM3IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC40NSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjcwIi8+PHBvbHlnb24gcG9pbnRzPSIxMzcxLjk3LDE0Ljg0IDE0MzkuNzQsNjcuNzggMTQyNy43NywxNTIuOTUgMTM0OC4wMywxODUuMTYgMTI4MC4yNiwxMzIuMjIgMTI5Mi4yMyw0Ny4wNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuNDUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC42MSIvPjxwb2x5Z29uIHBvaW50cz0iMTM3OC4zNywtMzAuNzIgMTQ4Mi4zOSw1MC41NSAxNDY0LjAyLDE4MS4yNyAxMzQxLjYzLDIzMC43MiAxMjM3LjYxLDE0OS40NSAxMjU1Ljk4LDE4LjczIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC40NSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjUyIi8+PHBvbHlnb24gcG9pbnRzPSIxMzg0Ljc3LC03Ni4yNyAxNTI1LjA0LDMzLjMyIDE1MDAuMjcsMjA5LjU5IDEzMzUuMjMsMjc2LjI3IDExOTQuOTYsMTY2LjY4IDEyMTkuNzMsLTkuNTkiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjQ1KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNDMiLz48ZWxsaXBzZSBjeD0iMjQwIiBjeT0iMTUwIiByeD0iMjYwIiByeT0iMjIwIiBmaWxsPSJ1cmwoI2dibG9iKSIvPjxlbGxpcHNlIGN4PSIxNDQwIiBjeT0iODUwIiByeD0iMzAwIiByeT0iMjUwIiBmaWxsPSJ1cmwoI3RibG9iKSIvPjxsaW5lIHgxPSIyODQuMCIgeTE9IjEyMC4wIiB4Mj0iOTUzLjIiIHkyPSI2MjguNiIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuMjIpIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMjc2LjAiIHkxPSIxNTAuMCIgeDI9Ijg2OC40IiB5Mj0iNjg3LjkiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjIyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGxpbmUgeDE9IjI1NC4wIiB5MT0iMTcyLjAiIHgyPSI3NjUuMyIgeTI9IjY5Ny4wIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC4yMikiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSIyMjQuMCIgeTE9IjE4MC4wIiB4Mj0iNjcxLjQiIHkyPSI2NTMuMiIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuMjIpIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMTk0LjAiIHkxPSIxNzIuMCIgeDI9IjYxMi4xIiB5Mj0iNTY4LjQiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjIyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAyMjQuMDAwMDAwMDAwMDAwMDMgMTA0LjAgTCAyMzguMDAwMDAwMDAwMDAwMDMgMTExLjAgTCAyMzguMDAwMDAwMDAwMDAwMDMgMTI0LjAgUSAyMzguMDAwMDAwMDAwMDAwMDMgMTM2LjAgMjI0LjAwMDAwMDAwMDAwMDAzIDE0Mi4wIFEgMjEwLjAwMDAwMDAwMDAwMDAzIDEzNi4wIDIxMC4wMDAwMDAwMDAwMDAwMyAxMjQuMCBMIDIxMC4wMDAwMDAwMDAwMDAwMyAxMTEuMCBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjgiLz48ZyBmaWxsPSJyZ2JhKDExMSwxOTAsMTc4LDAuNTUpIj48cmVjdCB4PSIxNDU2LjAiIHk9Ijg4Mi4wIiB3aWR0aD0iNyIgaGVpZ2h0PSIxNiIgcng9IjEuNSIvPjxyZWN0IHg9IjE0NjcuMCIgeT0iODcwLjAiIHdpZHRoPSI3IiBoZWlnaHQ9IjI4IiByeD0iMS41Ii8+PHJlY3QgeD0iMTQ3OC4wIiB5PSI4NjIuMCIgd2lkdGg9IjciIGhlaWdodD0iMzYiIHJ4PSIxLjUiLz48L2c+Cjwvc3ZnPg==";
const C = {
  navy: "#312E81",
  navyMed: "#312E81",
  // "sand" es un nombre histórico (heredado de una paleta dorada anterior) que se
  // quedó tras migrar el valor real a indigo. Se mantiene sin tocar en las ~40
  // referencias existentes para no arriesgar una regresión visual; "primary" es
  // el alias correcto para cualquier código nuevo — ambos apuntan al mismo color.
  sand: "#4F46E5",
  sandLight: "rgba(79,70,229,0.10)",
  get primary() {
    return this.sand;
  },
  get primaryLight() {
    return this.sandLight;
  },
  paper: "#FAFAFA",
  surface: "#FFFFFF",
  ink: "#1E1E2E",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  border: "#E5E7EB",
  white: "#FFFFFF",
  crit: "#EF4444",
  critText: "#B91C1C",
  critLight: "rgba(239,68,68,0.10)",
  mej: "#F59E0B",
  mejLight: "rgba(245,158,11,0.10)",
  salu: "#10B981",
  saluLight: "rgba(16,185,129,0.10)",
  exc: "#0EA5E9",
  excLight: "rgba(14,165,233,0.10)",
  slate: "#64748B",
  bgDeep: "#F5F6FA",
  bgDeepMid: "#F1F3F9",
  navGlass: "rgba(255,255,255,0.94)",
  glow1: "#4F46E5",
  glow2: "#10B981",
  glow3: "#0EA5E9",
  glassBorder: "#E5E7EB"
};

/* ============================================================
   ICONOS (SVG minimalistas propios, sin dependencias externas)
   ============================================================ */
function Ico({
  path,
  size = 16,
  color = "currentColor",
  strokeWidth = 2,
  viewBox = "0 0 24 24",
  filled
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: viewBox,
    fill: filled ? color : "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: path
  }));
}
const I = {
  eye: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z"
  }),
  eyeOff: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.3 20.3 0 015.06-6.06M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 8 11 8a20.3 20.3 0 01-3.22 4.44 M14.12 14.12a3 3 0 11-4.24-4.24 M1 1l22 22"
  }),
  // UX compatibility: aliases to icons already present in the base icon set.
  alertTriangle: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 9v4M12 17h.01M10.3 3.2L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.2a2 2 0 00-3.4 0z"
  }),
  checkCircle: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M22 11.1V12a10 10 0 11-5.9-9.1 M22 4l-10 10-3-3"
  }),
  arrowRight: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M5 12h14M13 5l7 7-7 7"
  }),
  arrowLeft: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M19 12H5M11 19l-7-7 7-7"
  }),
  chevronLeft: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M15 18l-6-6 6-6"
  }),
  chevronRight: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M9 18l6-6-6-6"
  }),
  chevronDown: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M6 9l6 6 6-6"
  }),
  plus: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 5v14M5 12h14"
  }),
  trash: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"
  }),
  edit: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4z"
  }),
  wallet: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4"
  }),
  receipt: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M4 3h16v18l-3-2-3 2-3-2-3 2-3-2-1 2z M8 8h8M8 12h8M8 16h5"
  }),
  piggy: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M11 17v3M4.5 16.5C3 17.8 2.5 19 2.5 19s3-.2 4.5-1.6M20 13v-3a6 6 0 00-8.3-5.5L9 6l-1.5-1M20 13a3 3 0 010 4h-2M4 12a6 6 0 016-6h4v6.5"
  }),
  shield: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"
  }),
  shieldCheck: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z M9 12l2 2 4-4"
  }),
  chartPie: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M21 12a9 9 0 10-9 9V12h9z M13 3a9 9 0 018 8h-8V3z"
  }),
  chartLine: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M3 3v18h18 M19 9l-5 5-4-4-4 4"
  }),
  dashboard: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M4 4h6v7H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 15h6v5H4z"
  }),
  newspaper: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M4 4h13a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2z M4 8h13 M4 12h13 M4 16h9"
  }),
  info: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 16v-4 M12 8h.01"
  }),
  check: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22a10 10 0 100-20 10 10 0 000 20z M9 12l2 2 4-4"
  }),
  x: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22a10 10 0 100-20 10 10 0 000 20z M15 9l-6 6M9 9l6 6"
  }),
  alert: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 9v4m0 4h.01M10.3 3.9L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
  }),
  sparkles: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"
  }),
  target: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 16a4 4 0 100-8 4 4 0 000 8z M12 13a1 1 0 100-2 1 1 0 000 2z"
  }),
  gradCap: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M22 10L12 5 2 10l10 5 10-5z M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"
  }),
  baby: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M9 12a3 3 0 006 0 M12 3a9 9 0 00-9 9v6a2 2 0 002 2h14a2 2 0 002-2v-6a9 9 0 00-9-9z"
  }),
  rocket: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 2c3 2 5 6 5 10-2 0-4-1-5-2-1 1-3 2-5 2 0-4 2-8 5-10z M8 15l-3 3M16 15l3 3M10 17v3M14 17v3"
  }),
  sunrise: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 3v5M5 12H2M22 12h-3M4.2 19h15.6M8 8l-2-2M18 8l2-2M7 15a5 5 0 0110 0"
  }),
  sunset: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 13V8M5 12H2M22 12h-3M4.2 19h15.6M8 6l-2 2M18 6l2 2M17 15a5 5 0 00-10 0"
  }),
  house: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M3 11l9-8 9 8M5 10v10h14V10"
  }),
  car: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M5 17h14M5 17a2 2 0 104 0M15 17a2 2 0 104 0M3 17V11l2-5h14l2 5v6M3 11h18"
  }),
  plane: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 2l3 7 7 3-7 1-3 9-3-9-7-1 7-3z"
  }),
  landmark: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6M6 10v7M12 10v7M18 10v7"
  }),
  clipboard: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M9 3h6a1 1 0 011 1v1H8V4a1 1 0 011-1z M6 5h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z M9 12l2 2 4-4"
  }),
  briefcase: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M3 7h18v13H3z M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
  }),
  download: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
  }),
  compass: p => /*#__PURE__*/React.createElement(Ico, {
    ...p,
    path: "M12 22a10 10 0 100-20 10 10 0 000 20z M16 8l-2 6-6 2 2-6z"
  })
};

/* ============================================================
   CONSTANTES DE NEGOCIO
   ============================================================ */
const GASTOS_FIJOS_DEF = [{
  key: "alquiler",
  label: "Alquiler / hipoteca"
}, {
  key: "alimentacion",
  label: "Alimentación (supermercado)"
}, {
  key: "suministros",
  label: "Luz, agua e internet"
}, {
  key: "transporte",
  label: "Transporte"
}, {
  key: "seguros",
  label: "Seguros"
}, {
  key: "salud",
  label: "Salud y farmacia"
}, {
  key: "suscripciones",
  label: "Suscripciones"
}];
const GASTOS_DISC_DEF = [{
  key: "ocio",
  label: "Ocio"
}, {
  key: "salidas",
  label: "Salidas y restaurantes"
}, {
  key: "ropa",
  label: "Ropa"
}, {
  key: "compras",
  label: "Compras (tecnología, caprichos)"
}, {
  key: "cuidadoPersonal",
  label: "Cuidado personal"
}, {
  key: "hormiga",
  label: "Gasto hormiga"
}];
const FRECUENCIAS = [{
  value: "mensual",
  label: "/mes",
  divisor: 1
}, {
  value: "trimestral",
  label: "/trim.",
  divisor: 3
}, {
  value: "anual",
  label: "/año",
  divisor: 12
}];
const OBJETIVOS_DEF = [{
  id: "casa",
  label: "Comprar una casa",
  icon: I.house
}, {
  id: "coche",
  label: "Comprar un coche",
  icon: I.car
}, {
  id: "vacaciones",
  label: "Unas vacaciones",
  icon: I.plane
}, {
  id: "estudios",
  label: "Estudios / formación",
  icon: I.gradCap
}, {
  id: "libertad",
  label: "Preparar una jubilación más tranquila",
  icon: I.sunrise
}, {
  id: "poder_adquisitivo",
  label: "Proteger el valor de mis ahorros",
  icon: I.shieldCheck
}, {
  id: "otro",
  label: "Otro objetivo",
  icon: I.target
}];
const PRIORIDADES_OBJETIVO = ["alta", "media", "baja"];
const PRIORIDAD_LABEL = {
  alta: "Alta",
  media: "Media",
  baja: "Baja"
};
const QUIZ_DEF = {
  edad: {
    id: "edad",
    texto: "¿Cuántos años tienes?",
    opciones: ["Más de 60 años", "Entre 51 y 60 años", "Entre 36 y 50 años", "Menos de 36 años"],
    nota: "Es solo un dato de contexto: no determina tu perfil por sí sola, tu horizonte se pregunta aparte."
  },
  disposicionInvertir: {
    id: "disposicionInvertir",
    texto: "¿Estarías dispuesto/a a invertir tu dinero?",
    opciones: ["No, prefiero no invertir", "No lo tengo claro / no sé qué haría", "Sí, con precaución", "Sí, sin problema"],
    nota: "Invertir significa asumir cierto riesgo a cambio de la posibilidad de que tu dinero crezca más rápido, o de necesitar menos aportación mensual para llegar a tus objetivos a largo plazo. Ahorrar en cuentas o depósitos es más seguro, pero normalmente crece mucho más despacio."
  },
  objetivo: {
    id: "objetivo",
    texto: "Al invertir este dinero, ¿qué es lo que más te importa?",
    opciones: ["No perder nada de mi dinero", "Tener un ingreso extra estable", "Que crezca de forma moderada", "Que crezca todo lo posible, aunque haya riesgo"],
    nota: "Con esto medimos qué priorizas: la seguridad o el crecimiento."
  },
  objetivoTipo: {
    id: "objetivoTipo",
    texto: "¿Para qué quieres principalmente este dinero?",
    opciones: ["Vivienda", "Coche", "Vacaciones", "Estudios / formación", "Preparar una jubilación más tranquila", "Proteger el valor de mis ahorros", "Otro"],
    nota: "Según para qué es el dinero, adaptamos las siguientes preguntas a tu situación."
  },
  horizonte: {
    id: "horizonte",
    texto: "¿Dentro de cuántos años crees que necesitarás este dinero?",
    opciones: ["Menos de 2 años", "Entre 2 y 5 años", "Entre 5 y 10 años", "Más de 10 años"],
    nota: "Esto es independiente de tu edad: nos dice cuánto tiempo puede quedarse invertido el dinero."
  },
  estabilidad: {
    id: "estabilidad",
    texto: "¿Cómo describirías tus ingresos cada mes?",
    opciones: ["Cambian mucho y no tengo nada ahorrado como colchón", "Son estables, pero mi colchón cubre menos de 1 mes de gastos", "Son estables y mi colchón cubre entre 1 y 3 meses de gastos", "Son muy estables y mi colchón cubre más de 3 meses de gastos"],
    nota: "Cuanto más estables sean tus ingresos y más colchón tengas, más margen real tienes para asumir riesgo."
  },
  concentracion: {
    id: "concentracion",
    texto: "El dinero que quieres invertir, ¿qué parte es de todo tu ahorro?",
    opciones: ["Prácticamente todo mi ahorro", "La mayor parte de mi ahorro", "Una parte importante, pero tengo más ahorro aparte", "Solo una parte pequeña de mi ahorro"],
    nota: "No es lo mismo arriesgar todo tu ahorro que solo una parte pequeña de él."
  },
  liquidez: {
    id: "liquidez",
    texto: "¿Cuándo podrías necesitar usar este dinero?",
    opciones: ["En cualquier momento", "Durante el próximo año", "No antes de 2-3 años", "No lo necesitaré en muchos años"],
    nota: "Cuanto antes puedas necesitar el dinero, menos conviene tenerlo en algo que pueda bajar de valor."
  },
  liquidezDetalle: {
    id: "liquidezDetalle",
    texto: "Si tuvieras que usar parte de este dinero antes de lo previsto, ¿cuánto necesitarías?",
    opciones: ["Prácticamente todo lo invertido", "Más de la mitad", "Solo una parte pequeña", "No necesitaría tocarlo"],
    nota: "Con esto vemos qué tan urgente sería para ti disponer de este dinero."
  },
  colchonAlternativo: {
    id: "colchonAlternativo",
    texto: "Aparte de este dinero, ¿tienes otro ahorro para imprevistos?",
    opciones: ["No, este es mi único ahorro", "Tengo algo, pero no sería suficiente", "Sí, tengo otro ahorro razonable aparte", "Sí, tengo un buen fondo de emergencia aparte"],
    nota: "Tener otro colchón reduce el riesgo de tener que vender tus inversiones en mal momento."
  },
  caida: {
    id: "caida",
    texto: "Si tu inversión bajara un 20% en un mes, ¿qué harías?",
    opciones: ["Vendería todo enseguida", "Vendería una parte", "Mantendría la inversión sin tocarla", "Aprovecharía para invertir más"],
    nota: "Cómo reaccionarías de verdad nos dice más que cuánto riesgo crees que aguantas en teoría."
  },
  perdida: {
    id: "perdida",
    texto: "¿Cuánto podrías ver caer el valor de tu inversión sin cambiar de plan?",
    opciones: ["Hasta un 5%", "Entre un 5% y un 15%", "Entre un 15% y un 30%", "Más de un 30%"],
    nota: "Ponerle un número a tu límite ayuda a evitar que asumas más riesgo del que puedes sostener emocionalmente."
  },
  objetivoContexto: {
    id: "objetivoContexto",
    texto: "Pensando en tu objetivo, si tuvieras que elegir, ¿qué prefieres?",
    opciones: ["Evitar pérdidas, aunque crezca menos", "Un equilibrio entre seguridad y crecimiento", "Aceptar subidas y bajadas para llegar antes a mi meta", "El máximo crecimiento, aunque haya bajadas fuertes"],
    nota: "Buscamos el equilibrio que tú prefieres entre seguridad y crecimiento, para este objetivo en concreto."
  },
  objetivoLargoPlazo: {
    id: "objetivoLargoPlazo",
    texto: "Pensando a largo plazo, ¿qué estarías dispuesto a aceptar para que tu dinero crezca más?",
    opciones: ["Prefiero ver el valor casi sin cambios", "Aceptaría cambios moderados", "Aceptaría bajadas fuertes si sigo con el plan", "Incluso invertiría más dinero cuando baje"],
    nota: "En el largo plazo importa tanto aguantar las bajadas como poder seguir aportando durante ellas."
  },
  conocimientoProductos: {
    id: "conocimientoProductos",
    texto: "¿Qué formas de ahorrar o invertir conoces bien?",
    opciones: ["Prácticamente ninguna", "Depósitos y cuentas de ahorro", "Fondos de inversión y algún producto de bolsa", "Fondos, renta fija, bolsa y varios productos más"],
    nota: "Cuanto menos conozcas un producto, menos recomendable es que una parte grande de tu dinero dependa de él."
  },
  conocimientoRiesgo: {
    id: "conocimientoRiesgo",
    texto: "¿Qué significa para ti no poner todo el dinero en el mismo sitio al invertir?",
    opciones: ["No sabría explicarlo", "Repartir el dinero en varias inversiones", "Repartirlo entre distintos tipos de activos", "Combinar activos y zonas distintas para que no bajen todos a la vez"],
    nota: "Entender esto ayuda a no concentrar sin darte cuenta todo el riesgo en un mismo sitio."
  },
  conocimientoCostes: {
    id: "conocimientoCostes",
    texto: "¿Cuánta importancia le das a las comisiones al invertir?",
    opciones: ["No sé qué impacto tienen", "Sé que existen, pero no las suelo comparar", "Las comparo antes de invertir", "Las tengo muy en cuenta porque afectan a lo que ganas"],
    nota: "Las comisiones afectan directamente a lo que realmente ganas, aunque al principio no lo parezca."
  },
  comportamiento: {
    id: "comportamiento",
    texto: "Si algo en lo que invertiste baja de valor durante varios meses, ¿qué sueles hacer?",
    opciones: ["Lo vendo para no perder más", "Espero a entender qué pasa antes de decidir", "Mantengo el plan si no ha cambiado nada importante", "Aprovecho para invertir un poco más"],
    nota: "Cómo actuaste en el pasado ante algo así predice mejor tu comportamiento futuro que tus buenas intenciones."
  },
  patrimonio: {
    id: "patrimonio",
    texto: "Si sumas todo lo que tienes y le restas todo lo que debes, ¿qué situación te describe mejor?",
    opciones: ["Debo más de lo que tengo", "Tengo un poco más de lo que debo", "Tengo bastante más de lo que debo", "Tengo mucho más de lo que debo y casi ninguna deuda"],
    nota: "Tu situación patrimonial global es el colchón real que tienes si algo sale mal."
  }
};

/* ============================================================
   MOTOR ADAPTATIVO DEL CUESTIONARIO
   ------------------------------------------------------------
   Cada pregunta tiene un ID estable. El siguiente paso depende
   de las respuestas ya dadas y de los datos financieros existentes.
   ============================================================ */
function quizNumero(respuestas, id) {
  const n = Number((respuestas || {})[id]);
  const max = (QUIZ_DEF[id]?.opciones || []).length || 4;
  return n >= 1 && n <= max ? n : null;
}
function tipoObjetivoDesdeQuiz(valor) {
  return {
    1: "casa",
    2: "coche",
    3: "vacaciones",
    4: "estudios",
    5: "libertad",
    6: "poder_adquisitivo",
    7: "otro"
  }[Number(valor)] || null;
}
function esObjetivoMaterial(datos = {}, tipoQuiz = null) {
  const tipo = tipoObjetivoDesdeQuiz(tipoQuiz) || datos?.objetivo?.tipo;
  return ["casa", "coche", "vacaciones", "estudios"].includes(tipo);
}
function getNextQuestionId(currentQuestionId, respuestas = {}, datos = {}) {
  const r = respuestas || {};
  const h = quizNumero(r, "horizonte");
  const l = quizNumero(r, "liquidez");
  const p = quizNumero(r, "conocimientoProductos");
  const k = quizNumero(r, "conocimientoRiesgo");
  const objetivoRiesgo = quizNumero(r, "objetivo");
  const objetivoTipo = tipoObjetivoDesdeQuiz(r.objetivoTipo) || datos?.objetivo?.tipo;
  const necesitaLiquidez = h != null && h <= 2 || l != null && l <= 2;
  const material = esObjetivoMaterial(datos, r.objetivoTipo);
  switch (currentQuestionId) {
    case null:
    case undefined:
      return "edad";
    case "edad":
      return "disposicionInvertir";
    case "disposicionInvertir":
      return "conocimientoProductos";
    case "conocimientoProductos":
      return "objetivo";
    case "objetivo":
      return "objetivoTipo";
    case "objetivoTipo":
      return "horizonte";
    case "horizonte":
      return "estabilidad";
    case "estabilidad":
      return "concentracion";
    case "concentracion":
      return "liquidez";
    case "liquidez":
      return necesitaLiquidez ? "liquidezDetalle" : "caida";
    case "liquidezDetalle":
      return "colchonAlternativo";
    case "colchonAlternativo":
      return "caida";
    case "caida":
      if (["libertad", "poder_adquisitivo"].includes(objetivoTipo)) return "objetivoLargoPlazo";
      return material || objetivoRiesgo <= 2 || objetivoTipo === "otro" ? "objetivoContexto" : h != null && h >= 3 ? "perdida" : p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "objetivoContexto":
      return h != null && h >= 3 ? "perdida" : p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "objetivoLargoPlazo":
      return h != null && h >= 3 ? "perdida" : p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "perdida":
      return p != null && p <= 1 ? "patrimonio" : "conocimientoRiesgo";
    case "conocimientoRiesgo":
      return k != null && k >= 3 ? "conocimientoCostes" : "patrimonio";
    case "conocimientoCostes":
      return p != null && p >= 3 ? "comportamiento" : "patrimonio";
    case "comportamiento":
      return "patrimonio";
    case "patrimonio":
    default:
      return null;
  }
}
function construirRutaQuiz(respuestas = {}, datos = {}) {
  const r = normalizarRespuestasQuiz(respuestas);
  const ruta = [];
  let id = getNextQuestionId(null, r, datos);
  const vistos = new Set();
  while (id && !vistos.has(id) && ruta.length < 30) {
    vistos.add(id);
    ruta.push(id);
    if (quizNumero(r, id) == null) break;
    id = getNextQuestionId(id, r, datos);
  }
  return ruta;
}
function preguntasDisponiblesQuiz(respuestas = {}, datos = {}) {
  return construirRutaQuiz(respuestas, datos).map(id => QUIZ_DEF[id]).filter(Boolean);
}
function reconstruirEstadoQuiz(quizState, datos = {}) {
  const estado = quizState && typeof quizState === "object" ? quizState : {};
  const respuestas = normalizarRespuestasQuiz(estado.respuestas || {});
  const rutaGuardada = Array.isArray(estado.questionPath) ? estado.questionPath.filter(id => QUIZ_DEF[id]) : [];
  const rutaCalculada = construirRutaQuiz(respuestas, datos);
  const ruta = rutaGuardada.length ? rutaGuardada.filter((id, i) => rutaCalculada[i] === id) : rutaCalculada;
  const rutaFinal = ruta.length ? ruta : rutaCalculada;
  const ultimo = rutaFinal[rutaFinal.length - 1];
  const finalizado = !!estado.terminado || ultimo === "patrimonio" && quizNumero(respuestas, "patrimonio") != null;
  const candidato = estado.currentQuestionId && QUIZ_DEF[estado.currentQuestionId] ? estado.currentQuestionId : null;
  const actual = finalizado ? ultimo || "patrimonio" : candidato && rutaFinal.includes(candidato) ? candidato : rutaFinal.find(id => quizNumero(respuestas, id) == null) || ultimo || "edad";
  return {
    respuestas,
    currentQuestionId: actual,
    questionPath: rutaFinal,
    paso: Math.max(0, rutaFinal.indexOf(actual)),
    terminado: finalizado,
    resultado: estado.resultado || null
  };
}

/* Compatibilidad con estados antiguos basados en array + paso. */
function normalizarRespuestasQuiz(respuestas) {
  if (!Array.isArray(respuestas)) return respuestas || {};
  const legacyIds = ["edad", "horizonte", "objetivo", "estabilidad", "concentracion", "liquidez", "caida", "conocimientoProductos"];
  const out = {};
  respuestas.forEach((valor, i) => {
    if (valor != null && legacyIds[i]) out[legacyIds[i]] = Number(valor);
  });
  return out;
}
const PERFILES_INFO = {
  "Muy conservador": {
    color: C.exc,
    light: C.excLight,
    rentabilidad: 3,
    explicacion: "Priorizas la seguridad de tu dinero por encima de todo. Te conviene tenerlo sobre todo en productos estables y de bajo riesgo (depósitos, cuentas remuneradas, deuda pública), con poca exposición a la bolsa."
  },
  "Conservador": {
    color: C.salu,
    light: C.saluLight,
    rentabilidad: 4.5,
    explicacion: "Prefieres estabilidad con algo de crecimiento, asumiendo poco riesgo."
  },
  "Moderado": {
    color: C.mej,
    light: C.mejLight,
    rentabilidad: 6,
    explicacion: "Buscas equilibrio entre seguridad y rentabilidad a medio/largo plazo."
  },
  "Agresivo": {
    color: "#F59E0B",
    light: "rgba(245,158,11,0.10)",
    rentabilidad: 7.5,
    explicacion: "Priorizas el crecimiento a largo plazo y toleras caídas fuertes de valor."
  },
  "Muy agresivo": {
    color: C.crit,
    light: C.critLight,
    rentabilidad: 9,
    explicacion: "Tienes un plazo largo por delante y aceptas mucho riesgo: te conviene tener la mayor parte del dinero invertido en bolsa."
  }
};
const ASIGNACION = {
  "Muy conservador": {
    rentaFija: 70,
    rvGlobal: 15,
    rvEmergente: 0,
    liquidez: 15,
    otros: 0
  },
  "Conservador": {
    rentaFija: 55,
    rvGlobal: 25,
    rvEmergente: 5,
    liquidez: 15,
    otros: 0
  },
  "Moderado": {
    rentaFija: 35,
    rvGlobal: 40,
    rvEmergente: 10,
    liquidez: 10,
    otros: 5
  },
  "Agresivo": {
    rentaFija: 15,
    rvGlobal: 55,
    rvEmergente: 20,
    liquidez: 5,
    otros: 5
  },
  "Muy agresivo": {
    rentaFija: 5,
    rvGlobal: 60,
    rvEmergente: 25,
    liquidez: 5,
    otros: 5
  }
};
const ACTIVOS_DEF = [{
  key: "rentaFija",
  label: "Depósitos y bonos (bajo riesgo)",
  color: C.slate
}, {
  key: "rvGlobal",
  label: "Bolsa mundial",
  color: C.sand
}, {
  key: "rvEmergente",
  label: "Bolsa de países emergentes (más riesgo)",
  color: C.mej
}, {
  key: "liquidez",
  label: "Dinero disponible al momento",
  color: C.exc
}, {
  key: "otros",
  label: "Otros (oro y similares)",
  color: C.salu
}];
const DEUDAS_DEF = ["Préstamo estudios", "Préstamo coche", "Préstamo personal / consumo", "Préstamo vacaciones / ocio", "Tarjeta de crédito (revolving)", "Otras deudas"].map(nombre => ({
  nombre,
  pendiente: 0,
  cuota: 0,
  tasa: 0
}));
const CASOS_SIM = [{
  id: "padre50",
  nombre: "Padre a los 50",
  icon: I.sunset,
  descripcion: "Empieza a invertir para sus hijos.",
  inicial: 1000,
  mensual: 300,
  tasa: 6
}, {
  id: "recienNacido",
  nombre: "Hijo recién nacido",
  icon: I.baby,
  descripcion: "18 años ahorrando para estudios o casa.",
  inicial: 0,
  mensual: 100,
  tasa: 6
}, {
  id: "joven22",
  nombre: "Joven de 22 años",
  icon: I.gradCap,
  descripcion: "Empieza pronto, para una futura casa propia.",
  inicial: 500,
  mensual: 150,
  tasa: 6
}, {
  id: "treinta",
  nombre: "Empieza a los 30",
  icon: I.rocket,
  descripcion: "Aporta pensando en una jubilación mejor.",
  inicial: 2000,
  mensual: 250,
  tasa: 6
}];
const STORAGE_KEY = "salud-financiera:datos-v1";

/* ============================================================
   PERFIL DE RIESGO MULTIDIMENSIONAL
   ============================================================ */
const PERFILES_NIVELES = ["Muy conservador", "Conservador", "Moderado", "Agresivo", "Muy agresivo"];
function calcularPerfilMultidimensional(respuestas, datos = {}) {
  const r = normalizarRespuestasQuiz(respuestas);
  const valor = id => quizNumero(r, id);
  const media = items => {
    const validos = items.filter(v => v != null && !isNaN(v));
    return validos.length ? validos.reduce((a, b) => a + b, 0) / validos.length : null;
  };
  const a100 = v => v == null ? null : Math.round(v * 25);
  const qEdad = valor("edad");
  const qHorizonte = valor("horizonte");
  const qObjetivo = valor("objetivo");
  const qObjetivoTipo = valor("objetivoTipo");
  const qEstabilidad = valor("estabilidad");
  const qConcentracion = valor("concentracion");
  const qLiquidez = valor("liquidez");
  const qLiquidezDetalle = valor("liquidezDetalle");
  const qColchonAlternativo = valor("colchonAlternativo");
  const qCaida = valor("caida");
  const qPerdida = valor("perdida");
  const qObjetivoContexto = valor("objetivoContexto");
  const qObjetivoLargoPlazo = valor("objetivoLargoPlazo");
  const qProductos = valor("conocimientoProductos");
  const qRiesgo = valor("conocimientoRiesgo");
  const qCostes = valor("conocimientoCostes");
  const qComportamiento = valor("comportamiento");
  const qPatrimonio = valor("patrimonio");
  const ahorroActual = Number(datos.ahorroActual || 0);
  const capacidadFinanciera = calcularCapacidadFinanciera(datos);
  const ahorroDisponible = capacidadFinanciera.capacidadMensual;
  const gastoTotal = capacidadFinanciera.gastosTotales;
  const coberturaEmergencia = capacidadFinanciera.gastosTotales > 0 ? ahorroActual / capacidadFinanciera.gastosTotales : null;
  const ratioDeuda = capacidadFinanciera.ingresos > 0 ? capacidadFinanciera.cuotasDeuda / capacidadFinanciera.ingresos : null;
  const deudaPendiente = (datos.deudas || []).reduce((s, d) => s + Number(d.pendiente || 0), 0);
  const planObjetivos = calcularPlanObjetivos(datos);
  const objetivosPlan = planObjetivos.objetivos;
  const objetivoPrincipalPlan = planObjetivos.principal;
  const objetivoContextualTipo = objetivoPrincipalPlan?.tipo || tipoObjetivoDesdeQuiz(qObjetivoTipo) || null;
  const importeObjetivo = Number(objetivoPrincipalPlan?.importeObjetivo || 0);
  const plazoObjetivo = Number(objetivoPrincipalPlan?.plazoAnios || 0);
  const reservadoObjetivo = Number(objetivoPrincipalPlan?.importeReservado || 0);
  const coberturaObjetivo = importeObjetivo > 0 ? Math.max(0, Math.min(1, reservadoObjetivo / importeObjetivo)) : null;

  /*
   * Edad es contexto independiente. Un usuario joven no obtiene por ello
   * un horizonte largo: el horizonte se deriva exclusivamente de su respuesta.
   */
  const edad = a100(qEdad);
  const horizonte = a100(qHorizonte);
  const toleranciaRiesgo = a100(media([qCaida, qPerdida, qObjetivo, qObjetivoContexto, qObjetivoLargoPlazo]));

  /*
   * Capacidad: incorpora situación financiera real y las nuevas preguntas
   * condicionales de liquidez. Si no hay datos financieros, se usan solo las
   * respuestas disponibles y la confianza lo refleja.
   */
  const factorFlujo = Number(datos.ingresos || 0) > 0 ? ahorroDisponible > 0 ? Math.min(4, 1 + ahorroDisponible / Math.max(Number(datos.ingresos || 1) * 0.25, 1)) : 1 : null;
  const factorEmergencia = coberturaEmergencia == null ? null : coberturaEmergencia < 1 ? 1 : coberturaEmergencia < 3 ? 2 : coberturaEmergencia < 6 ? 3 : 4;
  const factorDeuda = ratioDeuda == null ? null : ratioDeuda > 0.40 ? 1 : ratioDeuda > 0.25 ? 2 : ratioDeuda > 0.10 ? 3 : 4;
  const factoresFinancierosDuros = [factorFlujo, factorEmergencia, factorDeuda].filter(v => v != null);
  const capacidadFactores = [qEstabilidad, qConcentracion, qPatrimonio, coberturaObjetivo == null ? null : coberturaObjetivo < 0.25 ? 1 : coberturaObjetivo < 0.50 ? 2 : coberturaObjetivo < 0.75 ? 3 : 4, qLiquidezDetalle, qColchonAlternativo];
  const capacidadEncuesta = media(capacidadFactores);
  const capacidadDura = factoresFinancierosDuros.length ? Math.min(...factoresFinancierosDuros) : null;
  const capacidadRiesgo = a100(capacidadDura == null ? capacidadEncuesta : Math.min(capacidadEncuesta == null ? capacidadDura : capacidadEncuesta, capacidadDura));

  /* Liquidez ya NO incorpora matemáticamente el horizonte. Son dimensiones distintas. */
  const liquidez = a100(qLiquidez);
  const experiencia = a100(media([qProductos, qRiesgo, qCostes, qComportamiento]));
  const dimensiones = {
    edad,
    toleranciaRiesgo,
    capacidadRiesgo,
    horizonte,
    liquidez,
    experiencia
  };
  const pesos = {
    toleranciaRiesgo: 0.30,
    capacidadRiesgo: 0.30,
    horizonte: 0.15,
    liquidez: 0.15,
    experiencia: 0.10
  };
  const dimensionesPonderadas = Object.fromEntries(Object.entries(pesos).map(([key, peso]) => [key, {
    valor: dimensiones[key],
    peso
  }]));
  const paresConocidos = Object.entries(pesos).filter(([key]) => dimensiones[key] != null);
  const pesoConocido = paresConocidos.reduce((s, [, peso]) => s + peso, 0);
  const baseScore = pesoConocido > 0 ? Math.round(paresConocidos.reduce((s, [key, peso]) => s + dimensiones[key] * peso, 0) / pesoConocido) : 0;
  const nivelPorScore = score => score < 30 ? 0 : score < 45 ? 1 : score < 60 ? 2 : score < 80 ? 3 : 4;
  let nivelFinal = nivelPorScore(baseScore);

  /*
   * La puntuación agregada orienta, pero nunca puede compensar una debilidad
   * crítica. Cada dimensión limitante aplica un techo independiente.
   */
  const limites = [{
    key: "capacidadRiesgo",
    valor: capacidadRiesgo,
    reglas: [[25, 0], [40, 1], [60, 2]]
  }, {
    key: "horizonte",
    valor: horizonte,
    reglas: [[25, 0], [50, 1], [70, 2]]
  }, {
    key: "liquidez",
    valor: liquidez,
    reglas: [[25, 0], [50, 1], [70, 2]]
  }, {
    key: "experiencia",
    valor: experiencia,
    reglas: [[25, 1], [50, 2], [70, 3]]
  }];
  const limitesAplicados = [];
  limites.forEach(({
    key,
    valor,
    reglas
  }) => {
    if (valor == null) return;
    for (const [umbral, maxNivel] of reglas) {
      if (valor <= umbral) {
        nivelFinal = Math.min(nivelFinal, maxNivel);
        limitesAplicados.push({
          dimension: key,
          maxNivel,
          umbral,
          valor
        });
        break;
      }
    }
  });
  const faltantes = [];
  if (edad == null) faltantes.push("edad");
  if (toleranciaRiesgo == null) faltantes.push("tolerancia al riesgo");
  if (capacidadRiesgo == null) faltantes.push("capacidad para soportar pérdidas");
  if (horizonte == null) faltantes.push("horizonte temporal");
  if (liquidez == null) faltantes.push("necesidad de liquidez");
  if (experiencia == null) faltantes.push("conocimientos de inversión");
  let confianza = "Alta";
  if (faltantes.length >= 2 || [capacidadRiesgo, horizonte, liquidez].some(v => v == null)) confianza = "Baja";else if (faltantes.length === 1) confianza = "Media";
  const factoresPositivos = [];
  const factoresNegativos = [];
  const nombres = [["toleranciaRiesgo", "Cómo llevas los altibajos (tolerancia al riesgo)"], ["capacidadRiesgo", "Capacidad para soportar pérdidas"], ["horizonte", "Tiempo por delante (horizonte)"], ["liquidez", "Cuándo podrías necesitar el dinero (liquidez)"], ["experiencia", "Conocimientos de inversión"]];
  nombres.forEach(([key, label]) => {
    const v = dimensiones[key];
    if (v == null) return;
    if (v >= 70) factoresPositivos.push(label + " alta");else if (v < 50) factoresNegativos.push(label + " limitada");
  });
  if (coberturaEmergencia != null && coberturaEmergencia < 3) factoresNegativos.push("El fondo de emergencia todavía es reducido");
  if (ratioDeuda != null && ratioDeuda > 0.25) factoresNegativos.push("La carga de deuda reduce la capacidad de asumir pérdidas");
  if (ahorroDisponible <= 0) factoresNegativos.push("No existe ahorro mensual disponible para absorber pérdidas");
  if (qLiquidezDetalle != null && qLiquidezDetalle <= 1) factoresNegativos.push("Podrías necesitar gran parte de la inversión a corto plazo");
  if (qColchonAlternativo != null && qColchonAlternativo <= 1) factoresNegativos.push("No existe un colchón alternativo suficiente");
  if (deudaPendiente <= 0 && qPatrimonio >= 3) factoresPositivos.push("Patrimonio neto y deuda favorables");
  if (importeObjetivo > 0 && plazoObjetivo > 0 && coberturaObjetivo != null && coberturaObjetivo < 0.50 && plazoObjetivo <= 5) factoresNegativos.push("El objetivo necesita todavía una parte importante de financiación");
  limitesAplicados.forEach(l => {
    const etiqueta = {
      capacidadRiesgo: "tu capacidad financiera para soportar pérdidas",
      horizonte: "tu horizonte temporal",
      liquidez: "tu necesidad de liquidez",
      experiencia: "tus conocimientos de inversión"
    }[l.dimension] || l.dimension;
    factoresNegativos.push("Tu perfil se ha limitado por " + etiqueta + ", aunque tu tolerancia al riesgo sea más alta");
  });
  if (!factoresPositivos.length) factoresPositivos.push("No hay una dimensión claramente alta que impulse el perfil");
  if (!factoresNegativos.length) factoresNegativos.push("No se detectan limitaciones relevantes entre las dimensiones evaluadas");

  /* Las razones de un techo de seguridad aplicado (limitesAplicados) son la
     explicación más importante de por qué el perfil final es más bajo de lo
     que sugerirían tus respuestas de tolerancia — nunca deben quedar fuera
     por el recorte a 3 elementos. Las priorizamos primero en la lista. */
  const factoresNegativosUnicos = [...new Set(factoresNegativos)];
  const razonesTecho = factoresNegativosUnicos.filter(f => f.startsWith("Tu perfil se ha limitado por"));
  const otrasRazones = factoresNegativosUnicos.filter(f => !f.startsWith("Tu perfil se ha limitado por"));
  const factoresNegativosFinal = [...razonesTecho, ...otrasRazones].slice(0, 3);
  const factoresTenidosEnCuenta = ["Objetivo principal y su prioridad", "Objetivo y preferencia de crecimiento", "Horizonte temporal de la inversión", "Necesidad de liquidez", "Capacidad financiera para soportar pérdidas", "Tolerancia ante caídas de mercado", "Conocimientos y experiencia de inversión", "Edad como contexto, sin sustituir al horizonte"];
  return {
    ...dimensiones,
    puntuacionBase: baseScore,
    dimensionesPonderadas,
    limitesAplicados,
    perfil: PERFILES_NIVELES[nivelFinal],
    confianza,
    faltantes,
    factoresPositivos: [...new Set(factoresPositivos)].slice(0, 3),
    factoresNegativos: factoresNegativosFinal,
    factoresTenidosEnCuenta,
    factoresCapacidad: {
      ahorroDisponible,
      coberturaEmergencia,
      ratioDeuda,
      deudaPendiente,
      importeObjetivo,
      plazoObjetivo,
      coberturaObjetivo
    }
  };
}

/* ============================================================
   HELPERS
   ============================================================ */
function euros(n, dec = 0) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
}
function pct(n, dec = 1) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  }) + "%";
}
function totalMensual(obj) {
  return Object.values(obj).reduce((acc, item) => {
    const f = FRECUENCIAS.find(x => x.value === item.frecuencia) || FRECUENCIAS[0];
    return acc + Number(item.valor || 0) / f.divisor;
  }, 0);
}
function emptyCampo(defs) {
  return Object.fromEntries(defs.map(d => [d.key, {
    valor: 0,
    frecuencia: "mensual"
  }]));
}
/* UX: copy de coaching; umbrales y cálculo permanecen intactos. */
function estadoAhorro(ratio) {
  if (ratio < 0) return {
    nombre: "Construyendo tu base",
    color: C.mej,
    light: C.mejLight,
    Ico: I.alert
  };
  if (ratio < 0.1) return {
    nombre: "Margen de mejora",
    color: C.mej,
    light: C.mejLight,
    Ico: I.alert
  };
  if (ratio < 0.2) return {
    nombre: "Base saludable",
    color: C.salu,
    light: C.saluLight,
    Ico: I.check
  };
  return {
    nombre: "Muy buena base",
    color: C.exc,
    light: C.excLight,
    Ico: I.check
  };
}
/* ============================================================
   PUNTUACIÓN DE SALUD FINANCIERA (0-100) — combina cuatro señales,
   no solo el ratio de ahorro, para dar una foto más completa.
   ============================================================ */
function calcularSaludFinanciera({
  ratioAhorro,
  coberturaMeses,
  cargaDeuda,
  perfil
}) {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const ptsAhorro = clamp(ratioAhorro, 0, 0.25) / 0.25 * 40;
  const ptsFondo = clamp(coberturaMeses, 0, 6) / 6 * 30;
  const ptsDeuda = (1 - clamp(cargaDeuda, 0, 0.3) / 0.3) * 20;
  const ptsPerfil = perfil ? 10 : 0;
  const score = Math.round(ptsAhorro + ptsFondo + ptsDeuda + ptsPerfil);
  /* UX: copy más humano; score, ponderaciones y umbrales permanecen intactos. */
  let nivel;
  if (score < 35) nivel = {
    nombre: "Construyendo tu base",
    color: C.mej,
    light: C.mejLight
  };else if (score < 60) nivel = {
    nombre: "Margen de mejora",
    color: C.mej,
    light: C.mejLight
  };else if (score < 80) nivel = {
    nombre: "Base saludable",
    color: C.salu,
    light: C.saluLight
  };else nivel = {
    nombre: "Muy buena salud",
    color: C.exc,
    light: C.excLight
  };
  return {
    score,
    ...nivel,
    desglose: {
      ptsAhorro,
      ptsFondo,
      ptsDeuda,
      ptsPerfil
    }
  };
}
function proyeccionInteres(inicial, mensual, tasaAnual, anios) {
  const r = tasaAnual / 100 / 12;
  const meses = anios * 12;
  let valorFuturo;
  if (r === 0) valorFuturo = inicial + mensual * meses;else {
    const pow = Math.pow(1 + r, meses);
    valorFuturo = inicial * pow + mensual * ((pow - 1) / r);
  }
  const totalAportado = inicial + mensual * meses;
  return {
    anios,
    totalAportado,
    valorFuturo,
    interesGenerado: valorFuturo - totalAportado
  };
}

/* ============================================================
   AMORTIZACIÓN DE DEUDA — bola de nieve vs. avalancha
   ============================================================ */
function simularAmortizacion(deudas, extraMensual, estrategia) {
  const MAX_MESES = 480;
  const activos = deudas.filter(d => Number(d.pendiente) > 0).map(d => ({
    nombre: d.nombre || "Deuda sin nombre",
    saldo: Number(d.pendiente),
    tasaMensual: Number(d.tasa) / 100 / 12,
    cuotaMin: Number(d.cuota) || 0,
    liquidada: false,
    mesLiquidacion: null,
    interesPagado: 0
  }));
  const orden = estrategia === "avalancha" ? [...activos].sort((a, b) => b.tasaMensual - a.tasaMensual) : [...activos].sort((a, b) => a.saldo - b.saldo);
  let extraLiberado = 0;
  let totalInteres = 0;
  let mes = 0;
  while (orden.some(d => !d.liquidada) && mes < MAX_MESES) {
    mes++;
    for (const d of orden) {
      if (d.liquidada) continue;
      const interes = d.saldo * d.tasaMensual;
      d.interesPagado += interes;
      totalInteres += interes;
      d.saldo += interes;
      const pagoMin = Math.min(d.cuotaMin, d.saldo);
      d.saldo -= pagoMin;
      if (d.saldo <= 0.01) {
        d.saldo = 0;
        d.liquidada = true;
        d.mesLiquidacion = mes;
        extraLiberado += d.cuotaMin;
      }
    }
    let presupuestoExtra = (Number(extraMensual) || 0) + extraLiberado;
    for (const d of orden) {
      if (d.liquidada) continue;
      if (presupuestoExtra <= 0) break;
      const pago = Math.min(presupuestoExtra, d.saldo);
      d.saldo -= pago;
      presupuestoExtra -= pago;
      if (d.saldo <= 0.01) {
        d.saldo = 0;
        d.liquidada = true;
        d.mesLiquidacion = mes;
        extraLiberado += d.cuotaMin;
      }
      break;
    }
  }
  return {
    orden,
    totalInteres,
    mesesTotal: mes,
    todasLiquidadas: orden.every(d => d.liquidada)
  };
}
function formatMeses(m) {
  const anios = Math.floor(m / 12),
    meses = m % 12;
  if (anios === 0) return meses + (meses === 1 ? " mes" : " meses");
  if (meses === 0) return anios + (anios === 1 ? " año" : " años");
  return anios + "a " + meses + "m";
}

/* ============================================================
   EXPORTAR RESUMEN — JSON (descarga directa) y PDF (impresión nativa)
   ============================================================ */
function exportarJSON({
  datos,
  perfil,
  perfilDetalle,
  sim,
  historial,
  gastoTotal,
  ahorroDisponible
}) {
  const payload = {
    generado: new Date().toISOString(),
    ingresosMensuales: datos.ingresos,
    gastosFijos: datos.gastosFijos,
    gastosDiscrecionales: datos.gastosDiscrecionales,
    deudas: datos.deudas,
    ahorroActual: datos.ahorroActual,
    objetivo: datos.objetivo,
    objetivos: normalizarObjetivos(datos),
    gastoTotalMensual: gastoTotal,
    ahorroDisponibleMensual: ahorroDisponible,
    perfilRiesgo: perfil,
    perfilRiesgoDetalle: perfilDetalle,
    simulador: sim,
    historialRatioAhorro: historial
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "moneypilot-resumen-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function exportarPDF() {
  window.print();
}

/* ============================================================
   PERSISTENCIA LOCAL — localStorage del navegador
   ============================================================ */
function useDatosPersistidos() {
  const [ready, setReady] = useState(false);
  const [savedState, setSavedState] = useState(null);
  useEffect(() => {
    let cancelled = false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!cancelled && raw) {
        setSavedState(JSON.parse(raw));
      }
    } catch (e) {/* sin datos guardados aún o almacenamiento no disponible */} finally {
      if (!cancelled) setReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);
  const save = useCallback(async state => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {/* fallo silencioso */}
  }, []);
  const clear = useCallback(async () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {/* ignorar */}
  }, []);
  return {
    ready,
    savedState,
    save,
    clear
  };
}

/* ============================================================
   TOAST — feedback discreto de guardado (local y nube)
   ============================================================ */
function useToast() {
  const [toast, setToast] = useState(null);
  const hideTimer = useRef(null);
  const show = useCallback((msg, tone = "ok") => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({
      msg,
      tone,
      key: Date.now()
    });
    hideTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);
  return {
    toast,
    show
  };
}
function Toast({
  toast
}) {
  if (!toast) return null;
  const tone = toast.tone === "error" ? {
    bg: C.crit,
    ico: I.x
  } : {
    bg: C.navy,
    ico: I.check
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-5 left-1/2 -translate-x-1/2 z-50 toast-enter",
    key: toast.key
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-xs font-bold",
    style: {
      backgroundColor: tone.bg,
      color: C.white
    }
  }, /*#__PURE__*/React.createElement(tone.ico, {
    size: 14,
    color: C.white
  }), " ", toast.msg));
}
function useDebouncedEffect(fn, deps, delay = 700) {
  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, delay);
    return () => timer.current && clearTimeout(timer.current);
    // eslint-disable-next-line
  }, deps);
}

/* ============================================================
   AUTENTICACIÓN (Supabase Auth — email/password)
   ============================================================ */
function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    supa.auth.getSession().then(({
      data
    }) => {
      setUser(data?.session?.user ?? null);
      setAuthReady(true);
    });
    const {
      data: listener
    } = supa.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);
  const signUp = useCallback(async (email, password) => {
    const {
      data,
      error
    } = await supa.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return {
      data,
      error
    };
  }, []);
  const signIn = useCallback(async (email, password) => {
    const {
      data,
      error
    } = await supa.auth.signInWithPassword({
      email,
      password
    });
    return {
      data,
      error
    };
  }, []);
  const signOut = useCallback(async () => {
    await supa.auth.signOut();
  }, []);
  return {
    user,
    authReady,
    signUp,
    signIn,
    signOut
  };
}

/* ============================================================
   SINCRONIZACIÓN CON LA NUBE (Supabase)
   ============================================================ */
function useCloudSync({
  user,
  datos,
  setDatos,
  perfil,
  setPerfil,
  perfilDetalle,
  setPerfilDetalle,
  sim,
  setSim,
  setObjetivoSeleccionadoId,
  quizState,
  setQuizState,
  historial,
  setHistorial,
  onSaved
}) {
  const [cloudReady, setCloudReady] = useState(false);
  const migratedRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      migratedRef.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      const [{
        data: perfilRow
      }, {
        data: historialRows
      }, {
        data: quizRow
      }] = await Promise.all([supa.from("finanzas_perfil").select("*").eq("user_id", user.id).maybeSingle(), supa.from("finanzas_historial").select("*").eq("user_id", user.id).order("created_at", {
        ascending: true
      }), supa.from("finanzas_quiz").select("*").eq("user_id", user.id).maybeSingle()]);
      if (cancelled) return;
      const hayDatosEnNube = perfilRow && Number(perfilRow.ingresos) > 0;
      if (hayDatosEnNube) {
        skipNextSaveRef.current = true;
        const datosBaseNube = {
          ingresos: Number(perfilRow.ingresos) || 0,
          gastosFijos: perfilRow.gastos_fijos || emptyCampo(GASTOS_FIJOS_DEF),
          gastosDiscrecionales: perfilRow.gastos_disc || emptyCampo(GASTOS_DISC_DEF),
          deudas: perfilRow.deudas?.length ? perfilRow.deudas : DEUDAS_DEF.map(d => ({
            ...d
          })),
          ahorroActual: Number(perfilRow.ahorro_actual) || 0,
          habito: perfilRow.habito || null,
          objetivo: perfilRow.objetivo || {
            tipo: null,
            importe: 0,
            plazoAnios: 0
          },
          objetivos: Array.isArray(perfilRow.objetivos) ? perfilRow.objetivos : perfilRow.objetivo?.objetivos || []
        };
        /* Normalizamos aquí, una sola vez, para fijar ids estables antes de
           guardar en el estado. Si no lo hiciéramos, un usuario migrado desde
           solo `objetivo` (sin `objetivos`) recibiría un id aleatorio nuevo
           cada vez que cualquier pantalla llamara a normalizarObjetivos(datos),
           rompiendo la selección del objetivo en el Simulador y el guardado
           de ediciones (ver 7.4/7.9). */
        const objetivosNubeNormalizados = normalizarObjetivos(datosBaseNube);
        const datosNube = {
          ...datosBaseNube,
          objetivos: objetivosNubeNormalizados,
          objetivo: objetivoLegadoDesdeColeccion(objetivosNubeNormalizados)
        };
        setDatos(datosNube);
        const perfilNube = perfilRow.perfil_riesgo || null;
        setPerfil(perfilNube);
        const simNube = perfilRow.sim_config?.tasa ? perfilRow.sim_config : {
          inicial: 0,
          mensual: 0,
          tasa: 6
        };
        setSim(simNube);
        setObjetivoSeleccionadoId && setObjetivoSeleccionadoId(simNube.objetivoId || null);
        if (quizRow) {
          const respuestasNube = normalizarRespuestasQuiz(quizRow.respuestas || {});
          const estadoNube = reconstruirEstadoQuiz({
            respuestas: respuestasNube,
            paso: quizRow.paso || 0,
            currentQuestionId: quizRow.current_question_id,
            questionPath: quizRow.question_path,
            terminado: !!quizRow.terminado,
            resultado: quizRow.resultado || null
          }, datosNube);
          // Si existen respuestas terminadas, recalculamos con el modelo actual para no arrastrar el antiguo score.
          const resultadoNube = estadoNube.terminado ? calcularPerfilMultidimensional(estadoNube.respuestas, datosNube) : quizRow.resultado || null;
          setQuizState({
            ...estadoNube,
            resultado: resultadoNube
          });
          setPerfil(resultadoNube?.perfil || perfilNube);
          setPerfilDetalle(resultadoNube);
        }
        setHistorial((historialRows || []).map(r => ({
          ratio: Number(r.ratio_ahorro),
          ts: new Date(r.created_at).getTime()
        })));
        migratedRef.current = true;
      } else if (!migratedRef.current && datos.ingresos > 0) {
        await migrarANube(user.id, {
          datos,
          perfil,
          sim,
          quizState,
          historial
        });
        migratedRef.current = true;
      } else {
        migratedRef.current = true;
      }
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [user]);
  useDebouncedEffect(() => {
    if (!user || !cloudReady) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (datos.ingresos <= 0) return;
    Promise.all([guardarPerfilEnNube(user.id, {
      datos,
      perfil,
      sim
    }), guardarQuizEnNube(user.id, quizState)]).then(([perfilResult, quizResult]) => {
      const huboError = perfilResult?.ok === false || quizResult?.ok === false;
      if (huboError) onSaved && onSaved("No se pudo sincronizar con la nube. Tus datos siguen a salvo en este dispositivo.", "error");else onSaved && onSaved("Guardado en la nube");
    });
    // eslint-disable-next-line
  }, [user, cloudReady, datos, perfil, sim, quizState]);
  const registrarSnapshotNube = useCallback(async ratio => {
    if (!user) return;
    await supa.from("finanzas_historial").insert({
      user_id: user.id,
      ratio_ahorro: ratio
    });
  }, [user]);
  return {
    cloudReady,
    registrarSnapshotNube
  };
}
async function guardarPerfilEnNube(userId, {
  datos,
  perfil,
  sim
}) {
  try {
    const objetivos = normalizarObjetivos(datos);
    const payload = {
      user_id: userId,
      ingresos: datos.ingresos,
      gastos_fijos: datos.gastosFijos,
      gastos_disc: datos.gastosDiscrecionales,
      deudas: datos.deudas,
      ahorro_actual: datos.ahorroActual,
      habito: datos.habito,
      objetivo: objetivoLegadoDesdeColeccion(objetivos),
      objetivos,
      perfil_riesgo: perfil,
      sim_config: sim,
      updated_at: new Date().toISOString()
    };
    const {
      error
    } = await supa.from("finanzas_perfil").upsert(payload);
    if (error) {
      /* Compatibilidad: instalaciones antiguas sin columna `objetivos`. La colección
         queda embebida en `objetivo` si ese campo es JSON; si tampoco lo admite,
         se conserva el objetivo principal sin bloquear la aplicación. */
      const {
        error: fallbackError
      } = await supa.from("finanzas_perfil").upsert({
        ...payload,
        objetivos: undefined
      });
      if (fallbackError) return {
        ok: false,
        error: fallbackError
      };
    }
    return {
      ok: true
    };
  } catch (e) {
    return {
      ok: false,
      error: e
    }; /* localStorage sigue como respaldo local */
  }
}
async function guardarQuizEnNube(userId, quizState) {
  const filaBase = {
    user_id: userId,
    respuestas: quizState.respuestas,
    paso: quizState.paso,
    terminado: quizState.terminado,
    updated_at: new Date().toISOString()
  };
  const filaAdaptativa = {
    ...filaBase,
    current_question_id: quizState.currentQuestionId || null,
    question_path: Array.isArray(quizState.questionPath) ? quizState.questionPath : []
  };
  try {
    const {
      error
    } = await supa.from("finanzas_quiz").upsert({
      ...filaAdaptativa,
      resultado: quizState.resultado || null
    });
    if (error) {
      /* Compatibilidad con esquemas antiguos: conserva las columnas históricas. */
      const {
        error: legacyError
      } = await supa.from("finanzas_quiz").upsert({
        ...filaBase,
        resultado: quizState.resultado || null
      });
      if (legacyError) {
        const {
          error: finalError
        } = await supa.from("finanzas_quiz").upsert(filaBase);
        if (finalError) return {
          ok: false,
          error: finalError
        };
      }
    }
    return {
      ok: true
    };
  } catch (e) {
    try {
      const {
        error: legacyError
      } = await supa.from("finanzas_quiz").upsert({
        ...filaBase,
        resultado: quizState.resultado || null
      });
      if (legacyError) {
        const {
          error: finalError
        } = await supa.from("finanzas_quiz").upsert(filaBase);
        if (finalError) return {
          ok: false,
          error: finalError
        };
      }
      return {
        ok: true
      };
    } catch (_e) {
      return {
        ok: false,
        error: _e
      }; /* localStorage sigue como respaldo */
    }
  }
}
async function migrarANube(userId, {
  datos,
  perfil,
  sim,
  quizState,
  historial
}) {
  await guardarPerfilEnNube(userId, {
    datos,
    perfil,
    sim
  });
  await guardarQuizEnNube(userId, quizState);
  if (historial && historial.length) {
    const filas = historial.map(h => ({
      user_id: userId,
      ratio_ahorro: h.ratio,
      created_at: new Date(h.ts || Date.now()).toISOString()
    }));
    try {
      await supa.from("finanzas_historial").insert(filas);
    } catch (e) {/* fallo silencioso */}
  }
}

/* ============================================================
   UI COMPARTIDA
   ============================================================ */
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-1",
    style: {
      color: C.mej,
      letterSpacing: "0.12em"
    }
  }, children);
}
function Card({
  children,
  className = "",
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl border " + className,
    style: {
      backgroundColor: C.surface,
      backgroundImage: "radial-gradient(120% 140% at 0% 0%, rgba(79,70,229,0.20) 0%, rgba(79,70,229,0.05) 32%, rgba(0,0,0,0) 60%), radial-gradient(100% 120% at 100% 100%, rgba(62,111,168,0.16) 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.12) 100%)",
      borderColor: C.border,
      boxShadow: "0 0 0 1px rgba(79,70,229,0.22), 0 0 46px -4px rgba(79,70,229,0.5), 0 0 90px -20px rgba(62,111,168,0.35), 0 16px 34px -14px rgba(0,0,0,0.65)",
      ...style
    },
    ...rest
  }, children);
}
function Badge({
  estado
}) {
  const {
    nombre,
    color,
    light,
    Ico: IcoComp
  } = estado;
  return /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
    style: {
      backgroundColor: light,
      color
    }
  }, /*#__PURE__*/React.createElement(IcoComp, {
    size: 13,
    strokeWidth: 2.5
  }), nombre);
}
function StatCard({
  icon: IconComp,
  label,
  value,
  sub,
  accent,
  delay = 0
}) {
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex flex-col gap-3 stagger-item",
    style: {
      animationDelay: delay + "ms"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, label), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: accent ? accent + "1A" : C.sandLight
    }
  }, /*#__PURE__*/React.createElement(IconComp, {
    size: 17,
    color: accent || C.sand,
    strokeWidth: 2.2
  }))), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-3xl font-bold",
    style: {
      color: C.ink
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, sub));
}
function NumberField({
  label,
  value,
  onChange,
  hint,
  suffix = "€"
}) {
  const id = useId();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    className: "block text-sm font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "number",
    inputMode: "decimal",
    value: value === 0 ? "" : value,
    onChange: e => {
      const v = e.target.value;
      onChange(v === "" ? 0 : Math.max(0, Number(v)));
    },
    placeholder: "0",
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), suffix && /*#__PURE__*/React.createElement("span", {
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold",
    style: {
      color: C.muted
    }
  }, suffix)), hint && /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, hint));
}
function focusNextInSequence(e) {
  const container = e.currentTarget.closest("[data-seq-group]");
  if (!container) return;
  const fields = Array.from(container.querySelectorAll("[data-seq-field]"));
  const idx = fields.indexOf(e.currentTarget);
  if (idx > -1 && idx < fields.length - 1) {
    const next = fields[idx + 1];
    next.focus();
    if (next.select) next.select();
  } else if (idx > -1) {
    e.currentTarget.blur();
  }
}
function FreqField({
  label,
  data,
  onChange,
  hint
}) {
  const id = useId();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    className: "block text-sm font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: "number",
    inputMode: "decimal",
    enterKeyHint: "next",
    "data-seq-field": true,
    value: data.valor === 0 ? "" : data.valor,
    onChange: e => {
      const v = e.target.value;
      onChange({
        ...data,
        valor: v === "" ? 0 : Math.max(0, Number(v))
      });
    },
    onKeyDown: e => {
      if (e.key === "Enter") {
        e.preventDefault();
        focusNextInSequence(e);
      }
    },
    placeholder: "0",
    className: "w-full rounded-lg pl-3 pr-7 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold",
    style: {
      color: C.muted
    }
  }, "€")), /*#__PURE__*/React.createElement("select", {
    value: data.frecuencia,
    onChange: e => onChange({
      ...data,
      frecuencia: e.target.value
    }),
    className: "rounded-lg px-1.5 text-xs font-bold border outline-none shrink-0",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, FRECUENCIAS.map(f => /*#__PURE__*/React.createElement("option", {
    key: f.value,
    value: f.value
  }, f.label)))), hint && /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, hint));
}
function FadeSwitch({
  id,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    key: id,
    className: "fade-switch-enter"
  }, children);
}
function AnimatedNumber({
  value,
  format = v => euros(v)
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);
  useEffect(() => {
    const from = fromRef.current,
      to = value;
    if (from === to) return;
    const start = performance.now();
    const duration = 450;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [value]);
  return format(display);
}
function ProgressBar({
  pctValue,
  color,
  bg = C.border,
  height = 8
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full rounded-full overflow-hidden",
    style: {
      backgroundColor: bg,
      height
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: Math.min(Math.max(pctValue, 0), 100) + "%",
      backgroundColor: color,
      transition: "width 600ms cubic-bezier(0.16,1,0.3,1)"
    }
  }));
}
function EmergencyGauge({
  meses,
  objetivoMeses = 6,
  color
}) {
  const clamped = Math.min(meses, objetivoMeses * 1.5);
  const fraction = Math.min(clamped / (objetivoMeses * 1.5), 1);
  const [animFrac, setAnimFrac] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimFrac(fraction), 80);
    return () => clearTimeout(t);
  }, [fraction]);
  const size = 180,
    stroke = 16,
    r = (size - stroke) / 2,
    circumference = Math.PI * r;
  const offset = circumference * (1 - animFrac);
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size / 2 + stroke / 2,
    viewBox: "0 0 " + size + " " + (size / 2 + stroke / 2)
  }, /*#__PURE__*/React.createElement("path", {
    d: "M " + stroke / 2 + " " + size / 2 + " A " + r + " " + r + " 0 0 1 " + (size - stroke / 2) + " " + size / 2,
    fill: "none",
    stroke: C.border,
    strokeWidth: stroke,
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M " + stroke / 2 + " " + size / 2 + " A " + r + " " + r + " 0 0 1 " + (size - stroke / 2) + " " + size / 2,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: circumference,
    strokeDashoffset: offset,
    style: {
      transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1), stroke 400ms"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-center -mt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-3xl font-bold",
    style: {
      color
    }
  }, meses.toFixed(1)), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "de ", objetivoMeses, " meses objetivo")));
}

/* Termómetro de salud financiera — puntuación compuesta (0-100) */
function Termometro({
  score,
  color
}) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 100);
    return () => clearTimeout(t);
  }, [score]);
  const w = 56,
    tubeTop = 6,
    tubeBottom = 132,
    tubeW = 18,
    bulbR = 22,
    bulbCy = tubeBottom + bulbR - 6,
    h = bulbCy + bulbR + 4;
  const fillHeight = (tubeBottom - tubeTop) * (Math.max(animScore, 4) / 100);
  const fillY = tubeBottom - fillHeight;
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    viewBox: "0 0 " + w + " " + h,
    className: "shrink-0"
  }, /*#__PURE__*/React.createElement("rect", {
    x: w / 2 - tubeW / 2,
    y: tubeTop,
    width: tubeW,
    height: tubeBottom - tubeTop,
    rx: tubeW / 2,
    fill: C.border,
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: w / 2,
    cy: bulbCy,
    r: bulbR,
    fill: C.border,
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: w / 2 - tubeW / 2,
    y: fillY,
    width: tubeW,
    height: tubeBottom - fillY,
    rx: tubeW / 2,
    fill: color,
    style: {
      transition: "y 800ms cubic-bezier(0.16,1,0.3,1), height 800ms cubic-bezier(0.16,1,0.3,1)"
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: w / 2,
    cy: bulbCy,
    r: bulbR - 4,
    fill: color
  }), [25, 50, 75].map(p => {
    const y = tubeBottom - (tubeBottom - tubeTop) * (p / 100);
    return /*#__PURE__*/React.createElement("line", {
      key: p,
      x1: w / 2 + tubeW / 2 + 2,
      x2: w / 2 + tubeW / 2 + 7,
      y1: y,
      y2: y,
      stroke: C.border,
      strokeWidth: "2"
    });
  }));
}
/* Barra de desglose de la puntuación de salud financiera */
function DesgloseBarra({
  label,
  pts,
  max,
  color
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.ink
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, Math.round(pts), "/", max)), /*#__PURE__*/React.createElement(ProgressBar, {
    pctValue: pts / max * 100,
    color: color,
    height: 5
  }));
}

/* Gráfico de área simple, sin librerías externas */
function niceTicks(maxV, targetCount = 6) {
  if (!(maxV > 0)) return {
    ticks: [0],
    niceMax: 1
  };
  const rawStep = maxV / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const niceNorm = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  const step = niceNorm * mag;
  const niceMax = Math.ceil(maxV / step) * step;
  const ticks = [];
  for (let v = 0; v <= niceMax + step * 0.001; v += step) ticks.push(v);
  return {
    ticks,
    niceMax,
    step
  };
}
function SimpleAreaChart({
  data,
  xKey,
  series,
  height = 240,
  formatY = v => v
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const width = 680,
    padL = 46,
    padR = 10,
    padT = 10,
    padB = 36;
  const innerW = width - padL - padR,
    innerH = height - padT - padB;
  const allValues = data.flatMap(d => series.map(s => d[s.key] || 0));
  const maxRaw = Math.max(1, ...allValues);
  const {
    ticks,
    niceMax
  } = niceTicks(maxRaw, 6);
  const xFor = i => padL + innerW * (data.length <= 1 ? 0 : i / (data.length - 1));
  const yFor = v => padT + innerH - innerH * (v / niceMax);
  const handleMove = e => {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // 1. Píxeles físicos del ratón dentro del contenedor
    const screenX = e.clientX - rect.left;
    // 2. Escalar esos píxeles físicos al sistema de coordenadas interno del SVG (width: 680)
    const svgX = screenX / rect.width * width;
    // 3. Ahora ya podemos restar el padding interno del SVG
    const innerX = svgX - padL;
    const fraction = innerX / innerW;
    const raw = fraction * (data.length - 1);
    setHoverIndex(Math.max(0, Math.min(data.length - 1, Math.round(raw))));
  };
  const hovered = hoverIndex == null ? null : data[hoverIndex];
  const tooltipX = hoverIndex == null ? 0 : xFor(hoverIndex);
  const tooltipW = 172;
  const tooltipLeft = Math.max(6, Math.min(width - tooltipW - 6, tooltipX - tooltipW / 2));
  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full h-full chart-interactive",
    onMouseMove: handleMove,
    onMouseLeave: () => setHoverIndex(null)
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + width + " " + height,
    className: "w-full h-full",
    role: "img",
    "aria-label": "Gráfico interactivo de interés compuesto"
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    x2: width - padR,
    y1: yFor(t),
    y2: yFor(t),
    stroke: C.border,
    strokeDasharray: t === 0 ? "0" : "3 3"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 6,
    y: yFor(t) + 3,
    fontSize: "10",
    fill: C.muted,
    textAnchor: "end"
  }, formatY(t)))), series.map((s, si) => {
    const pts = data.map((d, i) => [xFor(i), yFor(d[s.key] || 0)]);
    const areaPath = "M" + pts.map(p => p.join(",")).join(" L") + " L" + xFor(data.length - 1) + "," + (padT + innerH) + " L" + padL + "," + (padT + innerH) + " Z";
    const linePath = "M" + pts.map(p => p.join(",")).join(" L");
    return /*#__PURE__*/React.createElement("g", {
      key: si
    }, /*#__PURE__*/React.createElement("path", {
      d: areaPath,
      fill: s.color,
      opacity: s.opacity ?? 0.3
    }), /*#__PURE__*/React.createElement("path", {
      d: linePath,
      fill: "none",
      stroke: s.color,
      strokeWidth: 2.2
    }));
  }), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: xFor(i),
    y: height - padB + 14,
    fontSize: "8",
    fill: C.muted,
    textAnchor: "end",
    transform: `rotate(-60, ${xFor(i)}, ${height - padB + 14})`
  }, d[xKey])), /*#__PURE__*/React.createElement("rect", {
    x: padL,
    y: padT,
    width: innerW,
    height: innerH,
    fill: "transparent",
    pointerEvents: "all"
  }), hoverIndex != null && hovered && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: tooltipX,
    x2: tooltipX,
    y1: padT,
    y2: padT + innerH,
    stroke: C.sand,
    strokeWidth: "1.5",
    strokeDasharray: "4 3",
    opacity: ".7"
  }), series.map((s, si) => /*#__PURE__*/React.createElement("circle", {
    key: si,
    cx: tooltipX,
    cy: yFor(hovered[s.key] || 0),
    r: "4",
    fill: C.surface,
    stroke: s.color,
    strokeWidth: "2.5"
  })), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${tooltipLeft},8)`
  }, /*#__PURE__*/React.createElement("rect", {
    width: tooltipW,
    height: 66 + series.length * 16,
    rx: "10",
    fill: "#ffffff",
    stroke: C.border,
    filter: "drop-shadow(0 5px 12px rgba(49,46,129,.12))"
  }), /*#__PURE__*/React.createElement("text", {
    x: "12",
    y: "19",
    fontSize: "10",
    fontWeight: "700",
    fill: C.navy
  }, hovered[xKey]), series.map((s, si) => /*#__PURE__*/React.createElement("g", {
    key: si,
    transform: `translate(0,${30 + si * 16})`
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "13",
    cy: "-3",
    r: "3",
    fill: s.color
  }), /*#__PURE__*/React.createElement("text", {
    x: "21",
    y: "0",
    fontSize: "10",
    fill: C.muted
  }, s.label || s.key, ": ", /*#__PURE__*/React.createElement("tspan", {
    fontWeight: "700",
    fill: C.ink
  }, formatY(hovered[s.key] || 0)))))))));
}

/* Donut simple, sin librerías externas */
function SimpleDonut({
  data,
  size = 200,
  thickness = 28
}) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let acc = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const dash = circumference * frac;
    const gap = circumference - dash;
    const rotation = acc / total * 360;
    acc += d.value;
    return {
      ...d,
      dash,
      gap,
      rotation,
      i
    };
  });
  const active = hover != null ? segments[hover] : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "relative inline-block",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 " + size + " " + size
  }, /*#__PURE__*/React.createElement("g", {
    transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")"
  }, segments.map(seg => /*#__PURE__*/React.createElement("circle", {
    key: seg.i,
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: seg.color,
    strokeWidth: hover === seg.i ? thickness + 6 : thickness,
    strokeDasharray: seg.dash + " " + seg.gap,
    transform: "rotate(" + seg.rotation + " " + size / 2 + " " + size / 2 + ")",
    style: {
      transition: "stroke-width 200ms ease, opacity 200ms ease",
      opacity: hover == null || hover === seg.i ? 1 : 0.35,
      cursor: "pointer"
    },
    onMouseEnter: () => setHover(seg.i),
    onMouseLeave: () => setHover(null)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3"
  }, active ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-bold font-serif",
    style: {
      color: active.color
    }
  }, active.value, "%"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold mt-0.5 leading-tight",
    style: {
      color: C.muted
    }
  }, active.name)) : /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold",
    style: {
      color: C.mutedLight
    }
  }, "Pasa el cursor", /*#__PURE__*/React.createElement("br", null), "por el gráfico")));
}

/* ============================================================
   MODAL DE AUTENTICACIÓN (registro / inicio de sesión)
   ============================================================ */
function traducirErrorAuth(mensaje) {
  const m = String(mensaje || "");
  if (/invalid login credentials/i.test(m)) return "Email o contraseña incorrectos.";
  if (/user already registered/i.test(m)) return "Ya existe una cuenta con este email. Inicia sesión.";
  if (/email not confirmed/i.test(m)) return "Confirma tu email antes de iniciar sesión (revisa tu bandeja de entrada).";
  if (/password should be at least 6 characters/i.test(m)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/unable to validate email address|invalid email/i.test(m)) return "Introduce un email válido.";
  if (/rate limit/i.test(m)) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}
function EvidenciaModal({
  tarjeta,
  onClose
}) {
  const Icon = tarjeta.icon;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: {
      backgroundColor: "rgba(5,8,16,0.7)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-xl rounded-2xl overflow-hidden flex flex-col",
    style: {
      backgroundColor: C.surface,
      maxHeight: "85vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 shrink-0",
    style: {
      borderBottom: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3.5 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: "rgba(79,70,229,.12)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 20,
    color: C.sand
  })), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-lg sm:text-xl font-bold",
    style: {
      color: C.ink
    }
  }, tarjeta.titulo)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    className: "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "px-5 sm:px-6 py-5 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed",
    style: {
      color: C.muted
    }
  }, tarjeta.texto), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] leading-relaxed mt-4",
    style: {
      color: C.mutedLight
    }
  }, tarjeta.fuente))));
}
function FeedbackModal({
  onClose
}) {
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdZ4VFZ4YlVkvARja94yGosvInko1zfN7RAH916SXlssPZh-g/viewform?usp=header&embedded=true";
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: {
      backgroundColor: "rgba(5,8,16,0.7)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col",
    style: {
      backgroundColor: C.surface,
      maxHeight: "90vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between px-5 py-4 shrink-0",
    style: {
      borderBottom: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-lg font-bold",
    style: {
      color: C.ink
    }
  }, "Danos tu opinión"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    className: "w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "px-5 pt-3 shrink-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Tu respuesta es ", /*#__PURE__*/React.createElement("b", null, "anónima"), ": no recogemos ningún dato identificativo. ¡Gracias por ayudarnos a mejorar!")), /*#__PURE__*/React.createElement("div", {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("iframe", {
    src: FORM_URL,
    title: "Formulario de opinión",
    className: "w-full h-[80svh] rounded-xl",
    style: {
      border: "1px solid " + C.border,
      backgroundColor: C.paper
    }
  }, "Cargando…"))));
}
function AuthModal({
  onClose,
  onAuthSuccess,
  signUp,
  signIn
}) {
  const [modo, setModo] = useState("registro");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avisoConfirmacion, setAvisoConfirmacion] = useState(false);
  const emailsNoCoinciden = modo === "registro" && emailConfirm.length > 0 && email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase();
  const submit = async e => {
    e.preventDefault();
    setError(null);
    if (modo === "registro" && email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError("Los dos emails no coinciden. Revísalos antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      if (modo === "registro") {
        const {
          data,
          error
        } = await signUp(email, password);
        if (error) {
          setError(traducirErrorAuth(error.message));
        } else if (data?.session) {
          onAuthSuccess();
        } else {
          setAvisoConfirmacion(true);
        }
      } else {
        const {
          data,
          error
        } = await signIn(email, password);
        if (error) {
          setError(traducirErrorAuth(error.message));
        } else {
          onAuthSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center px-4",
    style: {
      backgroundColor: "rgba(5,8,16,0.7)"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "w-full max-w-sm rounded-2xl p-6",
    style: {
      backgroundColor: C.surface
    }
  }, avisoConfirmacion ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4"
  }, /*#__PURE__*/React.createElement(I.check, {
    size: 28,
    color: C.salu,
    className: "mx-auto mb-3"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "¡Cuenta creada!"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Ya puedes iniciar sesión con tu email y contraseña. Guarda bien tus datos: si el email tiene un error, no podrás recuperar tu cuenta más adelante."), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "mt-5 px-4 py-2 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, "Entendido")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-4"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-xl font-bold",
    style: {
      color: C.ink
    }
  }, modo === "registro" ? "Crear cuenta" : "Iniciar sesión"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Cerrar",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 18
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mb-4",
    style: {
      color: C.muted
    }
  }, modo === "registro" ? "Guarda tu progreso en la nube y accede desde cualquier dispositivo." : "Bienvenido de nuevo."), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), modo === "registro" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Repite tu email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: emailConfirm,
    onChange: e => setEmailConfirm(e.target.value),
    onPaste: e => e.preventDefault(),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: emailsNoCoinciden ? C.crit : C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), emailsNoCoinciden && /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.critText
    }
  }, "Los emails no coinciden."), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.mutedLight
    }
  }, "No dejamos pegar aquí para asegurarnos de que lo escribes bien: como no enviamos email de confirmación, es la única forma de comprobar que no hay un error.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Contraseña"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: verPassword ? "text" : "password",
    required: true,
    minLength: 6,
    value: password,
    onChange: e => setPassword(e.target.value),
    className: "w-full rounded-lg pl-3 pr-10 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setVerPassword(v => !v),
    "aria-label": verPassword ? "Ocultar contraseña" : "Mostrar contraseña",
    className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded",
    style: {
      color: C.muted
    }
  }, verPassword ? /*#__PURE__*/React.createElement(I.eyeOff, {
    size: 16
  }) : /*#__PURE__*/React.createElement(I.eye, {
    size: 16
  })))), modo === "registro" && /*#__PURE__*/React.createElement(PrivacyNotice, null), error && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2",
    style: {
      backgroundColor: "rgba(239,68,68,0.08)",
      color: C.critText
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading || emailsNoCoinciden,
    className: "w-full py-2.5 rounded-lg text-sm font-bold disabled:opacity-60",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, loading ? "Un momento…" : modo === "registro" ? "Crear cuenta" : "Entrar")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setModo(modo === "registro" ? "login" : "registro");
      setError(null);
      setEmailConfirm("");
    },
    className: "w-full text-center text-xs font-bold mt-4",
    style: {
      color: C.muted
    }
  }, modo === "registro" ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"))));
}

/* ============================================================
   ESTADÍSTICAS Y GASTO HORMIGA (usados en HeroSection)
   ============================================================ */
const STATS_REALES = [{
  valor: "+82,3%",
  label: "Inflación general (IPC)",
  fuente: "INE",
  icon: I.chartLine,
  desc: "Incremento acumulado del índice de precios al consumo desde el año 2000."
}, {
  valor: ">+120,0%",
  label: "Cesta de la compra (alimentos)",
  fuente: "INE",
  icon: I.receipt,
  desc: "Encarecimiento acumulado de los alimentos básicos desde el año 2000."
}, {
  valor: "~+47,0%",
  label: "Salario medio anual",
  fuente: "INE",
  icon: I.briefcase,
  desc: "Crecimiento salarial acumulado en el mismo periodo — muy por debajo de lo anterior."
}, {
  valor: "+134,2%",
  label: "Vivienda de compra",
  fuente: "Ministerio de Vivienda (MIVAU)",
  icon: I.house,
  desc: "Encarecimiento acumulado del precio de la vivienda desde el año 2000."
}];
const GASTOS_HORMIGA_EJEMPLOS = [{
  label: "Café o desayuno fuera cada día",
  valor: 90
}, {
  label: "Comida a domicilio por pereza",
  valor: 120
}, {
  label: "Suscripciones que casi no uso",
  valor: 35
}, {
  label: "Compras impulsivas / caprichos",
  valor: 80
}, {
  label: "Tabaco",
  valor: 150
}];
const TASA_INDICE_GLOBAL = 7;
function AnimatedStatValue({
  raw
}) {
  const m = raw.match(/^([>~]?)([+-]?)([\d.,]+)/);
  const prefix = m ? m[1] : "";
  const sign = m ? m[2] : "";
  const target = m ? parseFloat(m[3].replace(",", ".")) : 0;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [target]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, prefix, sign, display.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }), "%");
}
function StatsCarousel() {
  const [idx, setIdx] = useState(0);
  const total = STATS_REALES.length;
  const pausedRef = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx(i => (i + 1) % total);
    }, 5500);
    return () => clearInterval(t);
  }, []);
  const go = dir => setIdx(i => (i + dir + total) % total);
  const s = STATS_REALES[idx];
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-6 sm:p-8 relative overflow-hidden",
    onMouseEnter: () => pausedRef.current = true,
    onMouseLeave: () => pausedRef.current = false,
    style: {
      borderColor: C.sand + "55",
      boxShadow: "0 0 30px -10px rgba(79,70,229,0.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: "rgba(79,70,229,0.07)"
    }
  }, /*#__PURE__*/React.createElement(s.icon, {
    size: 22,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go(-1),
    className: "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 border",
    style: {
      color: C.muted,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement(I.chevronLeft, {
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => go(1),
    className: "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 border",
    style: {
      color: C.muted,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement(I.chevronRight, {
    size: 15
  })))), /*#__PURE__*/React.createElement(FadeSwitch, {
    id: idx
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-5 min-h-[128px] sm:min-h-[112px]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-4xl sm:text-5xl font-bold",
    style: {
      color: C.sand
    }
  }, /*#__PURE__*/React.createElement(AnimatedStatValue, {
    raw: s.valor
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mt-2",
    style: {
      color: C.ink
    }
  }, s.label), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1.5 max-w-md",
    style: {
      color: C.muted
    }
  }, s.desc))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase inline-flex items-center gap-1 px-2 py-1 rounded-full border",
    style: {
      color: C.muted,
      border: "1px solid " + C.border,
      letterSpacing: "0.06em"
    }
  }, "Fuente: ", s.fuente), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, STATS_REALES.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setIdx(i),
    "aria-label": "Ver estadística " + (i + 1),
    className: "h-1.5 rounded-full transition-all duration-300",
    style: {
      width: i === idx ? 22 : 7,
      backgroundColor: i === idx ? C.sand : C.border
    }
  })))));
}
function GastoHormigaSection() {
  const [gasto, setGasto] = useState(0);
  const [anios, setAnios] = useState(10);
  const [seleccion, setSeleccion] = useState(null);
  const proyeccion = useMemo(() => proyeccionInteres(0, gasto, TASA_INDICE_GLOBAL, anios), [gasto, anios]);
  const ahorroSinInvertir = gasto * 12 * anios;
  const serie = useMemo(() => {
    const years = Math.max(1, Math.round(anios));
    return Array.from({
      length: years
    }, (_, i) => {
      const a = i + 1;
      const p = proyeccionInteres(0, gasto, TASA_INDICE_GLOBAL, a);
      return {
        anio: "Año " + a,
        aportado: Math.round(p.totalAportado),
        valorFuturo: Math.round(p.valorFuturo)
      };
    });
  }, [gasto, anios]);
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-6 sm:p-8"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Un pequeño experimento"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-xl sm:text-2xl font-bold",
    style: {
      color: C.ink
    }
  }, "Piensa en un gasto mensual totalmente prescindible"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 max-w-2xl",
    style: {
      color: C.muted
    }
  }, "Por ejemplo, desayunar fuera todos los días, pedir comida a domicilio por falta de organización, o una suscripción que casi no usas. Elige un ejemplo o escribe el tuyo."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mt-4"
  }, GASTOS_HORMIGA_EJEMPLOS.map(g => /*#__PURE__*/React.createElement("button", {
    key: g.label,
    onClick: () => {
      setSeleccion(g.label);
      setGasto(g.valor);
    },
    className: "px-3 py-2 rounded-lg text-xs font-bold border text-left transition-all hover:-translate-y-0.5",
    style: {
      borderColor: seleccion === g.label ? C.sand : C.border,
      backgroundColor: seleccion === g.label ? C.sandLight : C.paper,
      color: C.ink
    }
  }, g.label))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto gastas al mes en esto?",
    value: gasto,
    onChange: v => {
      setGasto(v);
      setSeleccion(null);
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-1.5",
    style: {
      color: C.ink
    }
  }, "Durante cuántos años"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "30",
    value: anios,
    onChange: e => setAnios(Number(e.target.value)),
    className: "w-full",
    style: {
      accentColor: C.sand
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold mt-1",
    style: {
      color: C.muted
    }
  }, anios, " años"))), gasto > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-6 space-y-4 fade-switch-enter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 border",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed",
    style: {
      color: C.ink
    }
  }, "¿Sabías que si hubieses ahorrado esos ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, euros(gasto), "/mes"), " durante ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, anios, " años"), ", tendrías ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, euros(ahorroSinInvertir)), "?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2.5 leading-relaxed",
    style: {
      color: C.ink
    }
  }, "Y si los hubieses invertido en un índice con las empresas más grandes del mundo (rentabilidad histórica media aproximada del ", TASA_INDICE_GLOBAL, "%/año), el interés compuesto te habría dado ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.salu
    }
  }, euros(proyeccion.interesGenerado)), " extra — un total de ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.sand
    }
  }, euros(proyeccion.valorFuturo)), ".")), /*#__PURE__*/React.createElement("div", {
    className: "h-56"
  }, /*#__PURE__*/React.createElement(SimpleAreaChart, {
    data: serie,
    xKey: "anio",
    series: [{
      key: "valorFuturo",
      label: "Con interés compuesto",
      color: C.sand,
      opacity: 0.35
    }, {
      key: "aportado",
      label: "Aportado",
      color: C.slate,
      opacity: 0.85
    }],
    formatY: v => v.toLocaleString("es-ES") + " €"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 text-xs font-bold",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full inline-block",
    style: {
      backgroundColor: C.slate
    }
  }), "Aportado"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2.5 h-2.5 rounded-full inline-block",
    style: {
      backgroundColor: C.sand
    }
  }), "Con interés compuesto")), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] readable-note"
  }, "Proyección educativa con la rentabilidad histórica media de un índice global. Rentabilidades pasadas no garantizan resultados futuros.")));
}

/* ============================================================
   RESUMEN IMPRIMIBLE — solo visible en la vista de impresión/PDF
   ============================================================ */
function PrintSummary({
  datos,
  perfil,
  gastoTotal,
  ahorroDisponible,
  ratioAhorro
}) {
  const cuotasDeuda = datos.deudas.reduce((s, d) => s + Number(d.cuota || 0), 0);
  const objetivos = normalizarObjetivos(datos);
  const planObjetivos = calcularPlanObjetivos(datos);
  const deudasActivas = datos.deudas.filter(d => Number(d.pendiente) > 0);
  const fondo = calcularFondoEmergencia(datos);
  const coberturaMeses = fondo.coberturaMeses == null ? 0 : fondo.coberturaMeses;
  const objetivoFondo = fondo.objetivo == null ? 0 : fondo.objetivo;
  const fecha = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "print-only",
    style: {
      backgroundColor: "#fff",
      color: "#1E1E2E",
      padding: "32px",
      fontFamily: "ui-sans-serif, system-ui, sans-serif"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 4
    }
  }, "MoneyPilot — Resumen"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "#6B7280",
      marginBottom: 24
    }
  }, "Generado el ", fecha, " · Documento educativo, no constituye asesoramiento financiero."), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Panorama mensual"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Ingresos mensuales"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros((Number(datos.ingresos) || 0) + (Number(datos.otrosIngresos) || 0)))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Gastos totales (incl. cuotas de deuda)"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(gastoTotal))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Ahorro disponible"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(ahorroDisponible))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Cuánto ahorras (% de lo que ingresas)"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, pct(ratioAhorro * 100))))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Fondo de emergencia"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Ahorro actual"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(datos.ahorroActual))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Objetivo (6 meses de gasto)"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, euros(objetivoFondo))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, "Cobertura actual"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right",
      fontWeight: 700
    }
  }, coberturaMeses.toFixed(1), " meses")))), deudasActivas.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Deudas activas"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      fontSize: 13,
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      textAlign: "left",
      color: "#6B7280"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "3px 0"
    }
  }, "Deuda"), /*#__PURE__*/React.createElement("th", null, "Pendiente"), /*#__PURE__*/React.createElement("th", null, "Cuota/mes"), /*#__PURE__*/React.createElement("th", null, "Interés"))), /*#__PURE__*/React.createElement("tbody", null, deudasActivas.map((d, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "3px 0"
    }
  }, d.nombre || "Sin nombre"), /*#__PURE__*/React.createElement("td", null, euros(Number(d.pendiente))), /*#__PURE__*/React.createElement("td", null, euros(Number(d.cuota))), /*#__PURE__*/React.createElement("td", null, pct(Number(d.tasa))))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "#6B7280",
      marginTop: 6
    }
  }, "Total en cuotas mensuales: ", euros(cuotasDeuda))), perfil && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("b", null, perfil), " — ", PERFILES_INFO[perfil]?.explicacion)), objetivos.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      marginTop: 20,
      marginBottom: 8,
      borderBottom: "1px solid #E5E7EB",
      paddingBottom: 4
    }
  }, "Objetivos"), planObjetivos.objetivos.map(o => /*#__PURE__*/React.createElement("p", {
    key: o.id,
    style: {
      fontSize: 13,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("b", null, o.nombre || OBJETIVOS_DEF.find(x => x.id === o.tipo)?.label || o.tipo), o.importeObjetivo > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, " — ", euros(o.importeObjetivo), " en ", o.horizonteAniosCalculado > 0 ? o.horizonteAniosCalculado.toFixed(1) + " años" : "sin plazo"), planObjetivos.principal?.id === o.id && /*#__PURE__*/React.createElement(React.Fragment, null, " · Principal")))));
}

/* ============================================================
   PANTALLA: DASHBOARD
   ============================================================ */
function Dashboard({
  ingresos,
  gastoTotal,
  ahorroDisponible,
  ratioAhorro,
  ahorroActual,
  cargaDeuda,
  perfil,
  historial,
  user,
  onOpenAuth,
  objetivos = [],
  planObjetivos
}) {
  const estado = estadoAhorro(ratioAhorro);
  const coberturaMeses = planObjetivos?.fondoEmergenciaNecesario == null || planObjetivos?.ahorroActual == null ? 0 : planObjetivos.fondoEmergenciaNecesario > 0 ? planObjetivos.ahorroActual / (planObjetivos.fondoEmergenciaNecesario / 6) : 6;
  const salud = calcularSaludFinanciera({
    ratioAhorro,
    coberturaMeses,
    cargaDeuda,
    perfil
  });
  const saludIco = salud.nombre === "Crítico" ? I.x : salud.nombre === "Mejorable" ? I.alert : I.check;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold",
    style: {
      color: C.ink
    }
  }, "Resumen financiero"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1 readable-subtitle"
  }, "Vista rápida de tu situación actual.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5",
    style: {
      borderColor: salud.color + "40"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-center sm:items-start gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-5"
  }, /*#__PURE__*/React.createElement(Termometro, {
    score: salud.score,
    color: salud.color
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Salud financiera general"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-serif text-4xl font-bold",
    style: {
      color: salud.color
    }
  }, salud.score), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "/ 100")), /*#__PURE__*/React.createElement("div", {
    className: "mt-1.5"
  }, /*#__PURE__*/React.createElement(Badge, {
    estado: {
      nombre: salud.nombre,
      color: salud.color,
      light: salud.light,
      Ico: saludIco
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-3 max-w-sm",
    style: {
      color: C.muted
    }
  }, salud.score < 35 ? "No necesitas arreglarlo todo hoy. Empecemos por crear margen y una red de seguridad." : salud.score < 60 ? "Ya tenemos una foto clara. Unos pocos ajustes pueden darte más margen y protección." : salud.score < 80 ? "Tu base está tomando forma. Ahora podemos convertir ese margen en objetivos." : "Tienes una base sólida para seguir construyendo objetivos con calma."))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 w-full grid grid-cols-2 gap-x-6 gap-y-3"
  }, /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Ahorro",
    pts: salud.desglose.ptsAhorro,
    max: 40,
    color: C.exc
  }), /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Fondo de emergencia",
    pts: salud.desglose.ptsFondo,
    max: 30,
    color: C.salu
  }), /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Peso de tus deudas sobre tus ingresos",
    pts: salud.desglose.ptsDeuda,
    max: 20,
    color: C.mej
  }), /*#__PURE__*/React.createElement(DesgloseBarra, {
    label: "Perfil de riesgo",
    pts: salud.desglose.ptsPerfil,
    max: 10,
    color: C.sand
  })))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
  }, /*#__PURE__*/React.createElement(StatCard, {
    icon: I.landmark,
    label: "Ingresos mensuales",
    value: /*#__PURE__*/React.createElement(AnimatedNumber, {
      value: ingresos
    }),
    accent: C.navy,
    delay: 0
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: I.receipt,
    label: "Gastos mensuales",
    value: /*#__PURE__*/React.createElement(AnimatedNumber, {
      value: gastoTotal
    }),
    accent: C.mej,
    delay: 60
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: I.piggy,
    label: "Ahorro disponible",
    value: /*#__PURE__*/React.createElement(AnimatedNumber, {
      value: ahorroDisponible
    }),
    sub: pct(ratioAhorro * 100) + " de tus ingresos",
    accent: ahorroDisponible >= 0 ? C.salu : C.crit,
    delay: 120
  }), /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex flex-col gap-3 stagger-item",
    style: {
      animationDelay: "180ms"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Cómo vas hoy"), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: estado.light
    }
  }, /*#__PURE__*/React.createElement(estado.Ico, {
    size: 17,
    color: estado.color,
    strokeWidth: 2.2
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    estado: estado
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Basado en tu margen de ahorro sobre ingresos"))), objetivos.length > 0 && (() => {
    const plan = planObjetivos;
    const relevantes = plan.objetivos.slice(0, 3);
    return /*#__PURE__*/React.createElement(Card, {
      className: "p-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3 mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tus objetivos"), /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-lg font-bold mt-1",
      style: {
        color: C.ink
      }
    }, "Lo que estás construyendo")), plan.principal && /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold truncate min-w-0 max-w-[45%] shrink-0",
      style: {
        color: C.navy
      }
    }, "Principal: ", plan.principal.nombre)), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, relevantes.map(o => /*#__PURE__*/React.createElement("div", {
      key: o.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between gap-3 text-xs min-w-0"
    }, /*#__PURE__*/React.createElement("b", {
      className: "truncate min-w-0",
      style: {
        color: C.ink
      }
    }, o.nombre), /*#__PURE__*/React.createElement("span", {
      className: "shrink-0",
      style: {
        color: C.muted
      }
    }, o.plazoAnios > 0 ? `${o.plazoAnios} años` : "Sin plazo")), /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full mt-1.5 overflow-hidden",
      style: {
        backgroundColor: C.bgDeepMid
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full rounded-full",
      style: {
        width: o.progreso + "%",
        backgroundColor: C.salu
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] mt-1",
      style: {
        color: C.muted
      }
    }, pct(o.progreso, 0), " · ", euros(o.importeRestante), " restantes")))));
  })(), perfil && /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex items-center gap-4",
    style: {
      borderColor: PERFILES_INFO[perfil].color + "55"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
    style: {
      backgroundColor: PERFILES_INFO[perfil].light
    }
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 20,
    color: PERFILES_INFO[perfil].color
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.muted,
      letterSpacing: "0.08em"
    }
  }, "Tu perfil de riesgo"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-lg font-bold",
    style: {
      color: PERFILES_INFO[perfil].color
    }
  }, perfil))));
}

/* ============================================================
   PLAN DE AMORTIZACIÓN DE DEUDA (bola de nieve vs. avalancha)
   ============================================================ */
function AmortizacionDeuda({
  deudas
}) {
  const [extra, setExtra] = useState(0);
  const [vista, setVista] = useState("nieve");
  const deudasActivas = useMemo(() => deudas.filter(d => Number(d.pendiente) > 0), [deudas]);
  const resultado = useMemo(() => {
    if (deudasActivas.length === 0) return null;
    return {
      nieve: simularAmortizacion(deudasActivas, extra, "nieve"),
      avalancha: simularAmortizacion(deudasActivas, extra, "avalancha"),
      soloMinimos: simularAmortizacion(deudasActivas, 0, "nieve")
    };
  }, [deudasActivas, extra]);
  if (!resultado) return null;
  const {
    nieve,
    avalancha,
    soloMinimos
  } = resultado;
  const ahorroNieve = soloMinimos.totalInteres - nieve.totalInteres;
  const ahorroAvalancha = soloMinimos.totalInteres - avalancha.totalInteres;
  const mejorInteres = avalancha.totalInteres <= nieve.totalInteres ? "avalancha" : "nieve";
  const datosVista = vista === "nieve" ? nieve : avalancha;
  const resumenTiempo = r => r.todasLiquidadas ? formatMeses(r.mesesTotal) : "+40 años";
  const cuotasMensuales = deudasActivas.reduce((s, d) => s + Number(d.cuota || 0), 0);
  const ahorroInteresMax = Math.max(0, ahorroNieve, ahorroAvalancha);
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: C.saluLight
    }
  }, /*#__PURE__*/React.createElement(I.rocket, {
    size: 18,
    color: C.salu
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Estrategia para eliminar tus deudas"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Un plan claro para quedarte sin deudas"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Cuando termines de pagar una deuda, la cuota que le dedicabas queda libre para tus objetivos."))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4 mb-5",
    style: {
      backgroundColor: C.saluLight,
      border: "1px solid rgba(16,185,129,.16)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.salu,
      letterSpacing: "0.08em"
    }
  }, "Cuando elimines todas tus deudas"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-2xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Recuperarás ", euros(cuotasMensuales), " al mes"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Ahora mismo esas cuotas están comprometidas. En cuanto saldes las deudas, ese dinero queda libre y puedes destinarlo a tu fondo de emergencia o a tus objetivos.")), /*#__PURE__*/React.createElement("div", {
    className: "max-w-xs mb-5"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto más podrías pagar cada mes?",
    value: extra,
    onChange: setExtra,
    hint: "Añade aquí un extra opcional, por encima de las cuotas mínimas, para ver cuánto antes quedarías libre de deudas."
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5"
  }, [{
    key: "nieve",
    nombre: "Bola de nieve",
    desc: "Empieza por la deuda más pequeña para conseguir hitos visibles.",
    datos: nieve
  }, {
    key: "avalancha",
    nombre: "Avalancha",
    desc: "Empieza por la de mayor interés para priorizar el ahorro matemático.",
    datos: avalancha
  }].map(e => /*#__PURE__*/React.createElement("button", {
    key: e.key,
    onClick: () => setVista(e.key),
    className: "text-left rounded-xl p-4 border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.99]",
    style: {
      borderColor: vista === e.key ? C.sand : C.border,
      backgroundColor: vista === e.key ? C.sandLight : C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, e.nombre), mejorInteres === e.key && extra > 0 && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
    style: {
      backgroundColor: "rgba(16,185,129,0.08)",
      color: C.salu
    }
  }, "Menos interés")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, e.desc), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex items-baseline gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-serif text-xl font-bold",
    style: {
      color: C.ink
    }
  }, resumenTiempo(e.datos)), /*#__PURE__*/React.createElement("span", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "para eliminar todas tus deudas")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Interés total: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, euros(e.datos.totalInteres)))))), extra > 0 && soloMinimos.todasLiquidadas && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-xl px-4 py-3 mb-5 flex items-start gap-2",
    style: {
      backgroundColor: "rgba(16,185,129,0.08)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement(I.sparkles, {
    size: 14,
    className: "mt-0.5 shrink-0",
    color: C.salu
  }), /*#__PURE__*/React.createElement("span", null, "Buen movimiento: pagando ", euros(extra), "/mes de más, te ahorrarías hasta ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.salu
    }
  }, euros(ahorroInteresMax)), " en intereses respecto a pagar solo las cuotas mínimas.")), extra > 0 && datosVista.todasLiquidadas && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 mb-5",
    style: {
      backgroundColor: C.sandLight,
      border: "1px solid rgba(79,70,229,.14)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Cuando saldes la última deuda, recuperas ", euros(cuotasMensuales), "/mes."), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Ese dinero puede ir directo a tu fondo de emergencia o a tus objetivos.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-2",
    style: {
      color: C.sand,
      letterSpacing: "0.06em"
    }
  }, "Orden para pagar tus deudas — ", vista === "nieve" ? "Bola de nieve" : "Avalancha"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, datosVista.orden.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d.nombre + i,
    className: "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold truncate",
    style: {
      color: C.ink
    }
  }, d.nombre), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, d.liquidada ? /*#__PURE__*/React.createElement(React.Fragment, null, "La saldarías en el mes ", d.mesLiquidacion, " (", formatMeses(d.mesLiquidacion), ")") : "Con estos importes, no la saldarías dentro de 40 años"))), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold text-right shrink-0",
    style: {
      color: C.mej
    }
  }, euros(d.interesPagado), " interés"))))));
}

/* ============================================================
   PANTALLA: SIMULADOR
   ============================================================ */
function SelectorCalculadora({
  onRecomendar
}) {
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState(1);
  const [recomendacion, setRecomendacion] = useState(null);
  const elegirTieneMeta = tieneMeta => {
    if (!tieneMeta) {
      setRecomendacion({
        modo: "capital",
        titulo: "Capital final: ¿cuánto tendré?",
        texto: "Como no tienes una meta concreta, te mostramos hasta dónde puede llegar tu ahorro con el tiempo."
      });
    } else {
      setPaso(2);
    }
  };
  const elegirDuda = (modo, titulo, texto) => setRecomendacion({
    modo,
    titulo,
    texto
  });
  const reiniciar = () => {
    setPaso(1);
    setRecomendacion(null);
  };
  const volver = () => setPaso(1);
  if (!abierto) return /*#__PURE__*/React.createElement(Card, {
    className: "p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "¿No sabes cuál usar?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.ink
    }
  }, "Contesta un par de preguntas rápidas y te decimos qué calculadora encaja con lo que necesitas, y por qué.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAbierto(true),
    className: "shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Ayúdame a elegir"));
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-6 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Te ayudamos a elegir"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAbierto(false);
      reiniciar();
    },
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "Cerrar")), !recomendacion && paso === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-lg font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "¿Tienes ya una cifra concreta que quieres ahorrar?"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mt-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => elegirTieneMeta(true),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "Sí, tengo una meta en mente"), /*#__PURE__*/React.createElement("button", {
    onClick: () => elegirTieneMeta(false),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "No, quiero ver hasta dónde llego"))), !recomendacion && paso === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: volver,
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-1",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-lg font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "¿Qué es lo que no tienes claro?"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2 mt-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => elegirDuda("tiempo", "Tiempo para llegar a tu meta", "Con tu meta ya definida, esta calculadora te dice cuántos años y meses necesitas para alcanzarla."),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold text-left",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "Cuánto tiempo me llevará llegar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => elegirDuda("aportacion", "Aportación mensual necesaria", "Con tu meta y el plazo, esta calculadora te dice cuánto necesitas ahorrar cada mes para llegar."),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold text-left",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "Cuánto tengo que ahorrar cada mes"), /*#__PURE__*/React.createElement("button", {
    onClick: () => elegirDuda("rentabilidad", "Rentabilidad necesaria", "Con tu meta, tu plazo y lo que aportas, esta calculadora te dice qué rentabilidad necesitarías para lograrlo."),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold text-left",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "Si lo que espero ganar será suficiente"))), recomendacion && /*#__PURE__*/React.createElement("div", {
    className: "mt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.salu,
      letterSpacing: ".1em"
    }
  }, "Te recomendamos"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-lg font-bold mt-1"
  }, recomendacion.titulo), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1.5"
  }, recomendacion.texto)), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-4 mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onRecomendar(recomendacion.modo),
    className: "inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Abrir esta calculadora"), /*#__PURE__*/React.createElement("button", {
    onClick: reiniciar,
    className: "text-sm font-bold",
    style: {
      color: C.muted
    }
  }, "Volver a empezar"))));
}
function Simulador({
  sim,
  setSim,
  objetivos = [],
  objetivoSeleccionadoId = null,
  onSeleccionarObjetivo,
  ahorroDisponible = 0,
  perfil = null,
  onIrACalculadoras
}) {
  const [vista, setVista] = useState("5anos");
  const seleccionado = objetivos.find(o => o.id === objetivoSeleccionadoId) || null;
  const tieneDatos = !!seleccionado || !!perfil;

  // UX: el simulador ya no pide números al usuario; calcula automáticamente
  // el escenario que le corresponde a partir de su objetivo guardado y/o su
  // perfil de riesgo. Si quiere tocar cifras libremente, se le dirige a
  // la vista de calculadoras, pensada para eso.
  const inicial = seleccionado ? seleccionado.importeReservadoAplicado ?? 0 : 0;
  const mensual = seleccionado ? seleccionado.aportacionMensual ?? ahorroDisponible ?? 0 : ahorroDisponible ?? 0;
  const tasa = perfil ? PERFILES_INFO[perfil].rentabilidad : 4;
  const horizonte = seleccionado ? seleccionado.horizonteAniosCalculado ?? seleccionado.plazoAnios ?? 10 : 10;
  const horizonteSim = Number(horizonte) > 0 ? Number(horizonte) : 10;
  const serie = useMemo(() => Array.from({
    length: 50
  }, (_, i) => proyeccionInteres(Number(inicial) || 0, Number(mensual) || 0, Number(tasa) || 0, i + 1)), [inicial, mensual, tasa]);
  const resultadoObjetivo = useMemo(() => {
    if (!seleccionado || !horizonteSim || seleccionado.importeObjetivo == null) return null;
    const p = proyeccionInteres(Number(inicial) || 0, Number(mensual) || 0, Number(tasa) || 0, horizonteSim);
    const objetivo = Number(seleccionado.importeObjetivo);
    return {
      objetivo,
      restante: seleccionado.importeRestante,
      valor: p.valorFuturo,
      alcanzado: p.valorFuturo >= objetivo,
      aportado: p.totalAportado
    };
  }, [seleccionado, inicial, mensual, tasa, horizonteSim]);
  const filasTabla = useMemo(() => {
    const anos = vista === "5anos" ? [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] : Array.from({
      length: Math.min(50, Math.ceil(horizonteSim) + 5)
    }, (_, i) => i + 1);
    return anos.map(a => serie[a - 1]).filter(Boolean).map((d, i, arr) => ({
      ...d,
      diferenciaAnterior: d.valorFuturo - (i === 0 ? Number(inicial) || 0 : arr[i - 1].valorFuturo)
    }));
  }, [serie, vista, inicial, horizonteSim]);
  const chartData = serie.slice(0, Math.min(50, Math.ceil(horizonteSim) + 5)).map(d => ({
    anio: d.anios,
    aportado: Math.round(d.totalAportado),
    valorFuturo: Math.round(d.valorFuturo)
  }));
  const cargarObjetivo = o => {
    if (!o) return;
    onSeleccionarObjetivo && onSeleccionarObjetivo(o.id);
  };
  const limpiarObjetivo = () => {
    onSeleccionarObjetivo && onSeleccionarObjetivo(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold",
    style: {
      color: C.ink
    }
  }, "Tu escenario de ahorro"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1 readable-subtitle"
  }, "Calculado con tus propios datos. Es una proyección educativa: las rentabilidades son hipotéticas y no garantizan resultados futuros.")), objetivos.length > 0 && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Conecta un objetivo"), seleccionado && /*#__PURE__*/React.createElement("button", {
    onClick: limpiarObjetivo,
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "Quitar objetivo")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 mt-3"
  }, objetivos.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    onClick: () => cargarObjetivo(o),
    className: "px-3 py-2 rounded-lg border text-xs font-bold text-left",
    style: {
      borderColor: seleccionado?.id === o.id ? C.sand : C.border,
      backgroundColor: seleccionado?.id === o.id ? C.sandLight : C.paper,
      color: C.ink
    }
  }, o.nombre || OBJETIVOS_DEF.find(x => x.id === o.tipo)?.label || "Objetivo sin nombre"))), seleccionado && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-xl p-3 text-xs",
    style: {
      backgroundColor: C.sandLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, seleccionado.nombre || "Objetivo seleccionado"), " · La proyección usa el ahorro y el plazo de este objetivo automáticamente.")), !tieneDatos ? /*#__PURE__*/React.createElement(Card, {
    className: "p-6 text-center"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Aún no tenemos datos suficientes"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Completa tu diagnóstico y tu perfil de riesgo primero"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 max-w-md mx-auto",
    style: {
      color: C.muted
    }
  }, "Así podremos calcular un escenario con tus propios números, en vez de mostrarte cifras genéricas que no te aplican."), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 pt-5 max-w-md mx-auto",
    style: {
      borderTop: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Mientras tanto, puedes curiosear con cifras de ejemplo en nuestra calculadora libre."), /*#__PURE__*/React.createElement("button", {
    onClick: onIrACalculadoras,
    className: "mt-3 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Prueba nuestras calculadoras"))) : /*#__PURE__*/React.createElement(React.Fragment, null, !seleccionado && perfil && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2.5",
    style: {
      backgroundColor: C.saluLight,
      color: C.ink
    }
  }, "Este escenario usa tu ahorro disponible (", /*#__PURE__*/React.createElement("b", null, euros(mensual), "/mes"), ") y la rentabilidad típica de tu perfil de riesgo (", /*#__PURE__*/React.createElement("b", null, perfil, " · ", tasa, "%"), ")."), seleccionado && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Objetivo seleccionado"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Objetivo"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, seleccionado.importeObjetivo == null ? "—" : euros(seleccionado.importeObjetivo))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Restante"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, seleccionado.importeRestante == null ? "—" : euros(seleccionado.importeRestante))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Horizonte"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, horizonteSim ? `${horizonteSim.toFixed(1)} años` : "—")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Necesario"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, seleccionado.aportacionNecesaria == null ? "—" : euros(seleccionado.aportacionNecesaria) + "/mes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Tu aportación"), /*#__PURE__*/React.createElement("b", {
    className: "block",
    style: {
      color: C.ink
    }
  }, euros(mensual), "/mes"))), resultadoObjetivo && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded-xl p-4",
    style: {
      backgroundColor: resultadoObjetivo.alcanzado ? C.saluLight : C.critLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, resultadoObjetivo.alcanzado ? "En este escenario hipotético, el objetivo se alcanzaría dentro del horizonte indicado." : "En este escenario hipotético, el objetivo no se alcanzaría dentro del horizonte indicado."), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-xs"
  }, "Valor proyectado: ", euros(resultadoObjetivo.valor), " · Objetivo: ", euros(resultadoObjetivo.objetivo), "."))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Crecimiento año a año"), /*#__PURE__*/React.createElement("div", {
    className: "h-72 mt-4"
  }, /*#__PURE__*/React.createElement(SimpleAreaChart, {
    data: chartData,
    xKey: "anio",
    series: [{
      key: "valorFuturo",
      label: "Escenario hipotético",
      color: C.sand,
      opacity: 0.35
    }, {
      key: "aportado",
      label: "Aportado",
      color: C.slate,
      opacity: 0.85
    }],
    height: 288,
    formatY: v => v.toLocaleString("es-ES") + " €"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 mt-2 text-xs font-bold",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, "Aportado"), /*#__PURE__*/React.createElement("span", null, "Escenario hipotético")), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] readable-note mt-3"
  }, "Este cálculo es una simulación matemática. La rentabilidad elegida es una hipótesis educativa y no constituye una previsión ni una garantía.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5 overflow-x-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between flex-wrap gap-3"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tabla de proyección"), /*#__PURE__*/React.createElement("select", {
    value: vista,
    onChange: e => setVista(e.target.value),
    className: "text-xs font-bold rounded-lg px-3 py-1.5 border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "5anos"
  }, "Ver cada 5 años"), /*#__PURE__*/React.createElement("option", {
    value: "anoAno"
  }, "Ver año a año"))), /*#__PURE__*/React.createElement("table", {
    className: "w-full mt-4 text-sm min-w-[680px]"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "2px solid " + C.border
    }
  }, ["Año", "Total aportado", "Valor futuro hipotético", "Interés generado", "Crecimiento respecto al año anterior"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    className: "text-left py-2 font-bold",
    style: {
      color: C.muted
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filasTabla.map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.anios,
    style: {
      borderBottom: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.ink
    }
  }, d.anios), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5",
    style: {
      color: C.ink
    }
  }, euros(d.totalAportado)), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.ink
    }
  }, euros(d.valorFuturo)), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.salu
    }
  }, euros(d.interesGenerado)), /*#__PURE__*/React.createElement("td", {
    className: "py-2.5 font-bold",
    style: {
      color: C.mej
    }
  }, "+", euros(d.diferenciaAnterior))))))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "¿Quieres jugar con los números?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.ink
    }
  }, "Si quieres cambiar la aportación, el plazo o probar otras rentabilidades libremente, usa nuestra calculadora dedicada.")), /*#__PURE__*/React.createElement("button", {
    onClick: onIrACalculadoras,
    className: "shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Prueba nuestras calculadoras"))));
}
function PerfilRiesgo({
  onPerfilCalculado,
  quizState,
  setQuizState,
  datos
}) {
  const estadoNormalizado = useMemo(() => reconstruirEstadoQuiz(quizState, datos), [quizState, datos]);
  const respuestas = estadoNormalizado.respuestas;
  const resultado = useMemo(() => calcularPerfilMultidimensional(respuestas, datos), [respuestas, datos]);
  const questionPath = estadoNormalizado.questionPath;
  const currentQuestionId = estadoNormalizado.currentQuestionId;
  const currentIndex = Math.max(0, questionPath.indexOf(currentQuestionId));
  const q = QUIZ_DEF[currentQuestionId] || QUIZ_DEF.edad;
  const valorGuardado = respuestas[q.id];
  useEffect(() => {
    const resultadoActual = estadoNormalizado.terminado ? calcularPerfilMultidimensional(respuestas, datos) : null;
    if (JSON.stringify(quizState) !== JSON.stringify({
      ...estadoNormalizado,
      resultado: resultadoActual,
      datosSnapshot: quizState?.datosSnapshot
    })) {
      setQuizState({
        ...estadoNormalizado,
        resultado: resultadoActual,
        datosSnapshot: quizState?.datosSnapshot
      });
    }
    if (resultadoActual?.perfil) onPerfilCalculado(resultadoActual.perfil, resultadoActual);
  }, [estadoNormalizado.currentQuestionId, estadoNormalizado.terminado, estadoNormalizado.questionPath.join("|"), JSON.stringify(respuestas), datos.ingresos, JSON.stringify(datos.gastosFijos), JSON.stringify(datos.gastosDiscrecionales), datos.ahorroActual, JSON.stringify(datos.deudas), JSON.stringify(datos.objetivos), JSON.stringify(datos.objetivo)]);
  const rutaCompletaEstimable = useMemo(() => {
    /*
     * La longitud futura no puede conocerse hasta contestar las preguntas que
     * abren ramas. Para evitar cálculos costosos, proyectamos un recorrido
     * representativo usando las respuestas actuales y valores conservadores
     * en las decisiones todavía desconocidas.
     */
    const r = {
      ...respuestas
    };
    let id = currentQuestionId;
    let count = 0;
    const vistos = new Set();
    while (id && !vistos.has(id) && count < 30) {
      vistos.add(id);
      count++;
      if (quizNumero(r, id) == null) {
        /* En una pregunta aún no respondida no inventamos una respuesta única:
           tomamos la rama que produzca el recorrido más largo de forma local. */
        const siguientes = (QUIZ_DEF[id]?.opciones || []).map((_, i) => {
          const rr = {
            ...r,
            [id]: i + 1
          };
          return getNextQuestionId(id, rr, datos);
        }).filter(Boolean);
        id = siguientes[siguientes.length - 1] || null;
      } else {
        id = getNextQuestionId(id, r, datos);
      }
    }
    return Math.max(count, currentIndex + 1);
  }, [respuestas, currentQuestionId, currentIndex, datos]);
  const responder = valor => {
    const nuevas = {
      ...respuestas,
      [q.id]: valor
    };
    const prefijo = questionPath.slice(0, currentIndex + 1);
    const idsValidos = new Set(prefijo);
    Object.keys(nuevas).forEach(id => {
      if (!idsValidos.has(id)) delete nuevas[id];
    });
    const siguienteId = getNextQuestionId(q.id, nuevas, datos);
    const nuevoPath = [...prefijo];
    if (siguienteId) nuevoPath.push(siguienteId);
    if (!siguienteId) {
      const nuevoResultado = calcularPerfilMultidimensional(nuevas, datos);
      const capacidadAlFinalizar = calcularCapacidadFinanciera(datos);
      const nuevoEstado = {
        respuestas: nuevas,
        currentQuestionId: q.id,
        questionPath: nuevoPath,
        paso: nuevoPath.length - 1,
        terminado: true,
        resultado: nuevoResultado,
        datosSnapshot: {
          ingresos: Number(capacidadAlFinalizar.ingresos) || 0,
          deudaPendiente: (datos.deudas || []).reduce((s, d) => s + Number(d.pendiente || 0), 0),
          ahorroActual: Number(datos.ahorroActual) || 0,
          capacidadMensual: Number(capacidadAlFinalizar.capacidadMensual) || 0
        }
      };
      setQuizState(nuevoEstado);
      onPerfilCalculado(nuevoResultado.perfil, nuevoResultado);
      return;
    }
    setQuizState({
      respuestas: nuevas,
      currentQuestionId: siguienteId,
      questionPath: nuevoPath,
      paso: nuevoPath.length - 1,
      terminado: false,
      resultado: null
    });
  };
  const anterior = () => {
    if (currentIndex <= 0) return;
    const nuevoPath = questionPath.slice(0, currentIndex);
    const previousId = nuevoPath[nuevoPath.length - 1] || "edad";
    setQuizState({
      ...quizState,
      respuestas,
      currentQuestionId: previousId,
      questionPath: nuevoPath,
      paso: Math.max(0, nuevoPath.length - 1),
      terminado: false,
      resultado: null
    });
  };
  const repetir = () => {
    const inicial = {
      respuestas: {},
      currentQuestionId: "edad",
      questionPath: ["edad"],
      paso: 0,
      terminado: false,
      resultado: null
    };
    setQuizState(inicial);
    onPerfilCalculado(null, null);
  };
  if (estadoNormalizado.terminado) {
    const nombrePerfil = resultado.perfil;
    const info = PERFILES_INFO[nombrePerfil];
    const capacidadActual = calcularCapacidadFinanciera(datos);
    const snapshot = quizState?.datosSnapshot;
    const deudaPendienteActual = (datos.deudas || []).reduce((s, d) => s + Number(d.pendiente || 0), 0);
    const cambioSignificativo = !!snapshot && (() => {
      const diffRelativo = (a, b) => a === 0 && b === 0 ? 0 : Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1);
      return diffRelativo(snapshot.ingresos, Number(capacidadActual.ingresos) || 0) > 0.20 || diffRelativo(snapshot.deudaPendiente, deudaPendienteActual) > 0.30 || diffRelativo(snapshot.ahorroActual, Number(datos.ahorroActual) || 0) > 0.30 || diffRelativo(snapshot.capacidadMensual, Number(capacidadActual.capacidadMensual) || 0) > 0.30;
    })();
    const dimensiones = [["Edad", resultado.edad], ["Tolerancia al riesgo", resultado.toleranciaRiesgo], ["Capacidad para soportar pérdidas", resultado.capacidadRiesgo], ["Horizonte temporal", resultado.horizonte], ["Necesidad de liquidez", resultado.liquidez], ["Conocimientos / experiencia", resultado.experiencia]];
    const confianzaColor = resultado.confianza === "Alta" ? C.salu : resultado.confianza === "Media" ? C.mej : C.crit;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-6"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "font-serif text-2xl font-bold readable-title"
    }, "Test de perfil de riesgo")), /*#__PURE__*/React.createElement(Card, {
      className: "p-8",
      style: {
        borderColor: info.color + "55"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
      style: {
        backgroundColor: info.light
      }
    }, /*#__PURE__*/React.createElement(I.shieldCheck, {
      size: 28,
      color: info.color
    })), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase",
      style: {
        color: C.muted,
        letterSpacing: "0.1em"
      }
    }, "Perfil final"), /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-3xl font-bold mt-1",
      style: {
        color: info.color
      }
    }, nombrePerfil), /*#__PURE__*/React.createElement("p", {
      className: "text-sm mt-4 max-w-xl mx-auto",
      style: {
        color: C.muted
      }
    }, info.explicacion)), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6"
    }, dimensiones.map(([label, value]) => /*#__PURE__*/React.createElement("div", {
      key: label,
      className: "rounded-xl border p-3",
      style: {
        borderColor: C.border,
        backgroundColor: C.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold",
      style: {
        color: C.ink
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-bold",
      style: {
        color: value == null ? C.muted : C.navy
      }
    }, value == null ? "Sin datos" : value + "/100")), value != null && /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full mt-2 overflow-hidden",
      style: {
        backgroundColor: C.bgDeepMid
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full rounded-full",
      style: {
        width: value + "%",
        backgroundColor: info.color
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl border p-4 mt-5",
      style: {
        borderColor: confianzaColor + "55",
        backgroundColor: confianzaColor + "10"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold uppercase",
      style: {
        color: C.muted,
        letterSpacing: "0.08em"
      }
    }, "Nivel de confianza"), /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-bold",
      style: {
        color: confianzaColor
      }
    }, resultado.confianza)), resultado.faltantes.length > 0 && /*#__PURE__*/React.createElement("p", {
      className: "text-xs mt-2",
      style: {
        color: C.muted
      }
    }, "Faltan datos importantes (", resultado.faltantes.join(", "), "), por lo que el resultado tiene menor confianza.")), /*#__PURE__*/React.createElement("div", {
      className: "mt-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-lg font-bold readable-title"
    }, "¿Por qué tienes este perfil?"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4",
      style: {
        backgroundColor: C.saluLight
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-2",
      style: {
        color: C.salu
      }
    }, "Factores positivos"), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1.5 text-xs",
      style: {
        color: C.ink
      }
    }, resultado.factoresPositivos.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, "• ", f)))), /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4",
      style: {
        backgroundColor: C.critLight
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-2",
      style: {
        color: C.crit
      }
    }, "Factores a vigilar"), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-1.5 text-xs",
      style: {
        color: C.ink
      }
    }, resultado.factoresNegativos.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, "• ", f)))))), /*#__PURE__*/React.createElement("div", {
      className: "mt-5 rounded-xl p-4",
      style: {
        backgroundColor: C.paper,
        border: "1px solid " + C.border
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-serif text-lg font-bold readable-title"
    }, "Factores que hemos tenido en cuenta"), /*#__PURE__*/React.createElement("ul", {
      className: "grid sm:grid-cols-2 gap-1.5 mt-3 text-xs",
      style: {
        color: C.ink
      }
    }, resultado.factoresTenidosEnCuenta.map((f, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, "• ", f)))), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mt-5 p-3 rounded-lg",
      style: {
        backgroundColor: C.bgDeepMid,
        color: C.muted
      }
    }, "El perfil no se determina por una única puntuación: la capacidad financiera incorpora ahorro disponible, fondo de emergencia, deuda, estabilidad de ingresos, patrimonio y necesidades de los objetivos, mientras que los conocimientos se evalúan en un bloque independiente."), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, cambioSignificativo && /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4 mb-4 text-left",
      style: {
        backgroundColor: C.mejLight,
        border: "1px solid " + C.mej
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-2.5"
    }, /*#__PURE__*/React.createElement(I.alert, {
      size: 16,
      color: C.mej,
      className: "mt-0.5 shrink-0"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
      className: "text-sm",
      style: {
        color: C.ink
      }
    }, "Tu situación financiera ha cambiado desde que hiciste este test"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs mt-1",
      style: {
        color: C.muted
      }
    }, "Repetirlo puede darte un perfil más ajustado a cómo estás ahora.")))), /*#__PURE__*/React.createElement("button", {
      onClick: repetir,
      className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.98]",
      style: {
        backgroundColor: C.navy,
        color: C.white
      }
    }, "Repetir el test"))));
  }
  const completadas = Math.max(0, currentIndex);
  const remainingEstimate = Math.max(1, rutaCompletaEstimable - Math.max(0, currentIndex + 1));
  const progresoBase = completadas / (completadas + remainingEstimate) * 100;
  const progreso = Math.min(96, Math.max(0, progresoBase));
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold readable-title"
  }, "Test de perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    className: "readable-subtitle"
  }, "Cuestionario adaptativo — las preguntas y el detalle del análisis cambian según tus respuestas y tu situación financiera.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs font-bold mb-1.5",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, "Pregunta ", currentIndex + 1, rutaCompletaEstimable ? " · " + (rutaCompletaEstimable <= currentIndex + 1 ? "recorrido final" : "~" + rutaCompletaEstimable + " máx.") : ""), /*#__PURE__*/React.createElement("span", null, completadas, " respondidas")), /*#__PURE__*/React.createElement(ProgressBar, {
    pctValue: progreso,
    color: C.sand
  })), /*#__PURE__*/React.createElement(FadeSwitch, {
    id: q.id + "-" + currentIndex
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mb-2 quiz-question"
  }, q.texto), q.nota && /*#__PURE__*/React.createElement("div", {
    className: "text-xs rounded-lg px-3 py-2 mb-4 inline-flex items-start gap-1.5 quiz-note"
  }, /*#__PURE__*/React.createElement(I.info, {
    size: 13,
    className: "mt-0.5 shrink-0"
  }), " ", q.nota), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 mt-3"
  }, q.opciones.map((o, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => responder(i + 1),
    className: "quiz-option",
    "aria-pressed": valorGuardado === i + 1
  }, o, " ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 15,
    color: C.muted
  })))))), currentIndex > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: anterior,
    className: "inline-flex items-center gap-1.5 text-sm font-bold",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 14
  }), " Pregunta anterior"));
}

/* ============================================================
   PANTALLA: ESTRATEGIA
   ============================================================ */
function Estrategia({
  perfil,
  onGoToPerfil = () => {},
  onGoToSimulador = () => {},
  setSim,
  ahorroDisponible,
  datos,
  onSeleccionarObjetivo
}) {
  const planObjetivos = useMemo(() => calcularPlanObjetivos(datos || {}), [datos]);
  const fondo = calcularFondoEmergencia(datos || {});
  if (!perfil) return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold readable-title"
  }, "Estrategia financiera")), /*#__PURE__*/React.createElement(Card, {
    className: "p-10 text-center"
  }, /*#__PURE__*/React.createElement(I.clipboard, {
    size: 32,
    className: "mx-auto mb-3",
    color: C.muted
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Todavía no has completado tu test de perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Complétalo para integrar tu horizonte, tolerancia y capacidad financiera en la estrategia."), /*#__PURE__*/React.createElement("button", {
    onClick: () => onGoToPerfil(),
    className: "inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, "Hacer el test ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 14
  }))));
  const info = PERFILES_INFO[perfil] || PERFILES_INFO["Moderado"];
  const principal = planObjetivos.principal;
  const deudaActiva = (datos.deudas || []).filter(d => Number(d.pendiente) > 0);
  const fondoSuficiente = fondo.objetivo != null && fondo.coberturaMeses != null && fondo.coberturaMeses >= 6;
  const baseEstable = planObjetivos.capacidadMensual != null && planObjetivos.capacidadMensual > 0;
  const puedeValorarInversion = fondoSuficiente && deudaActiva.length === 0 && baseEstable && (!principal || principal.horizonteAniosCalculado == null || principal.horizonteAniosCalculado >= 5);
  const estadoPrincipal = principal?.estadoViabilidad;
  const estadoLabel = {
    viable: "Viable",
    ajustado: "Ajustado",
    no_viable: "No viable",
    pendiente: "Pendiente de datos",
    pendiente_capacidad: "Pendiente de capacidad",
    completado: "Completado"
  }[estadoPrincipal] || "Pendiente";
  const perfilObjetivo = principal ? principal.recomendacionHorizonte : null;
  const pasos = [];
  if (planObjetivos.capacidadMensual == null) pasos.push("Introduce ingresos, gastos y cuotas de deuda para calcular tu capacidad mensual real.");else if (planObjetivos.capacidadMensual <= 0) pasos.push(`Tu capacidad mensual actual es ${euros(planObjetivos.capacidadMensual)}. Prioriza estabilizar el presupuesto antes de aumentar compromisos.`);
  if (fondo.objetivo != null && fondo.falta > 0) pasos.push(`Refuerza el fondo de emergencia: la referencia de 6 meses es ${euros(fondo.objetivo)} y actualmente faltan ${euros(fondo.falta)}.`);
  if (deudaActiva.length > 0) pasos.push(`Revisa tus deudas: tienes ${euros(planObjetivos.cuotasDeuda)}/mes en cuotas y ${euros(deudaActiva.reduce((s, d) => s + Number(d.pendiente || 0), 0))} pendientes.`);
  if (principal) pasos.push(`Prioriza “${principal.nombre || OBJETIVOS_DEF.find(x => x.id === principal.tipo)?.label || "este objetivo"}”: requiere aproximadamente ${principal.aportacionNecesaria == null ? "un ritmo aún por calcular" : euros(principal.aportacionNecesaria) + "/mes"}.`);
  if (planObjetivos.conflictoObjetivos) pasos.push(`Tus objetivos requieren ${euros(planObjetivos.aportacionComprometida)}/mes y tu capacidad actual es ${euros(planObjetivos.capacidadParaObjetivos)}; existe un déficit conjunto de ${euros(planObjetivos.deficitMensual)}/mes.`);
  if (planObjetivos.ejecucion?.nivel === "pendiente" && datos.habito) pasos.push(planObjetivos.ejecucion.texto);
  if (puedeValorarInversion) pasos.push(`Con la base financiera cubierta, puedes valorar una estrategia de inversión de largo plazo coherente con tu perfil ${perfil}.`);
  if (!pasos.length) pasos.push("Mantén el seguimiento periódico y revisa la estrategia cuando cambien tus ingresos, gastos, deuda u objetivos.");
  const irASimulador = () => {
    if (!principal) return;
    onSeleccionarObjetivo && onSeleccionarObjetivo(principal.id);
    setSim({
      inicial: principal.importeReservadoAplicado ?? 0,
      mensual: principal.aportacionMensual ?? 0,
      tasa: info.rentabilidad,
      horizonte: principal.horizonteAniosCalculado ?? principal.plazoAnios ?? 0,
      objetivoId: principal.id
    });
    onGoToSimulador();
  };
  let contador = 1;
  const nSituacion = contador++;
  const nAyuda = contador++;
  const nObjetivoRiesgo = principal ? contador++ : null;
  const nBaseInvertir = contador++;
  const nSimulacion = principal ? contador++ : null;
  const nSiguientePaso = contador++;
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold readable-title"
  }, "Estrategia financiera"), /*#__PURE__*/React.createElement("p", {
    className: "readable-subtitle"
  }, "Orientación educativa construida con tu situación financiera, tus objetivos, su horizonte y tu perfil global.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nSituacion, " · Situación actual"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Capacidad mensual"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, planObjetivos.capacidadMensual == null ? "—" : euros(planObjetivos.capacidadMensual))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Fondo de emergencia"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, fondo.coberturaMeses == null ? "—" : fondo.coberturaMeses.toFixed(1) + " meses")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Deuda activa"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, deudaActiva.length ? euros(planObjetivos.cuotasDeuda) + "/mes" : "Sin deuda")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Ahorro actual"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: C.ink
    }
  }, euros(planObjetivos.ahorroActual))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-3 flex flex-col justify-between min-h-[92px] overflow-hidden",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold break-words",
    style: {
      color: C.muted
    }
  }, "Perfil global"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-sm sm:text-base font-bold mt-1 break-words",
    style: {
      color: info.color
    }
  }, perfil)))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nAyuda, " · Qué puede ayudarte ahora"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 mt-3"
  }, planObjetivos.capacidadMensual == null && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.mejLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Nos falta información."), " Añade tus ingresos, gastos y deudas para calcular cuánto te queda libre cada mes."), planObjetivos.capacidadMensual != null && planObjetivos.capacidadMensual <= 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.critLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Ahora mismo gastas más de lo que ingresas."), " Tu margen mensual es ", euros(planObjetivos.capacidadMensual), ". Antes de ahorrar o invertir, ajusta gastos o ingresos."), fondo.objetivo != null && fondo.falta > 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.mejLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Refuerza tu colchón de emergencia."), " Te faltan ", euros(fondo.falta), " para cubrir 6 meses de gastos esenciales. Es tu prioridad antes de invertir."), deudaActiva.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.critLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Reduce tus deudas."), " Pagas ", euros(planObjetivos.cuotasDeuda), "/mes en cuotas. Eliminarlas antes te dejará más dinero libre para tus objetivos."), principal && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Objetivo prioritario: ", principal.nombre || "Objetivo"), /*#__PURE__*/React.createElement("div", {
    className: "mt-1"
  }, "Te faltan ", principal.importeRestante == null ? "por definir" : euros(principal.importeRestante), ". Necesitas aportar ", principal.aportacionNecesaria == null ? "por definir" : euros(principal.aportacionNecesaria) + "/mes", ", y ahora mismo tienes ", planObjetivos.capacidadParaObjetivos == null ? "por definir" : euros(planObjetivos.capacidadParaObjetivos) + "/mes", " disponibles."), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 font-bold"
  }, "Estado: ", estadoLabel, ".")), planObjetivos.conflictoObjetivos && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.critLight,
      color: C.crit
    }
  }, /*#__PURE__*/React.createElement("b", null, "Tus objetivos piden más de lo que puedes aportar."), " En conjunto necesitas ", euros(planObjetivos.aportacionComprometida), "/mes, pero solo tienes ", euros(planObjetivos.capacidadParaObjetivos), "/mes disponibles (te faltan ", euros(planObjetivos.deficitMensual), "/mes). Usa el orden de prioridad que has marcado para decidir cuál cubrir primero."), planObjetivos.ejecucion && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: "rgba(14,165,233,0.06)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Consejo:"), " automatiza tu aportación mensual y revisa el plan cada pocos meses; así es más fácil mantenerlo."))), principal && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nObjetivoRiesgo, " · Tu objetivo y el riesgo que encaja con él"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, principal.nombre || "Objetivo principal"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "Horizonte: ", principal.horizonteAniosCalculado > 0 ? principal.horizonteAniosCalculado.toFixed(1) + " años" : "por definir", ". Orientación: ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, principal.recomendacionHorizonte.titulo), "."), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-2",
    style: {
      color: C.muted
    }
  }, principal.recomendacionHorizonte.texto), perfilObjetivo && perfilObjetivo.modo !== "invertir" && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: C.mejLight,
      color: C.ink
    }
  }, "Tu perfil global es ", perfil.toLowerCase(), ", pero el horizonte de este objetivo exige un tratamiento más prudente para el dinero destinado a él.")), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nBaseInvertir, " · Tu base antes de invertir"), puedeValorarInversion ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "La base financiera está cubierta: fondo de emergencia suficiente, sin deuda pendiente y con capacidad mensual positiva. Puedes valorar, de forma educativa, una estrategia de largo plazo coherente con tu perfil.") : /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "La inversión a largo plazo no debe desplazar las prioridades anteriores. ", fondo.falta > 0 ? "Primero completa el colchón de emergencia. " : "", deudaActiva.length > 0 ? "Además existe deuda pendiente. " : "", principal && principal.horizonteAniosCalculado != null && principal.horizonteAniosCalculado < 5 ? "Tienes un objetivo cercano que requiere especial prudencia. " : ""), ASIGNACION[perfil] && /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold mb-3",
    style: {
      color: C.ink
    }
  }, "Asignación orientativa de activos · ", perfil), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-center gap-5"
  }, /*#__PURE__*/React.createElement(SimpleDonut, {
    data: ACTIVOS_DEF.filter(a => (ASIGNACION[perfil][a.key] || 0) > 0).map(a => ({
      name: a.label,
      value: ASIGNACION[perfil][a.key],
      color: a.color
    })),
    size: 168,
    thickness: 24
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-1.5 w-full"
  }, ACTIVOS_DEF.filter(a => (ASIGNACION[perfil][a.key] || 0) > 0).map(a => /*#__PURE__*/React.createElement("div", {
    key: a.key,
    className: "flex items-center gap-1.5 text-[11px]",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full shrink-0",
    style: {
      backgroundColor: a.color
    }
  }), a.label, ": ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, ASIGNACION[perfil][a.key], "%"))))), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-3 readable-note"
  }, "Distribución orientativa y educativa asociada a tu perfil ", perfil.toLowerCase(), ". No constituye una recomendación de inversión personalizada."))), principal && /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nSimulacion, " · Simulación del objetivo"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "Lleva el objetivo al simulador para comparar aportación necesaria y aportación simulada. Los cambios del simulador no modifican el objetivo guardado."), /*#__PURE__*/React.createElement("button", {
    onClick: irASimulador,
    className: "inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Simular ", principal.nombre || "este objetivo", " ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 15
  }))), /*#__PURE__*/React.createElement(Card, {
    className: "p-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, nSiguientePaso, " · Tu siguiente paso"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5 mt-3"
  }, pasos.slice(0, 5).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "flex items-start gap-3 rounded-xl p-3",
    style: {
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", {
    className: "text-sm",
    style: {
      color: C.ink
    }
  }, p))))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl px-4 py-3 text-xs flex items-start gap-2",
    style: {
      backgroundColor: "rgba(79,70,229,0.07)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement(I.info, {
    size: 14,
    className: "mt-0.5 shrink-0"
  }), "Contenido educativo. El perfil global y la adecuación de cada objetivo son conceptos distintos. Las hipótesis del simulador no garantizan resultados ni constituyen recomendaciones de productos concretos."));
}
function crearIdObjetivo() {
  return "obj_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
function normalizarObjetivo(o = {}, index = 0) {
  const tipo = o.tipo || null;
  const nombre = typeof o.nombre === "string" ? o.nombre.trim() : "";
  const importeRaw = o.importe ?? o.importeObjetivo;
  const reservadoRaw = o.importeReservado ?? o.reservado ?? o.yaReservado;
  const plazoRaw = o.plazoAnios ?? o.plazo;
  const fechaRaw = o.fechaObjetivo ?? o.fecha;
  const importe = importeRaw == null || importeRaw === "" ? null : Math.max(0, Number(importeRaw) || 0);
  const reservado = reservadoRaw == null || reservadoRaw === "" ? null : Math.max(0, Number(reservadoRaw) || 0);
  const plazo = plazoRaw == null || plazoRaw === "" ? null : Math.max(0, Number(plazoRaw) || 0);
  const fecha = typeof fechaRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaRaw) ? fechaRaw : null;
  const prioridad = PRIORIDADES_OBJETIVO.includes(o.prioridad) ? o.prioridad : null;
  const aportacionMensual = o.aportacionMensual == null || o.aportacionMensual === "" ? null : Math.max(0, Number(o.aportacionMensual) || 0);
  return {
    ...o,
    id: o.id || crearIdObjetivo(),
    tipo,
    nombre,
    importeObjetivo: importe,
    importeReservado: reservado,
    plazoAnios: plazo,
    fechaObjetivo: fecha,
    prioridad,
    aportacionMensual
  };
}
function normalizarObjetivos(datos = {}) {
  if (Array.isArray(datos.objetivos) && datos.objetivos.length) return datos.objetivos.map((o, i) => normalizarObjetivo(o, i));
  if (datos.objetivo) {
    const legacy = datos.objetivo;
    const tieneDatos = !!(legacy.tipo || legacy.nombre || Number(legacy.importe) > 0 || Number(legacy.importeObjetivo) > 0 || Number(legacy.importeReservado) > 0 || Number(legacy.aportacionMensual) > 0 || Number(legacy.plazoAnios) > 0 || legacy.fechaObjetivo);
    if (tieneDatos) return [normalizarObjetivo(legacy, 0)];
  }
  return [];
}
function calcularCapacidadFinanciera(datos = {}) {
  const totalIngresos = (Number(datos.ingresos) || 0) + (Number(datos.otrosIngresos) || 0);
  const gastosFijos = totalMensual(datos.gastosFijos || {});
  const gastosDiscrecionales = totalMensual(datos.gastosDiscrecionales || {});
  const cuotasDeuda = (datos.deudas || []).reduce((s, d) => s + Math.max(0, Number(d.cuota) || 0), 0);
  const tieneIngresos = totalIngresos > 0;
  const capacidadBruta = tieneIngresos ? totalIngresos - gastosFijos - gastosDiscrecionales - cuotasDeuda : null;
  return {
    ingresos: totalIngresos,
    gastosFijos,
    gastosDiscrecionales,
    cuotasDeuda,
    gastosTotales: tieneIngresos ? gastosFijos + gastosDiscrecionales + cuotasDeuda : null,
    capacidadMensual: capacidadBruta,
    capacidadParaObjetivos: tieneIngresos ? Math.max(0, capacidadBruta) : null
  };
}
function obtenerHorizonteAnios(o = {}) {
  if (o.fechaObjetivo) {
    const hoy = new Date();
    const fecha = new Date(o.fechaObjetivo + "T23:59:59");
    if (!isNaN(fecha.getTime())) return Math.max(0, (fecha - hoy) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return o.plazoAnios == null ? null : Math.max(0, Number(o.plazoAnios) || 0);
}
function objetivoHorizonte(plazo) {
  if (plazo == null || Number(plazo) <= 0) return "sin definir";
  return Number(plazo) < 3 ? "corto" : Number(plazo) < 5 ? "medio-corto" : Number(plazo) <= 10 ? "medio" : "largo";
}
function recomendacionObjetivoPorHorizonte(plazo) {
  const anios = plazo == null ? null : Number(plazo);
  if (anios != null && anios > 0 && anios < 3) return {
    modo: "ahorrar",
    titulo: "Prioriza el ahorro",
    texto: "Por el plazo corto, este dinero necesita estabilidad y disponibilidad. No conviene depender de las fluctuaciones del mercado para una meta cercana."
  };
  if (anios != null && anios >= 3 && anios < 5) return {
    modo: "prudencia",
    titulo: "Ahorrar con prudencia",
    texto: "El plazo todavía deja poco margen ante una caída del mercado. Prioriza estabilidad y liquidez; cualquier inversión debería ser compatible con la fecha en la que necesitarás el dinero."
  };
  if (anios != null && anios >= 5) return {
    modo: "invertir",
    titulo: "Puedes valorar invertir",
    texto: "El horizonte ofrece más margen para asumir fluctuaciones. Puede tener sentido valorar una estrategia diversificada y coherente con tu perfil y con la necesidad de liquidez del objetivo."
  };
  return {
    modo: "pendiente",
    titulo: "Indica cuándo necesitarás el dinero",
    texto: "Cuando indiques cuándo necesitarás el dinero, la herramienta orientará automáticamente sobre si priorizar ahorro o valorar inversión."
  };
}
function objetivoCalculado(o = {}) {
  const importe = o.importeObjetivo == null ? null : Math.max(0, Number(o.importeObjetivo) || 0);
  const reservado = o.importeReservado == null ? null : Math.max(0, Number(o.importeReservado) || 0);
  const reservadoAplicado = importe == null ? 0 : Math.min(importe, reservado == null ? 0 : reservado);
  const restante = importe == null ? null : Math.max(0, importe - reservadoAplicado);
  const plazoDirecto = o.plazoAnios == null ? null : Math.max(0, Number(o.plazoAnios) || 0);
  const plazo = obtenerHorizonteAnios(o);
  const meses = plazo != null && plazo > 0 ? plazo * 12 : null;
  const mensualNecesaria = restante == null ? null : restante <= 0 ? 0 : meses > 0 ? restante / meses : null;
  const aportacion = o.aportacionMensual == null ? null : Math.max(0, Number(o.aportacionMensual) || 0);
  const diferenciaAportacion = mensualNecesaria == null || aportacion == null ? null : aportacion - mensualNecesaria;
  return {
    ...o,
    importeObjetivo: importe,
    importeReservado: reservado,
    importeReservadoAplicado: reservadoAplicado,
    importeRestante: restante,
    horizonteAniosCalculado: plazo,
    horizonteCategoria: objetivoHorizonte(plazo),
    recomendacionHorizonte: recomendacionObjetivoPorHorizonte(plazo),
    mesesRestantes: meses,
    aportacionNecesaria: mensualNecesaria,
    aportacionMensual: aportacion,
    diferenciaAportacion,
    cubierto: importe != null && importe > 0 && restante <= 0,
    progreso: importe != null && importe > 0 ? Math.min(100, Math.max(0, reservadoAplicado / importe * 100)) : 0
  };
}
function calcularFondoEmergencia(datos = {}) {
  const base = calcularCapacidadFinanciera(datos);
  if (base.capacidadMensual == null) return {
    mesesObjetivo: 6,
    objetivo: null,
    gastosEsenciales: null,
    coberturaMeses: null,
    falta: null
  };
  const gastosEsenciales = base.gastosFijos + base.cuotasDeuda;
  const objetivo = Math.max(0, gastosEsenciales * 6);
  const ahorro = datos.ahorroActual == null ? null : Math.max(0, Number(datos.ahorroActual) || 0);
  const cobertura = gastosEsenciales > 0 && ahorro != null ? ahorro / gastosEsenciales : gastosEsenciales === 0 && ahorro != null ? 6 : null;
  return {
    mesesObjetivo: 6,
    objetivo,
    gastosEsenciales,
    coberturaMeses: cobertura,
    falta: ahorro == null ? null : Math.max(0, objetivo - ahorro)
  };
}
function calcularPlanObjetivos(datos = {}) {
  const base = calcularCapacidadFinanciera(datos);
  const objetivosBase = normalizarObjetivos(datos).map(objetivoCalculado);
  const capacidad = base.capacidadParaObjetivos;
  const aportacionComprometida = objetivosBase.reduce((s, o) => s + (o.aportacionMensual == null ? 0 : o.aportacionMensual), 0);
  const aportacionNecesariaTotal = objetivosBase.reduce((s, o) => s + (o.aportacionNecesaria == null ? 0 : o.aportacionNecesaria), 0);
  const deficitCapacidad = capacidad == null ? null : Math.max(0, aportacionComprometida - capacidad);
  const deficitNecesidad = capacidad == null ? null : Math.max(0, aportacionNecesariaTotal - capacidad);
  const deficitRitmoElegido = capacidad == null ? null : Math.max(0, aportacionNecesariaTotal - aportacionComprometida);
  const margenTrasAportaciones = capacidad == null ? null : capacidad - aportacionComprometida;
  const fondo = calcularFondoEmergencia(datos);
  const ahorroActual = datos.ahorroActual == null ? null : Math.max(0, Number(datos.ahorroActual) || 0);
  const reservadoCorto = objetivosBase.filter(o => o.horizonteCategoria === "corto" || o.horizonteCategoria === "medio-corto").reduce((s, o) => s + (o.importeReservadoAplicado || 0), 0);
  const capitalRealmenteInvertible = fondo.objetivo != null && ahorroActual != null ? Math.max(0, ahorroActual - fondo.objetivo - reservadoCorto) : null;
  const prioridadSinDefinir = objetivosBase.some(o => !o.prioridad);
  const ordenPrioridad = {
    alta: 0,
    media: 1,
    baja: 2
  };
  const orden = [...objetivosBase].sort((a, b) => {
    const pa = a.prioridad ? ordenPrioridad[a.prioridad] : 99,
      pb = b.prioridad ? ordenPrioridad[b.prioridad] : 99;
    return pa - pb || (a.horizonteAniosCalculado ?? Infinity) - (b.horizonteAniosCalculado ?? Infinity) || (b.importeRestante || 0) - (a.importeRestante || 0);
  });
  let capacidadRestante = capacidad;
  const objetivos = orden.map((o, index) => {
    const capacidadAntes = capacidadRestante;
    const elegido = o.aportacionMensual;
    const esfuerzoReferencia = elegido != null ? elegido : o.aportacionNecesaria != null ? o.aportacionNecesaria : 0;
    const capacidadAsignada = capacidad == null ? null : Math.min(capacidadAntes, Math.max(0, esfuerzoReferencia));
    if (capacidadRestante != null && elegido != null) capacidadRestante = Math.max(0, capacidadRestante - elegido);
    const datosCompletos = o.importeObjetivo != null && o.horizonteAniosCalculado != null && o.horizonteAniosCalculado > 0;
    let estado = "pendiente";
    if (o.cubierto) estado = "completado";else if (datosCompletos && capacidad != null) {
      const esfuerzoElegido = elegido != null ? elegido : o.aportacionNecesaria;
      const superaCapacidad = elegido != null && elegido > capacidadAntes;
      const ritmoInsuficiente = o.aportacionNecesaria != null && o.aportacionNecesaria > capacidadAntes;
      if (superaCapacidad || ritmoInsuficiente) estado = "no_viable";else if (elegido != null && o.aportacionNecesaria != null && elegido < o.aportacionNecesaria) estado = "ajustado";else if (capacidadAntes - esfuerzoElegido <= Math.max(25, capacidadAntes * 0.10)) estado = "ajustado";else estado = "viable";
    } else if (datosCompletos) estado = "pendiente_capacidad";
    const deficitAportacion = elegido != null && capacidad != null ? Math.max(0, elegido - capacidadAntes) : null;
    const deficitRitmo = o.aportacionNecesaria != null && capacidad != null ? Math.max(0, o.aportacionNecesaria - capacidadAntes) : null;
    return {
      ...o,
      orden: index + 1,
      capacidadAntes,
      capacidadAsignada,
      deficitAportacion,
      deficitRitmo,
      estadoViabilidad: estado
    };
  });
  const principal = orden.find(o => o.prioridad) || (objetivos.length === 1 ? objetivos[0] : null);
  const habit = datos.habito;
  const ejecucion = habit === "No tengo ni idea de a dónde va" ? {
    nivel: "pendiente",
    texto: "Mejora primero el control de tus gastos antes de comprometer una aportación elevada."
  } : habit === "Más o menos controlado, pero sin apuntar nada" ? {
    nivel: "intermedio",
    texto: "Una aportación automática y una revisión periódica pueden ayudarte a sostener el plan."
  } : habit === "Todo apuntado y bajo control" ? {
    nivel: "fuerte",
    texto: "Tu seguimiento facilita mantener las aportaciones y revisar el progreso."
  } : {
    nivel: "pendiente",
    texto: "Completa tus hábitos financieros para valorar mejor la capacidad de ejecución del plan."
  };
  const conflictoObjetivos = capacidad != null && aportacionComprometida > capacidad;
  return {
    ...base,
    ahorroActual,
    objetivos,
    ordenObjetivos: orden,
    aportacionComprometida,
    aportacionTotal: aportacionComprometida,
    aportacionNecesariaTotal,
    deficitMensual: deficitCapacidad,
    deficitNecesidad,
    deficitRitmoElegido,
    margenTrasAportaciones,
    principal,
    prioridadSinDefinir,
    fondoEmergenciaNecesario: fondo.objetivo,
    reservadoCorto,
    capitalRealmenteInvertible,
    capitalInvertibleCompleto: fondo.objetivo != null && ahorroActual != null,
    capacidadMensual: base.capacidadMensual,
    capacidadParaObjetivos: capacidad,
    ejecucion,
    conflictoObjetivos,
    objetivosOrdenados: orden.map(o => o.id)
  };
}
function objetivoLegadoDesdeColeccion(objetivos = []) {
  const o = objetivos[0];
  return o ? {
    tipo: o.tipo || null,
    nombre: o.nombre || "",
    importe: o.importeObjetivo,
    plazoAnios: o.plazoAnios,
    fechaObjetivo: o.fechaObjetivo || null,
    importeReservado: o.importeReservado,
    prioridad: o.prioridad || null,
    aportacionMensual: o.aportacionMensual,
    objetivos: objetivos
  } : {
    tipo: null,
    nombre: "",
    importe: null,
    plazoAnios: null,
    fechaObjetivo: null,
    importeReservado: null,
    prioridad: null,
    aportacionMensual: null,
    objetivos: []
  };
}
function sincronizarObjetivos(datos, objetivos) {
  return {
    ...datos,
    objetivos,
    objetivo: objetivoLegadoDesdeColeccion(objetivos)
  };
}
const datosVacios = () => ({
  ingresos: 0,
  otrosIngresos: 0,
  gastosFijos: emptyCampo(GASTOS_FIJOS_DEF),
  gastosDiscrecionales: emptyCampo(GASTOS_DISC_DEF),
  deudas: DEUDAS_DEF.map(d => ({
    ...d
  })),
  ahorroActual: 0,
  habito: null,
  objetivo: {
    tipo: null,
    nombre: "",
    importe: null,
    plazoAnios: null,
    fechaObjetivo: null,
    importeReservado: null,
    aportacionMensual: null,
    prioridad: null,
    objetivos: []
  },
  objetivos: []
});
function PoderAdquisitivoSection() {
  const [anios, setAnios] = useState(10);
  const [aporte, setAporte] = useState(1000);
  const inflacion = 2.5;
  const rentabilidad = 8;
  const valorInflacion = aporte / Math.pow(1 + inflacion / 100, anios);
  const valorCompuesto = aporte * Math.pow(1 + rentabilidad / 100, anios);
  const max = valorCompuesto;
  const serie = Array.from({
    length: anios + 1
  }, (_, i) => ({
    y: i,
    infl: aporte / Math.pow(1 + inflacion / 100, i),
    comp: aporte * Math.pow(1 + rentabilidad / 100, i)
  }));
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7 overflow-hidden",
    style: {
      borderColor: C.sand + "66",
      boxShadow: "0 20px 60px -35px rgba(79,70,229,.45)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Un minuto que puede cambiar tu perspectiva"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-xl sm:text-2xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "¿Qué pasa con 1.000 € si no haces nada?")), /*#__PURE__*/React.createElement("div", {
    className: "hidden sm:flex w-10 h-10 rounded-xl items-center justify-center",
    style: {
      backgroundColor: "rgba(79,70,229,.14)"
    }
  }, /*#__PURE__*/React.createElement(I.chartLine, {
    size: 19,
    color: C.sand
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 leading-relaxed",
    style: {
      color: C.muted
    }
  }, "La inflación reduce el poder de compra. La capitalización, en cambio, puede hacer crecer un capital con el tiempo. No es una promesa de rentabilidad: es una demostración sencilla del efecto matemático."), /*#__PURE__*/React.createElement("div", {
    className: "grid sm:grid-cols-2 gap-4 mt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 border",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Si la inflación fuese ", inflacion, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.mej
    }
  }, "Poder de compra")), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-2xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, euros(valorInflacion)), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full mt-3 overflow-hidden",
    style: {
      backgroundColor: C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: `${Math.max(8, valorInflacion / aporte * 100)}%`,
      backgroundColor: C.mej
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-2",
    style: {
      color: C.muted
    }
  }, "Lo que hoy compras con ", euros(aporte), " requeriría más dinero en el futuro.")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 border",
    style: {
      borderColor: "rgba(79,70,229,.18)",
      backgroundColor: "rgba(79,70,229,.035)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Si creciera al ", rentabilidad, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.exc
    }
  }, "Capital")), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-2xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, euros(valorCompuesto)), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full mt-3 overflow-hidden",
    style: {
      backgroundColor: C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full",
    style: {
      width: `${Math.min(100, valorCompuesto / max * 100)}%`,
      backgroundColor: C.exc
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-2",
    style: {
      color: C.muted
    }
  }, "Aquí solo mostramos el efecto del interés compuesto; los mercados reales fluctúan."))), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 rounded-xl p-4",
    style: {
      backgroundColor: "rgba(6,10,19,.035)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: {
      color: C.ink
    }
  }, "Horizonte: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.sand
    }
  }, anios, " años")), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "Capital inicial: ", euros(aporte))), /*#__PURE__*/React.createElement("input", {
    "aria-label": "Horizonte temporal",
    type: "range",
    min: "1",
    max: "30",
    value: anios,
    onChange: e => setAnios(+e.target.value),
    className: "w-full mt-3 accent-current",
    style: {
      color: C.sand
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 h-28 relative border-l border-b",
    style: {
      borderColor: C.border
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 600 120",
    preserveAspectRatio: "none",
    className: "absolute inset-0 w-full h-full"
  }, /*#__PURE__*/React.createElement("polyline", {
    fill: "none",
    stroke: C.mej,
    strokeWidth: "3",
    points: serie.map((p, i) => `${i * (600 / Math.max(1, anios))},${120 - p.infl / aporte * 100}`).join(" ")
  }), /*#__PURE__*/React.createElement("polyline", {
    fill: "none",
    stroke: C.exc,
    strokeWidth: "3",
    points: serie.map((p, i) => `${i * (600 / Math.max(1, anios))},${120 - Math.min(100, p.comp / max * 100)}`).join(" ")
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 mt-3 text-[11px] font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("i", {
    className: "w-2 h-2 rounded-full",
    style: {
      backgroundColor: C.mej
    }
  }), " Poder de compra"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("i", {
    className: "w-2 h-2 rounded-full",
    style: {
      backgroundColor: C.exc
    }
  }), " Interés compuesto"))));
}
function HowItWorksSection() {
  const steps = [["01", "Tu radiografía", "Diagnóstico interactivo", "Entenderás ingresos, gastos, ahorro, colchón y deuda sin enfrentarte a un formulario interminable.", I.chartLine], ["02", "Tu perfil", "Test adaptativo", "Tus respuestas se adaptan a ti y conectan el riesgo con tus objetivos y horizonte.", I.target], ["03", "Tu mapa", "Estrategia y simuladores", "Convertirás los datos en decisiones: objetivos, escenarios y acciones que puedas ejecutar.", I.compass]];
  return /*#__PURE__*/React.createElement("section", {
    className: "mt-16 sm:mt-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-7"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Qué vas a conseguir"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "De entender tu dinero a saber qué hacer con él."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "El objetivo no es darte una puntuación y dejarte solo. Es ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, "educarte, darte contexto y convertirlo en un plan accionable."))), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-4"
  }, steps.map(([n, k, t, desc, Icon], i) => /*#__PURE__*/React.createElement(Card, {
    key: n,
    className: "p-6 relative overflow-hidden",
    style: {
      borderColor: C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 right-0 font-serif text-7xl font-bold opacity-[.045]",
    style: {
      color: C.navy
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    className: "w-11 h-11 rounded-xl flex items-center justify-center",
    style: {
      backgroundColor: "rgba(79,70,229,.12)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 20,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold uppercase mt-5",
    style: {
      color: C.sand,
      letterSpacing: ".12em"
    }
  }, k), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed mt-2",
    style: {
      color: C.muted
    }
  }, desc)))));
}
function HeroSection({
  onStart
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const tarjetasCientificas = [{
    icon: I.wallet,
    titulo: "Comprar tranquilidad frente a los imprevistos",
    texto: "No llegar a fin de mes no solo te priva de comprar cosas; actúa como un amplificador del dolor psicológico. Analizando medio millón de encuestas, se demostró que la escasez financiera multiplica la angustia ante cualquier desgracia cotidiana (una enfermedad, una avería, un mal día). Los datos confirman que cuando tus ahorros caen por debajo de tu umbral de seguridad, tu sufrimiento emocional se dispara drásticamente. Recupera tu margen mensual: no es solo sumar euros, es construir un escudo contra la angustia.",
    fuente: "FUENTE: Universidad de Princeton (Premio Nobel Daniel Kahneman y Angus Deaton) y Wharton School de la Univ. de Pensilvania (Matthew Killingsworth)."
  }, {
    icon: I.shieldCheck,
    titulo: "Blindar a tu familia y ganar tiempo de vida",
    texto: "El desorden financiero destruye hogares. Las investigaciones concluyeron que las discusiones por dinero son el predictor número uno de divorcio, superando incluso a la infidelidad. Por el contrario, se demuestra que las familias que organizan sus finanzas conjuntas adquieren una resiliencia que les permite tomar decisiones vitales menos desesperadas, como reducir jornadas o cambiar a trabajos que permitan una conciliación real. Toma el control de tus ingresos y gastos: el orden financiero es la base de la estabilidad familiar.",
    fuente: "FUENTE: Universidad Estatal de Utah (Dr. Jeffrey Dew) y estudios de Bienestar Financiero de la OCDE."
  }, {
    icon: I.rocket,
    titulo: "Frenar en seco el estrés crónico",
    texto: "La deuda no es solo un problema del banco, es una amenaza que tu cuerpo procesa como un peligro físico. Año tras año, se sitúa a las deudas como la fuente número uno de estrés crónico en adultos. Los investigadores descubrieron que el sobreendeudamiento eleva la presión arterial diastólica, dispara los síntomas depresivos y provoca ataques de ansiedad. Traza un plan exacto para liquidar tus deudas, frena el deterioro de tu salud y acelera hacia tu libertad.",
    fuente: "FUENTE: Asociación Americana de Psicología (APA, informe Stress in America), Universidad de Northwestern y Universidad de Nottingham."
  }, {
    icon: I.chartLine,
    titulo: "El coste de esperar (Multiplicar tu patrimonio)",
    texto: "Esperar a \"cobrar más\" para empezar a organizarte e invertir es la trampa financiera más cara. La evidencia demuestra que quienes empiezan a apartar dinero en sus primeros 5 a 10 años de carrera laboral acumulan entre 3 y 4 veces más patrimonio neto al llegar a la madurez que quienes esperan a los 35 o 40 años, aunque estos últimos ganen más dinero. Retrasar el ahorro una década obliga a triplicar el esfuerzo mensual de por vida para comprar una casa o asegurar tu futuro. Pon el tiempo a tu favor: cada año que ganas ahora te ahorrará una década de esfuerzo después.",
    fuente: "FUENTE: Universidad de Stanford y Wharton School (Dra. Annamaria Lusardi y Dra. Olivia Mitchell, NBER)."
  }, {
    icon: I.target,
    titulo: "Vencer tu cerebro y ahorrar sin sufrir",
    texto: "Ahorrar para una casa o para tu nivel de vida futuro no tiene por qué hundir tu calidad de vida actual. Nuestro cerebro sufre de \"sesgo del presente\" y prefiere gastar hoy, pero la ciencia económica encontró la solución: automatizar que una parte de tus futuras subidas de sueldo o dinero extra vaya directamente al ahorro antes de que te acostumbres a gastarlo. Este método demostró multiplicar la tasa de ahorro de un 3,5% a un altísimo 13,6% en menos de 4 años, sin que los participantes sintieran ninguna pérdida en su día a día. Sistematiza tus finanzas: multiplica tu capital sin sentir que te sacrificas.",
    fuente: "FUENTE: Universidad de Chicago (Premio Nobel Richard Thaler y Shlomo Benartzi)."
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "relative pt-0 pb-14 sm:pb-20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 pointer-events-none",
    style: {
      background: "radial-gradient(70% 55% at 50% 0%, rgba(79,70,229,.09), transparent 72%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-[1fr_.9fr] gap-10 lg:gap-14 items-start lg:items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-4",
    style: {
      color: C.sand,
      letterSpacing: ".16em"
    }
  }, "Pon orden en tu dinero"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02]",
    style: {
      color: C.ink
    }
  }, "Tu salud financiera puesta a prueba: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.sand
    }
  }, "¿sientes que el dinero se te escapa y no sabes por qué?")), /*#__PURE__*/React.createElement("p", {
    className: "text-base sm:text-lg mt-6 max-w-xl leading-relaxed",
    style: {
      color: C.muted
    }
  }, "No llegar a fin de mes, no saber en qué se va el sueldo o sentir que la deuda nunca baja es más común de lo que parece. Aquí puedes ver tu situación con claridad y recibir un plan sencillo para empezar a ordenarla, sin tecnicismos y sin que nadie te juzgue."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-4 mt-8"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onStart,
    className: "inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.03]",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Ver mi situación financiera ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => document.getElementById("evidencia")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    }),
    className: "inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-colors hover:bg-black/5",
    style: {
      color: C.ink,
      border: "1.5px solid rgba(79,70,229,.35)"
    }
  }, "Por qué importa la salud financiera")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 mt-5 text-xs",
    style: {
      color: C.mutedLight
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(I.checkCircle, {
    size: 14,
    color: C.salu
  }), " Sin registro, gratis y en minutos"), /*#__PURE__*/React.createElement("span", {
    className: "inline-flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement(I.chartLine, {
    size: 14,
    color: C.exc
  }), " Resultados al momento"))), /*#__PURE__*/React.createElement(PoderAdquisitivoSection, null)), /*#__PURE__*/React.createElement(HowItWorksSection, null), /*#__PURE__*/React.createElement("div", {
    className: "mt-14 sm:mt-18"
  }, /*#__PURE__*/React.createElement(GastoHormigaSection, null)), /*#__PURE__*/React.createElement("section", {
    id: "evidencia",
    className: "mt-16 sm:mt-20 scroll-mt-24"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mx-auto text-center mb-8 sm:mb-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.sand,
      letterSpacing: ".16em"
    }
  }, "¿Por qué cuesta tanto ordenar el dinero? Esto dice la investigación"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, "No hace falta que leas esto para usar la herramienta — está aquí por si te ayuda entender por qué cuesta tanto y por qué merece la pena intentarlo.")), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-2 gap-5"
  }, tarjetasCientificas.map((t, i) => {
    const Icon = t.icon;
    return /*#__PURE__*/React.createElement(Card, {
      key: t.titulo,
      className: "p-5 sm:p-6 cursor-pointer transition-shadow" + (t.titulo === "Vencer tu cerebro y ahorrar sin sufrir" ? " md:col-span-2 md:max-w-2xl md:mx-auto w-full" : ""),
      style: {
        borderColor: C.border
      },
      onClick: () => setExpandedIndex(i)
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3.5 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
      style: {
        backgroundColor: "rgba(79,70,229,.12)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 20,
      color: C.sand
    })), /*#__PURE__*/React.createElement("h3", {
      className: "font-serif text-lg sm:text-xl font-bold",
      style: {
        color: C.ink
      }
    }, t.titulo)), /*#__PURE__*/React.createElement("div", {
      className: "shrink-0 mt-1",
      style: {
        color: C.sand
      }
    }, /*#__PURE__*/React.createElement(I.chevronDown, {
      size: 18,
      style: {
        transform: "rotate(-90deg)"
      }
    }))));
  }))), expandedIndex !== null && /*#__PURE__*/React.createElement(EvidenciaModal, {
    tarjeta: tarjetasCientificas[expandedIndex],
    onClose: () => setExpandedIndex(null)
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-16 sm:mt-20 rounded-3xl p-7 sm:p-10 text-center relative overflow-hidden",
    style: {
      background: "linear-gradient(135deg, #111827 0%, #1f2937 55%, #312e81 100%)",
      boxShadow: "0 24px 70px -35px rgba(49,46,129,.55)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute -top-24 -right-20 w-64 h-64 rounded-full pointer-events-none",
    style: {
      background: "radial-gradient(circle, rgba(79,70,229,.22), transparent 65%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 max-w-2xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.sand,
      letterSpacing: ".16em"
    }
  }, "Ahora te toca a ti"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.white
    }
  }, "Da el primer paso. No hace falta que lo tengas todo claro."), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded-2xl px-5 py-4 text-left",
    style: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(255,255,255,.25)",
      boxShadow: "0 10px 30px -22px rgba(0,0,0,.45)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "cta-final-copy text-sm leading-relaxed",
    style: {
      color: "#111827",
      fontWeight: 600
    }
  }, "Es gratis, no necesitas registrarte y puedes dejarlo cuando quieras. Solo tienes que responder con sinceridad; nosotros ordenamos el resto.")), /*#__PURE__*/React.createElement("button", {
    onClick: onStart,
    className: "mt-7 inline-flex items-center gap-2 px-7 py-4 rounded-xl text-sm font-bold transition-transform hover:scale-[1.03]",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Comenzar mi diagnóstico ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 17
  }))))));
}
function ConfianzaPrivacidad() {
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 -mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl px-4 py-3 flex items-start gap-3",
    style: {
      backgroundColor: "rgba(16,185,129,0.07)",
      border: "1px solid rgba(16,185,129,0.18)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
    style: {
      backgroundColor: "rgba(16,185,129,0.10)"
    }
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 17,
    color: C.salu
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-xs leading-relaxed",
    style: {
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Tus datos se guardan solo en tu dispositivo salvo que crees una cuenta."), /*#__PURE__*/React.createElement("div", {
    style: {
      color: C.muted
    }
  }, "Puedes completar el diagnóstico con tranquilidad: la información se mantiene local y solo se sincroniza con la nube si eliges crear una cuenta."))));
}
function PrivacyNotice() {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl px-4 py-3 text-xs",
    style: {
      backgroundColor: "rgba(16,185,129,0.07)",
      border: "1px solid rgba(16,185,129,0.18)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-2.5"
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 16,
    color: C.salu,
    className: "mt-0.5 shrink-0"
  }), /*#__PURE__*/React.createElement("div", {
    className: "leading-relaxed",
    style: {
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("p", null, "Al crear una cuenta, tus datos dejan de guardarse solo en este dispositivo (localStorage) y también se sincronizan de forma segura con nuestra base de datos en la nube (Supabase), para que puedas acceder desde cualquier dispositivo. No los compartimos con terceros ni los usamos con fines publicitarios."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    className: "inline-flex items-center gap-1 mt-2 font-bold",
    style: {
      color: C.salu
    }
  }, "Más información", /*#__PURE__*/React.createElement(I.chevronDown, {
    size: 12,
    style: {
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform .15s"
    }
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "mt-2",
    style: {
      color: C.muted
    }
  }, "Guardamos tus respuestas del diagnóstico, tu perfil de riesgo y tus objetivos para que puedas continuar donde lo dejaste y, si tienes cuenta, retomarlo desde otro dispositivo. Puedes eliminar tu cuenta y los datos asociados a ella cuando quieras desde los ajustes de tu perfil."))));
}
function GastosTabs({
  datos,
  setDatos
}) {
  const gastosFijos = totalMensual(datos.gastosFijos);
  const gastosDisc = totalMensual(datos.gastosDiscrecionales);
  return /*#__PURE__*/React.createElement("div", {
    className: "grid lg:grid-cols-2 gap-4",
    "data-seq-group": "gastos"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-2.5 flex items-center justify-between gap-2",
    style: {
      color: C.sand,
      letterSpacing: "0.06em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Gastos fijos / necesidades"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink,
      textTransform: "none",
      letterSpacing: "normal"
    }
  }, euros(gastosFijos), "/mes")), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-2.5"
  }, GASTOS_FIJOS_DEF.map(f => /*#__PURE__*/React.createElement(FreqField, {
    key: f.key,
    label: f.label,
    data: datos.gastosFijos[f.key],
    onChange: v => setDatos({
      ...datos,
      gastosFijos: {
        ...datos.gastosFijos,
        [f.key]: v
      }
    })
  })))), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-2.5 flex items-center justify-between gap-2",
    style: {
      color: C.sand,
      letterSpacing: "0.06em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Gastos discrecionales / deseos"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink,
      textTransform: "none",
      letterSpacing: "normal"
    }
  }, euros(gastosDisc), "/mes")), /*#__PURE__*/React.createElement("div", {
    className: "grid gap-2.5"
  }, GASTOS_DISC_DEF.map(f => /*#__PURE__*/React.createElement(FreqField, {
    key: f.key,
    label: f.label,
    data: datos.gastosDiscrecionales[f.key],
    onChange: v => setDatos({
      ...datos,
      gastosDiscrecionales: {
        ...datos.gastosDiscrecionales,
        [f.key]: v
      }
    })
  })))));
}
function ObjetivosFinancieros({
  datos,
  setDatos,
  objetivoSeleccionadoId,
  onEliminarSeleccionado
}) {
  const objetivos = normalizarObjetivos(datos);
  const [editando, setEditando] = useState(null);
  const [borrador, setBorrador] = useState(null);
  const plan = useMemo(() => calcularPlanObjetivos(datos), [datos]);
  const guardar = () => {
    if (!borrador) return;
    const limpio = normalizarObjetivo(borrador, objetivos.length);
    const arr = editando ? objetivos.map(o => o.id === editando ? limpio : o) : [...objetivos, limpio];
    setDatos(sincronizarObjetivos(datos, arr));
    setEditando(null);
    setBorrador(null);
  };
  const abrirNuevo = () => {
    setEditando(null);
    setBorrador({
      id: crearIdObjetivo(),
      tipo: null,
      nombre: "",
      importeObjetivo: null,
      importeReservado: null,
      plazoAnios: null,
      fechaObjetivo: null,
      prioridad: null,
      aportacionMensual: null
    });
  };
  const abrirEditar = o => {
    setEditando(o.id);
    setBorrador({
      ...o
    });
  };
  const eliminar = id => {
    const arr = objetivos.filter(o => o.id !== id);
    setDatos(sincronizarObjetivos(datos, arr));
    if (editando === id) {
      setEditando(null);
      setBorrador(null);
    }
    if (objetivoSeleccionadoId === id) onEliminarSeleccionado && onEliminarSeleccionado(id);
  };
  const inputNombre = (value, placeholder, onChange) => /*#__PURE__*/React.createElement("input", {
    value: value || "",
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  });
  const objetivoTitulo = o => o.nombre || OBJETIVOS_DEF.find(x => x.id === o.tipo)?.label || "Objetivo sin nombre";
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4 mb-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "05 · Objetivos"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "¿Qué quieres conseguir?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Tus objetivos conectan tu situación financiera actual con el plazo, la capacidad de ahorro y la estrategia posterior.")), /*#__PURE__*/React.createElement("button", {
    onClick: abrirNuevo,
    className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border",
    style: {
      borderColor: C.border,
      color: C.navy,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement(I.plus, {
    size: 14
  }), " Añadir objetivo")), objetivos.length === 0 && !borrador && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl border p-5",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold"
  }, "Todavía no has definido ningún objetivo."), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Empieza introduciendo qué quieres conseguir. No se ha creado ningún objetivo ni se han supuesto importes o plazos."), /*#__PURE__*/React.createElement("button", {
    onClick: abrirNuevo,
    className: "mt-4 px-4 py-2 rounded-lg text-xs font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Crear mi primer objetivo")), borrador && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 rounded-xl border p-4",
    style: {
      borderColor: C.sand,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mb-1",
    style: {
      color: C.ink
    }
  }, editando ? "Editar objetivo" : "Nuevo objetivo"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mb-4",
    style: {
      color: C.muted
    }
  }, "Las categorías solo sirven para clasificarlo. No rellenan automáticamente los datos del objetivo."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4"
  }, OBJETIVOS_DEF.map(o => {
    const active = borrador.tipo === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => setBorrador({
        ...borrador,
        tipo: o.id
      }),
      className: "flex flex-col items-center gap-1 p-2 rounded-lg border text-center",
      style: {
        borderColor: active ? C.sand : C.border,
        backgroundColor: active ? C.sandLight : C.paper
      }
    }, /*#__PURE__*/React.createElement(o.icon, {
      size: 17,
      color: active ? C.navy : C.muted
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold",
      style: {
        color: C.ink
      }
    }, o.label));
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "Nombre del objetivo"), inputNombre(borrador.nombre, "Ej. Entrada de vivienda", v => setBorrador({
    ...borrador,
    nombre: v
  }))), /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto dinero necesitas?",
    value: borrador.importeObjetivo,
    onChange: v => setBorrador({
      ...borrador,
      importeObjetivo: v || null
    })
  }), /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto tienes ya reservado?",
    value: borrador.importeReservado,
    onChange: v => setBorrador({
      ...borrador,
      importeReservado: v || null
    })
  }), /*#__PURE__*/React.createElement(NumberField, {
    label: "¿En cuánto tiempo quieres conseguirlo?",
    suffix: "años",
    value: borrador.plazoAnios,
    onChange: v => setBorrador({
      ...borrador,
      plazoAnios: v || null
    })
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "O fecha objetivo"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: borrador.fechaObjetivo || "",
    onChange: e => setBorrador({
      ...borrador,
      fechaObjetivo: e.target.value || null
    }),
    className: "w-full rounded-lg px-3 py-2 text-sm font-bold border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-1",
    style: {
      color: C.muted
    }
  }, "Puedes indicar años o una fecha concreta.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "Prioridad"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, PRIORIDADES_OBJETIVO.map(pr => /*#__PURE__*/React.createElement("button", {
    key: pr,
    onClick: () => setBorrador({
      ...borrador,
      prioridad: pr
    }),
    className: "px-2 py-2 rounded-lg border text-xs font-bold",
    style: {
      borderColor: borrador.prioridad === pr ? C.sand : C.border,
      backgroundColor: borrador.prioridad === pr ? C.sandLight : C.paper,
      color: C.ink
    }
  }, PRIORIDAD_LABEL[pr]))), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] mt-1",
    style: {
      color: C.muted
    }
  }, "Necesaria para decidir preferencias cuando varios objetivos compiten por la misma capacidad.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(NumberField, {
    label: "¿Cuánto quieres aportar cada mes?",
    value: borrador.aportacionMensual,
    onChange: v => setBorrador({
      ...borrador,
      aportacionMensual: v == null ? null : v
    }),
    hint: "Opcional: si lo dejas vacío, solo calcularemos cuánto necesitarías aportar."
  }), plan.capacidadParaObjetivos > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold mb-1",
    style: {
      color: C.muted
    }
  }, "O destina un % de tu ahorro mensual (", euros(plan.capacidadParaObjetivos), "/mes)"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-4 gap-1.5"
  }, [25, 50, 75, 100].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    type: "button",
    onClick: () => setBorrador({
      ...borrador,
      aportacionMensual: Math.round(plan.capacidadParaObjetivos * p / 100)
    }),
    className: "px-2 py-1.5 rounded-lg border text-xs font-bold",
    style: {
      borderColor: Number(borrador.aportacionMensual) === Math.round(plan.capacidadParaObjetivos * p / 100) ? C.sand : C.border,
      backgroundColor: Number(borrador.aportacionMensual) === Math.round(plan.capacidadParaObjetivos * p / 100) ? C.sandLight : C.paper,
      color: C.ink
    }
  }, p, "%")))))), borrador.plazoAnios > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: recomendacionObjetivoPorHorizonte(borrador.plazoAnios).modo === "invertir" ? C.saluLight : C.sandLight,
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, recomendacionObjetivoPorHorizonte(borrador.plazoAnios).titulo, "."), " ", recomendacionObjetivoPorHorizonte(borrador.plazoAnios).texto), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: guardar,
    className: "px-4 py-2 rounded-lg text-xs font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Guardar objetivo"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setBorrador(null);
      setEditando(null);
    },
    className: "px-4 py-2 rounded-lg text-xs font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink
    }
  }, "Cancelar"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 mt-4"
  }, plan.objetivos.map(o => {
    const faltaDatos = [];
    if (!o.nombre && !o.tipo) faltaDatos.push("nombre o categoría");
    if (o.importeObjetivo == null) faltaDatos.push("importe");
    if (o.importeReservado == null) faltaDatos.push("ahorro reservado");
    if (o.plazoAnios == null || o.plazoAnios <= 0) faltaDatos.push("plazo");
    if (o.prioridad == null) faltaDatos.push("prioridad");
    const deficitObjetivo = o.aportacionMensual != null && plan.capacidadParaObjetivos != null ? Math.max(0, o.aportacionMensual - plan.capacidadParaObjetivos) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: o.id,
      className: "rounded-xl border p-4",
      style: {
        borderColor: C.border,
        backgroundColor: C.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    }, /*#__PURE__*/React.createElement("b", {
      className: "text-sm",
      style: {
        color: C.ink
      }
    }, objetivoTitulo(o)), o.prioridad ? /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
      style: {
        backgroundColor: C.sandLight,
        color: C.navy
      }
    }, PRIORIDAD_LABEL[o.prioridad]) : /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
      style: {
        backgroundColor: C.critLight,
        color: C.crit
      }
    }, "Prioridad por definir"), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold",
      style: {
        color: C.muted
      }
    }, o.horizonteCategoria), o.estadoViabilidad && /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
      style: {
        backgroundColor: o.estadoViabilidad === "viable" || o.estadoViabilidad === "completado" ? C.saluLight : o.estadoViabilidad === "ajustado" ? C.mejLight : C.critLight,
        color: o.estadoViabilidad === "viable" || o.estadoViabilidad === "completado" ? C.salu : o.estadoViabilidad === "ajustado" ? C.mej : C.crit
      }
    }, {
      viable: "Viable",
      ajustado: "Ajustado",
      no_viable: "No viable",
      pendiente: "Pendiente",
      pendiente_capacidad: "Pendiente",
      completado: "Completado"
    }[o.estadoViabilidad])), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mt-1",
      style: {
        color: C.muted
      }
    }, o.importeObjetivo != null ? `${euros(o.importeReservadoAplicado)} / ${euros(o.importeObjetivo)}` : "Importe por definir", " · ", o.fechaObjetivo && !isNaN(new Date(o.fechaObjetivo + "T00:00:00").getTime()) ? `fecha ${new Date(o.fechaObjetivo + "T00:00:00").toLocaleDateString("es-ES")}` : o.horizonteAniosCalculado > 0 ? `${o.horizonteAniosCalculado.toFixed(1)} años` : "plazo por definir"), faltaDatos.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-xs",
      style: {
        color: C.crit
      }
    }, "Completa ", faltaDatos.join(", "), " para poder evaluar completamente este objetivo."), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
      style: {
        backgroundColor: o.recomendacionHorizonte.modo === "invertir" ? C.saluLight : o.recomendacionHorizonte.modo === "ahorrar" ? C.sandLight : "rgba(14,165,233,0.08)",
        color: C.ink
      }
    }, /*#__PURE__*/React.createElement(I.info, {
      size: 12
    }), o.recomendacionHorizonte.titulo)), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 shrink-0"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => abrirEditar(o),
      style: {
        color: C.navy
      }
    }, /*#__PURE__*/React.createElement(I.edit, {
      size: 15
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => eliminar(o.id),
      style: {
        color: C.crit
      }
    }, /*#__PURE__*/React.createElement(I.trash, {
      size: 15
    })))), o.importeObjetivo != null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "h-1.5 rounded-full mt-3 overflow-hidden",
      style: {
        backgroundColor: C.bgDeepMid
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-full rounded-full",
      style: {
        width: o.progreso + "%",
        backgroundColor: C.salu
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 text-xs"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Progreso"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, pct(o.progreso, 0))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Restante"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, o.importeRestante == null ? "—" : euros(o.importeRestante))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Necesario"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, o.aportacionNecesaria == null ? "—" : euros(o.aportacionNecesaria) + "/mes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Previsto"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, o.aportacionMensual == null ? "—" : euros(o.aportacionMensual) + "/mes")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.muted
      }
    }, "Capacidad"), /*#__PURE__*/React.createElement("b", {
      className: "block",
      style: {
        color: C.ink
      }
    }, plan.capacidadParaObjetivos == null ? "—" : euros(plan.capacidadParaObjetivos) + "/mes"))), o.aportacionMensual != null && plan.capacidadParaObjetivos != null && deficitObjetivo > 0 && /*#__PURE__*/React.createElement("div", {
      className: "mt-3 rounded-lg p-3 text-xs",
      style: {
        backgroundColor: C.critLight,
        color: C.crit
      }
    }, /*#__PURE__*/React.createElement("b", null, "Déficit de capacidad: ", euros(deficitObjetivo), "/mes."), " La aportación prevista supera la capacidad mensual calculada con tus ingresos, gastos y deudas."), o.aportacionMensual != null && o.aportacionNecesaria != null && /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-xs",
      style: {
        color: o.aportacionMensual >= o.aportacionNecesaria ? C.salu : C.crit
      }
    }, o.aportacionMensual >= o.aportacionNecesaria ? "La aportación indicada cubre el ritmo necesario para el plazo elegido." : `Con la aportación indicada faltan ${euros(o.aportacionNecesaria - o.aportacionMensual)}/mes respecto al ritmo necesario.`), /*#__PURE__*/React.createElement("div", {
      className: "mt-3 rounded-lg p-3 text-xs",
      style: {
        backgroundColor: o.recomendacionHorizonte.modo === "invertir" ? C.saluLight : o.recomendacionHorizonte.modo === "ahorrar" ? C.sandLight : "rgba(14,165,233,0.06)",
        color: C.ink
      }
    }, /*#__PURE__*/React.createElement("b", null, o.recomendacionHorizonte.titulo, "."), " ", o.recomendacionHorizonte.texto)));
  })), objetivos.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-5 grid sm:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.salu
    }
  }, "Capacidad mensual"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, plan.capacidadParaObjetivos == null ? "Pendiente" : euros(plan.capacidadParaObjetivos) + "/mes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Ingresos − gastos fijos − discrecionales − deudas.")), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: plan.deficitMensual > 0 ? C.critLight : C.saluLight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: plan.deficitMensual > 0 ? C.crit : C.salu
    }
  }, "Aportaciones previstas"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(plan.aportacionComprometida), "/mes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, plan.deficitMensual == null ? "Completa ingresos y gastos para compararlas." : plan.deficitMensual > 0 ? `Déficit: ${euros(plan.deficitMensual)}/mes.` : `Dentro de la capacidad actual.`)), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.navy
    }
  }, "Ritmo necesario"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(plan.aportacionNecesariaTotal), "/mes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, plan.deficitRitmoElegido > 0 ? `Tus aportaciones quedan ${euros(plan.deficitRitmoElegido)}/mes por debajo del ritmo necesario.` : "Ritmo cubierto con las aportaciones previstas."))), plan.principal && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 text-xs",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, "Objetivo principal:"), " ", objetivoTitulo(plan.principal), ". Se ha determinado por prioridad y, después, por plazo y capital pendiente."), plan.prioridadSinDefinir && objetivos.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: C.critLight,
      color: C.crit
    }
  }, /*#__PURE__*/React.createElement("b", null, "Define las prioridades."), " Hay objetivos sin prioridad; hasta que las indiques, la herramienta no asigna silenciosamente preferencia a ninguno."), plan.ejecucion && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-lg p-3 text-xs",
    style: {
      backgroundColor: "rgba(14,165,233,0.06)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Capacidad de ejecución:"), " ", plan.ejecucion.texto), plan.conflictoObjetivos && /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-xl p-3 text-xs",
    style: {
      backgroundColor: C.critLight,
      color: C.crit
    }
  }, /*#__PURE__*/React.createElement("b", null, "Conflicto entre objetivos:"), " tus aportaciones previstas suman ", euros(plan.aportacionComprometida), "/mes y la capacidad conjunta es ", euros(plan.capacidadParaObjetivos), "/mes. Déficit conjunto: ", euros(plan.deficitMensual), "/mes."), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 rounded-xl p-3 text-xs",
    style: {
      backgroundColor: "rgba(14,165,233,0.06)",
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("b", null, "Cómo lo calculamos:"), " usamos tus ingresos, gastos, deudas y ahorro actual. Es una orientación educativa, no una garantía de resultados."));
}
function Diagnostico({
  datos,
  setDatos,
  onFinalizar,
  objetivoSeleccionadoId,
  onEliminarSeleccionado
}) {
  /* UX: wizard de 3 pasos. Los datos siguen viviendo en `datos` y se persisten
     exactamente por los mecanismos existentes; solo cambia cuándo se muestran. */
  const [paso, setPaso] = useState(1);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [paso]);
  const [subPasoRedSeguridad, setSubPasoRedSeguridad] = useState(() => datos.deudas.some(d => Number(d.pendiente) > 0 || d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0) ? "listaDeudas" : "colchon");
  const cuotasDeuda = calcularCapacidadFinanciera(datos).cuotasDeuda;
  const totalIngresos = (Number(datos.ingresos) || 0) + (Number(datos.otrosIngresos) || 0);
  const gastosFijos = totalMensual(datos.gastosFijos);
  const gastosDisc = totalMensual(datos.gastosDiscrecionales);
  const necesidades = gastosFijos + cuotasDeuda;
  const deseos = gastosDisc;
  const ahorroReal = totalIngresos - necesidades - deseos;
  const ratioAhorro = totalIngresos > 0 ? ahorroReal / totalIngresos : 0;
  const fondo = calcularFondoEmergencia(datos);
  const objetivoFondo = fondo.objetivo == null ? 0 : fondo.objetivo;
  const estado = estadoAhorro(ratioAhorro);
  const puedePaso2 = Number(datos.ingresos) > 0;
  const avanzar = () => setPaso(p => Math.min(3, p + 1));
  const retroceder = () => setPaso(p => Math.max(1, p - 1));
  const addDeuda = () => setDatos({
    ...datos,
    deudas: [...datos.deudas, {
      nombre: "",
      pendiente: 0,
      cuota: 0,
      tasa: 0
    }]
  });
  const removeDeuda = i => setDatos({
    ...datos,
    deudas: datos.deudas.filter((_, idx) => idx !== i)
  });
  const updateDeuda = (i, field, val) => {
    const arr = [...datos.deudas];
    arr[i] = {
      ...arr[i],
      [field]: val
    };
    setDatos({
      ...datos,
      deudas: arr
    });
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-8 section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Diagnóstico financiero"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Construye tu foto financiera, paso a paso"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Empezamos por lo esencial y añadimos detalle solo cuando lo necesitas. Tus cálculos se actualizan en cada paso.")), /*#__PURE__*/React.createElement("div", {
    className: "mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs font-bold mb-2",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, "Paso ", paso, " de 3"), /*#__PURE__*/React.createElement("span", null, paso === 1 ? "Tu punto de partida" : paso === 2 ? "Tu presupuesto" : "Tu red de seguridad")), /*#__PURE__*/React.createElement("div", {
    className: "h-2 rounded-full overflow-hidden",
    style: {
      backgroundColor: C.bgDeepMid
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-full rounded-full transition-all duration-300",
    style: {
      width: paso / 3 * 100 + "%",
      backgroundColor: C.sand
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2 mt-3 text-[11px]"
  }, ["Ingresos y control", "Gastos y ahorro", "Colchón y deuda"].map((label, i) => /*#__PURE__*/React.createElement("button", {
    key: label,
    onClick: () => {
      if (i === 0 || puedePaso2 || i < paso) setPaso(i + 1);
    },
    className: "text-left font-bold",
    style: {
      color: paso === i + 1 ? C.ink : C.muted
    }
  }, i + 1, ". ", label)))), paso === 1 && /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4 mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "01 · Tu punto de partida"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Empecemos por lo que entra"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Solo necesitamos tus ingresos netos y cuánto control sientes que tienes.")), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-xl flex items-center justify-center",
    style: {
      backgroundColor: "rgba(16,185,129,0.08)"
    }
  }, /*#__PURE__*/React.createElement(I.wallet, {
    size: 17,
    color: C.salu
  }))), /*#__PURE__*/React.createElement("div", {
    className: "max-w-sm"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "Ingresos mensuales netos",
    value: datos.ingresos,
    onChange: v => setDatos({
      ...datos,
      ingresos: v
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "max-w-sm mt-4"
  }, /*#__PURE__*/React.createElement(NumberField, {
    label: "Otros ingresos",
    value: datos.otrosIngresos,
    onChange: v => setDatos({
      ...datos,
      otrosIngresos: v
    }),
    hint: "Opcional: becas, ayudas, rentas, etc."
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "¿Cómo describirías tu relación con el dinero hoy?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mb-3",
    style: {
      color: C.muted
    }
  }, "No hay una respuesta correcta. Esto nos ayuda a adaptar el acompañamiento."), /*#__PURE__*/React.createElement("div", {
    className: "grid sm:grid-cols-3 gap-2"
  }, ["No tengo ni idea de a dónde va", "Más o menos controlado, pero sin apuntar nada", "Todo apuntado y bajo control"].map(h => /*#__PURE__*/React.createElement("button", {
    key: h,
    onClick: () => setDatos({
      ...datos,
      habito: h
    }),
    className: "text-left px-3.5 py-3 rounded-lg border text-sm font-medium transition-all hover:-translate-y-0.5",
    style: {
      borderColor: datos.habito === h ? C.sand : C.border,
      backgroundColor: datos.habito === h ? C.sandLight : C.paper,
      color: C.ink
    }
  }, h)))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end mt-6"
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !puedePaso2,
    onClick: avanzar,
    className: "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Ver mi primer avance ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })))), paso === 2 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "02 · Tu presupuesto"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "¿En qué se va tu dinero?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Introduce primero los gastos que conozcas. Puedes volver y afinarlos después.")), /*#__PURE__*/React.createElement(GastosTabs, {
    datos: datos,
    setDatos: setDatos
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 rounded-2xl p-4 sm:p-5",
    style: {
      backgroundColor: C.sandLight,
      border: "1px solid rgba(79,70,229,.16)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement(I.sparkles, {
    size: 18,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase",
    style: {
      color: C.sand,
      letterSpacing: "0.08em"
    }
  }, "Tu primer momento de valor"), /*#__PURE__*/React.createElement("div", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, euros(ahorroReal), " al mes de margen"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Con lo que has introducido hasta ahora, este sería tu ahorro disponible antes de entrar en el detalle de colchón y deuda."), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex flex-wrap gap-3 text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.ink
    }
  }, "Ahorro: ", pct(ratioAhorro * 100)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.muted
    }
  }, "Gastos: ", euros(necesidades + deseos), "/mes")))))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: retroceder,
    className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 15
  }), " Atrás"), /*#__PURE__*/React.createElement("button", {
    onClick: avanzar,
    className: "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Continuar ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })))), paso === 3 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-5 sm:p-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4 mb-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "03 · Tu red de seguridad"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Colchón y deuda, sin juicios"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, "Vamos paso a paso: primero tu colchón, después tus deudas si las tienes.")), /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-xl flex items-center justify-center",
    style: {
      backgroundColor: "rgba(14,165,233,0.08)"
    }
  }, /*#__PURE__*/React.createElement(I.shieldCheck, {
    size: 17,
    color: C.exc
  }))), subPasoRedSeguridad === "colchon" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 mb-4",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "¿Qué es el colchón financiero?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Es el dinero que tienes ahorrado y disponible para imprevistos (una reparación, quedarte sin ingresos unos meses...), sin tocar inversiones ni pedir prestado. Cuantos más meses de gastos cubra, más tranquilidad tienes.")), /*#__PURE__*/React.createElement(NumberField, {
    label: "Ahorro actual disponible",
    value: datos.ahorroActual,
    onChange: v => setDatos({
      ...datos,
      ahorroActual: v
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 rounded-xl p-4",
    style: {
      backgroundColor: C.saluLight
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Tu red de seguridad"), /*#__PURE__*/React.createElement("div", {
    className: "mt-1 text-sm",
    style: {
      color: C.muted
    }
  }, fondo.coberturaMeses == null ? "Cuando tengamos tus gastos esenciales podremos estimarla." : `Con lo que tienes hoy, tu colchón cubre aproximadamente ${fondo.coberturaMeses.toFixed(1)} meses de gastos esenciales.`)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end mt-5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("preguntaDeuda"),
    className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Continuar ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 15
  })))), subPasoRedSeguridad === "preguntaDeuda" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("colchon"),
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-3",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver al colchón"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "¿Tienes alguna deuda (que no sea tu hipoteca)?"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mb-4",
    style: {
      color: C.muted
    }
  }, "Por ejemplo: préstamo de coche, de estudios, tarjeta de crédito u otro préstamo personal."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("listaDeudas"),
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "Sí, tengo alguna deuda"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setDatos({
        ...datos,
        deudas: []
      });
      setSubPasoRedSeguridad("sinDeuda");
    },
    className: "px-4 py-2.5 rounded-xl border text-sm font-bold",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper,
      color: C.ink
    }
  }, "No tengo deudas"))), subPasoRedSeguridad === "sinDeuda" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("preguntaDeuda"),
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-3",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver"), /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 text-sm",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border,
      color: C.muted
    }
  }, "Perfecto, seguimos sin deudas que gestionar.")), subPasoRedSeguridad === "listaDeudas" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPasoRedSeguridad("preguntaDeuda"),
    className: "inline-flex items-center gap-1.5 text-xs font-bold mb-3",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 13
  }), " Volver"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3 mb-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.ink
    }
  }, "Deudas pendientes"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, "Añade o marca las que tengas.")), /*#__PURE__*/React.createElement("button", {
    onClick: addDeuda,
    className: "inline-flex items-center gap-1.5 text-xs font-bold",
    style: {
      color: C.sand
    }
  }, /*#__PURE__*/React.createElement(I.plus, {
    size: 14
  }), " Añadir deuda")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, datos.deudas.filter(d => Number(d.pendiente) > 0 || d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0).map(d => {
    const originalIndex = datos.deudas.indexOf(d);
    return /*#__PURE__*/React.createElement("div", {
      key: originalIndex,
      className: "rounded-xl p-3.5 border",
      style: {
        backgroundColor: C.paper,
        border: "1px solid " + C.border
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-2 mb-3"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Nombre (ej. préstamo coche)",
      value: d.nombre,
      onChange: e => updateDeuda(originalIndex, "nombre", e.target.value),
      className: "flex-1 min-w-0 text-sm font-bold border-none outline-none bg-transparent",
      style: {
        color: C.ink
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => removeDeuda(originalIndex),
      className: "shrink-0",
      style: {
        color: C.crit
      },
      "aria-label": "Eliminar deuda"
    }, /*#__PURE__*/React.createElement(I.trash, {
      size: 15
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-3 gap-2"
    }, [["pendiente", "Pendiente €"], ["cuota", "Cuota €/mes"], ["tasa", "Interés %"]].map(([field, lbl]) => /*#__PURE__*/React.createElement("div", {
      key: field
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[10px] font-bold uppercase",
      style: {
        color: C.muted
      }
    }, lbl), /*#__PURE__*/React.createElement("input", {
      type: "number",
      inputMode: "decimal",
      value: d[field] === 0 ? "" : d[field],
      onChange: e => updateDeuda(originalIndex, field, e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))),
      placeholder: "0",
      className: "w-full rounded-lg px-2 py-2 text-sm font-bold border outline-none",
      style: {
        borderColor: C.border,
        color: C.ink,
        backgroundColor: C.paper
      }
    })))));
  })), datos.deudas.filter(d => Number(d.pendiente) > 0 || d.nombre || Number(d.cuota) > 0 || Number(d.tasa) > 0).length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "rounded-xl p-4 text-xs mt-3",
    style: {
      backgroundColor: C.paper,
      border: "1px solid " + C.border,
      color: C.muted
    }
  }, "Añade tu primera deuda con el botón de arriba."))), /*#__PURE__*/React.createElement(ObjetivosFinancieros, {
    datos: datos,
    setDatos: setDatos,
    objetivoSeleccionadoId: objetivoSeleccionadoId,
    onEliminarSeleccionado: onEliminarSeleccionado
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: retroceder,
    className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement(I.arrowLeft, {
    size: 15
  }), " Atrás"), /*#__PURE__*/React.createElement("button", {
    onClick: onFinalizar,
    className: "inline-flex justify-center items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Ver mi salud financiera ", /*#__PURE__*/React.createElement(I.arrowRight, {
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement(Card, {
    className: "p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Ingresos"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, euros(totalIngresos))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Gastos"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, euros(necesidades + deseos))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Margen mensual"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: ahorroReal >= 0 ? C.salu : C.mej
    }
  }, euros(ahorroReal))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] uppercase font-bold",
    style: {
      color: C.muted
    }
  }, "Estado"), /*#__PURE__*/React.createElement(Badge, {
    estado: estado
  })))))));
}
const CALCULADORA_DOCUMENTO = "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Prueba nuestras calculadoras</title>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js\"><\/script>\n<style>\n  /* ============================================================\n     SISTEMA DE DISEÑO — extraído de \"Salud Financiera\" (Archivo Maestro)\n     ============================================================ */\n  :root{\n    --bg:#f5f6fa;\n    --surface:#ffffff;\n    --surface-soft:#fafafa;\n    --primary:#4f46e5;\n    --primary-dark:#3730a3;\n    --primary-soft:#eef0ff;\n    --navy:#312e81;\n    --green:#10b981;\n    --green-soft:#eafaf4;\n    --blue:#0ea5e9;\n    --blue-soft:#eaf7fd;\n    --amber:#f59e0b;\n    --amber-soft:#fff7e6;\n    --danger:#ef4444;\n    --danger-soft:#fff0f0;\n    --text:#374151;\n    --text-strong:#1e1e2e;\n    --muted:#6b7280;\n    --border:#e5e7eb;\n    --header-bg:#0b0f1a;\n    --insight-bg:#312e81;\n    --insight-text:#c7d2fe;\n    --shadow-soft: 0 1px 3px rgba(30,30,46,0.05), 0 8px 24px rgba(30,30,46,0.05);\n    --shadow-soft-hover: 0 4px 16px rgba(79,70,229,0.12);\n    --font-sans: ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n    --font-serif: ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif;\n  }\n  *{box-sizing:border-box;}\n  html{scroll-behavior:smooth;}\n  body{\n    margin:0;\n    font-family:var(--font-sans);\n    background:linear-gradient(180deg,#f1f3f9 0%,#f5f6fa 22%,#f8f9fc 52%,#f3f5fa 78%,#eef1f8 100%);\n    color:var(--text);\n    padding:0 0 60px;\n    position:relative;\n  }\n\n  /* ---- Patrón geométrico de líneas finas, adaptado al fondo claro del original ---- */\n  body::before{\n    content:\"\";\n    position:fixed;\n    inset:0;\n    pointer-events:none;\n    z-index:0;\n    opacity:0.5;\n    background-image:\n      repeating-linear-gradient(30deg, rgba(49,46,129,0.035) 0px, rgba(49,46,129,0.035) 1px, transparent 1px, transparent 96px),\n      repeating-linear-gradient(-30deg, rgba(49,46,129,0.035) 0px, rgba(49,46,129,0.035) 1px, transparent 1px, transparent 96px),\n      repeating-linear-gradient(90deg, rgba(49,46,129,0.02) 0px, rgba(49,46,129,0.02) 1px, transparent 1px, transparent 96px);\n    mask-image:radial-gradient(120% 100% at 50% 0%, #000 0%, rgba(0,0,0,0.5) 55%, transparent 90%);\n    -webkit-mask-image:radial-gradient(120% 100% at 50% 0%, #000 0%, rgba(0,0,0,0.5) 55%, transparent 90%);\n  }\n\n  /* ---- Resplandores de color muy tenues para dar profundidad, sin volver el fondo un lienzo blanco ---- */\n  .bg-blob{\n    position:fixed;\n    border-radius:9999px;\n    filter:blur(120px);\n    pointer-events:none;\n    z-index:0;\n    will-change:transform;\n  }\n  .blob-a{ width:520px; height:520px; top:-180px; left:-160px; background:var(--primary); opacity:0.28; animation:blobFloatA 26s ease-in-out infinite; }\n  .blob-b{ width:440px; height:440px; bottom:-160px; right:-140px; background:var(--blue); opacity:0.18; animation:blobFloatB 30s ease-in-out infinite; }\n  .blob-c{ width:380px; height:380px; top:40%; right:-160px; background:var(--green); opacity:0.10; animation:blobFloatC 28s ease-in-out infinite; }\n  @keyframes blobFloatA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px,-40px) scale(1.12); } 66% { transform: translate(-40px,30px) scale(0.92); } }\n  @keyframes blobFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,50px) scale(1.15); } }\n  @keyframes blobFloatC { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(40px,40px) scale(1.05); } 75% { transform: translate(-30px,-30px) scale(0.95); } }\n\n  .topbar, .container{ position:relative; z-index:1; }\n  .container{\n    max-width:1000px;\n    margin:0 auto;\n    padding:0 16px;\n  }\n\n  /* ---- Barra superior \"de cristal\", como el glass-nav del Maestro ---- */\n  .topbar{\n    background:rgba(15,17,25,0.35);\n    backdrop-filter:blur(14px) saturate(140%);\n    -webkit-backdrop-filter:blur(14px) saturate(140%);\n    border-bottom:1px solid rgba(255,255,255,0.08);\n    padding:14px 16px;\n    margin-bottom:40px;\n  }\n  .topbar-inner{\n    max-width:1000px;\n    margin:0 auto;\n    display:flex;\n    align-items:center;\n    gap:10px;\n  }\n  .topbar-badge{\n    width:28px; height:28px; border-radius:9999px;\n    background:var(--primary);\n    display:flex; align-items:center; justify-content:center;\n    flex-shrink:0;\n  }\n  .topbar-brand{\n    font-family:var(--font-serif);\n    font-weight:700;\n    font-size:0.95rem;\n    color:#fff;\n  }\n\n  /* ---- Foco accesible, idéntico al Archivo Maestro ---- */\n  button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible {\n    outline: 2px solid var(--primary);\n    outline-offset: 2px;\n    border-radius: 4px;\n  }\n  input{ transition: border-color 200ms ease, box-shadow 200ms ease; }\n  input:focus{ border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }\n\n  @keyframes staggerIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }\n  .stagger-item { animation: staggerIn 380ms cubic-bezier(0.16,1,0.3,1) both; }\n  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; } }\n\n  header{\n    text-align:center;\n    margin-bottom:32px;\n  }\n  header .eyebrow{\n    font-size:0.72rem;\n    font-weight:700;\n    text-transform:uppercase;\n    letter-spacing:0.16em;\n    color:var(--primary-dark);\n    margin-bottom:10px;\n  }\n  header h1{\n    font-family:var(--font-serif);\n    font-size:clamp(1.7rem, 4.2vw, 2.4rem);\n    margin:0 0 10px;\n    font-weight:700;\n    color:var(--text-strong);\n    text-shadow:none;\n  }\n  header h1 span{ color:var(--primary); }\n  header p{\n    color:var(--muted);\n    margin:0;\n    font-size:1rem;\n    max-width:520px;\n    margin-left:auto;\n    margin-right:auto;\n  }\n\n  /* ---- Caja de insight: azul marino sólido + texto blanco, patrón del Maestro ---- */\n  .insight-box{\n    border-radius:14px;\n    padding:16px;\n    display:flex;\n    align-items:flex-start;\n    gap:12px;\n    background:var(--insight-bg);\n    margin-top:16px;\n  }\n  .insight-box .insight-icon{ color:var(--primary); flex-shrink:0; margin-top:2px; }\n  .insight-box .insight-text{ font-size:0.85rem; color:var(--insight-text); line-height:1.5; }\n  .insight-box .insight-text b{ color:#fff; }\n\n  /* ---- Tarjetas: superficie blanca + doble sombra suave del Maestro ---- */\n  .card{\n    background:var(--surface);\n    background-image:\n      radial-gradient(120% 140% at 0% 0%, rgba(79,70,229,0.05) 0%, rgba(79,70,229,0.015) 35%, rgba(0,0,0,0) 60%),\n      radial-gradient(100% 120% at 100% 100%, rgba(14,165,233,0.05) 0%, rgba(0,0,0,0) 55%);\n    border-radius:20px;\n    box-shadow:var(--shadow-soft);\n    padding:28px;\n    margin-bottom:24px;\n    border:1px solid var(--border);\n    transition: box-shadow 250ms ease, border-color 250ms ease;\n    position:relative;\n  }\n  .grid-inputs{\n    display:grid;\n    grid-template-columns:1fr 1fr;\n    gap:24px;\n  }\n  @media (max-width:640px){\n    .grid-inputs{grid-template-columns:1fr;}\n  }\n  .field{\n    display:flex;\n    flex-direction:column;\n    gap:8px;\n  }\n  .field label{\n    font-weight:700;\n    font-size:0.8rem;\n    text-transform:uppercase;\n    letter-spacing:0.06em;\n    color:var(--text);\n    display:flex;\n    justify-content:space-between;\n    align-items:center;\n  }\n  .field label span.unit{\n    color:var(--muted);\n    font-weight:400;\n    text-transform:none;\n    letter-spacing:0;\n    font-size:0.8rem;\n  }\n  .input-row{\n    display:flex;\n    align-items:center;\n    gap:12px;\n  }\n\n  /* ---- Inputs numéricos: mismo tratamiento que NumberField del Maestro (fondo suave, borde, focus índigo) ---- */\n  input[type=number]{\n    width:110px;\n    padding:8px 10px;\n    border-radius:10px;\n    border:1px solid var(--border);\n    font-size:0.95rem;\n    font-weight:700;\n    color:var(--text-strong);\n    background:var(--surface-soft);\n  }\n  input[type=number]:focus{\n    outline:none;\n    background:#fff;\n  }\n  input[type=range]{\n    flex:1;\n    -webkit-appearance:none;\n    appearance:none;\n    height:6px;\n    border-radius:6px;\n    background:linear-gradient(90deg, var(--primary) 0%, var(--primary) 0%, var(--border) 0%);\n    outline:none;\n  }\n  input[type=range]::-webkit-slider-thumb{\n    -webkit-appearance:none;\n    appearance:none;\n    width:20px;\n    height:20px;\n    border-radius:50%;\n    background:var(--primary);\n    cursor:pointer;\n    border:3px solid #fff;\n    box-shadow:0 0 0 1px var(--primary);\n  }\n  input[type=range]::-moz-range-thumb{\n    width:20px;\n    height:20px;\n    border-radius:50%;\n    background:var(--primary);\n    cursor:pointer;\n    border:3px solid #fff;\n    box-shadow:0 0 0 1px var(--primary);\n  }\n\n  /* ---- Resultados: tarjetas KPI al estilo StatCard del Maestro (superficie blanca + insignia de color + cifra en serif) ---- */\n  .results{\n    display:grid;\n    grid-template-columns:repeat(3, 1fr);\n    gap:16px;\n  }\n  @media (max-width:640px){\n    .results{grid-template-columns:1fr;}\n  }\n  .result-box{\n    background:var(--surface);\n    border:1px solid var(--border);\n    border-radius:18px;\n    padding:20px;\n    text-align:left;\n    box-shadow:var(--shadow-soft);\n    transition: box-shadow 250ms ease, border-color 250ms ease, transform 250ms ease;\n    min-width:0;\n  }\n  .result-box:hover{ transform:translateY(-2px); box-shadow:var(--shadow-soft-hover); }\n  .result-icon{\n    width:34px; height:34px; border-radius:9999px;\n    display:flex; align-items:center; justify-content:center;\n    margin-bottom:12px;\n  }\n  .result-box .label{\n    font-size:0.72rem;\n    text-transform:uppercase;\n    letter-spacing:0.1em;\n    margin-bottom:6px;\n    font-weight:700;\n  }\n  .result-box .value{\n    font-family:var(--font-serif);\n    font-size:clamp(1.15rem, 5vw, 1.6rem);\n    font-weight:700;\n    letter-spacing:-0.3px;\n    color:var(--text-strong);\n    overflow-wrap:break-word;\n    word-break:break-word;\n  }\n  .box-total .result-icon{ background:var(--primary-soft); color:var(--primary); }\n  .box-total .label{ color:var(--primary-dark); }\n  .box-aportado .result-icon{ background:var(--blue-soft); color:var(--blue); }\n  .box-aportado .label{ color:var(--blue); }\n  .box-interes .result-icon{ background:var(--green-soft); color:var(--green); }\n  .box-interes .label{ color:var(--green); }\n\n  .chart-wrap{\n    position:relative;\n    height:360px;\n  }\n\n  /* ---- CTA final: bloque oscuro índigo, coherente con la cabecera del Maestro ---- */\n  .cta-card{\n    background:linear-gradient(160deg,#1e1b4b,var(--navy));\n    color:#fff;\n    border-radius:20px;\n    padding:32px;\n    text-align:center;\n    box-shadow:var(--shadow-soft);\n  }\n  .cta-card h3{\n    font-family:var(--font-serif);\n    font-size:1.4rem;\n    font-weight:700;\n    margin:0 0 10px;\n  }\n  .cta-card p{\n    color:#c7d2fe;\n    margin:0 0 22px;\n    font-size:1rem;\n    max-width:560px;\n    margin-left:auto;\n    margin-right:auto;\n  }\n  .cta-btn{\n    display:inline-flex;\n    align-items:center;\n    gap:8px;\n    background:var(--primary);\n    color:#fff;\n    font-weight:700;\n    padding:12px 24px;\n    border-radius:10px;\n    text-decoration:none;\n    font-size:0.95rem;\n    transition:transform 150ms ease, box-shadow 150ms ease, background 150ms ease;\n    box-shadow:0 0 24px -6px rgba(79,70,229,0.5);\n  }\n  .cta-btn:hover{\n    transform:scale(1.03);\n    background:var(--primary-dark);\n  }\n  .disclaimer{\n    font-size:0.75rem;\n    color:#9aa1b3;\n    text-align:center;\n    margin-top:20px;\n  }\n  .section-title{\n    font-family:var(--font-serif);\n    font-weight:700;\n    font-size:1.15rem;\n    margin:0 0 20px;\n    color:var(--text-strong);\n  }\n\n  /* ---- Selector de modo: píldora índigo deslizante, igual que la navegación del Maestro ---- */\n  .mode-tabs{\n    display:grid;\n    grid-template-columns:repeat(4, 1fr);\n    gap:8px;\n  }\n  @media (max-width:640px){\n    .mode-tabs{ grid-template-columns:repeat(2, 1fr); }\n  }\n  .mode-tab{\n    display:inline-flex;\n    align-items:center;\n    justify-content:center;\n    gap:8px;\n    border:none;\n    background:transparent;\n    padding:12px 10px;\n    border-radius:14px;\n    font-size:0.85rem;\n    font-weight:700;\n    color:var(--muted);\n    cursor:pointer;\n    transition:background 150ms ease, color 150ms ease, transform 150ms ease;\n    text-align:center;\n  }\n  .mode-tab.active{\n    background:var(--primary);\n    color:var(--navy);\n    box-shadow:0 0 20px -4px rgba(79,70,229,0.45);\n  }\n  .mode-tab:not(.active):hover{\n    background:var(--primary-soft);\n    color:var(--primary-dark);\n  }\n  .mode-tab:active{ transform:scale(0.98); }\n\n  .table-wrap{\n    overflow-x:auto;\n    border-radius:14px;\n    border:1px solid var(--border);\n  }\n  table{\n    width:100%;\n    border-collapse:collapse;\n    font-size:0.9rem;\n    min-width:480px;\n  }\n  thead th{\n    background:var(--surface-soft);\n    text-align:right;\n    padding:12px 16px;\n    font-weight:700;\n    color:var(--text-strong);\n    border-bottom:2px solid var(--border);\n    white-space:nowrap;\n  }\n  thead th:first-child, tbody td:first-child{\n    text-align:left;\n  }\n  tbody td{\n    text-align:right;\n    padding:10px 16px;\n    border-bottom:1px solid var(--border);\n    color:var(--text);\n    white-space:nowrap;\n  }\n  tbody tr:last-child td{\n    border-bottom:none;\n  }\n  tbody tr:hover{\n    background:var(--surface-soft);\n  }\n  tbody tr.row-final{\n    background:var(--primary-soft);\n    font-weight:700;\n  }\n  td.col-aportado{ color:var(--blue); }\n  td.col-interes{ color:var(--green); }\n  td.col-total{ color:var(--primary); font-weight:700; }\n\n  /* ---- Tarjetas de opciones en la página de bienvenida ---- */\n  .opciones-grid{\n    display:grid;\n    grid-template-columns:1fr 1fr;\n    gap:18px;\n    margin-top:8px;\n  }\n  @media (max-width:640px){ .opciones-grid{ grid-template-columns:1fr; } }\n  .opcion-card{\n    display:flex;\n    flex-direction:column;\n    gap:10px;\n    height:100%;\n    min-width:0;\n  }\n  .opcion-card .opcion-icon{\n    width:38px;height:38px;border-radius:10px;\n    background:var(--primary-soft);\n    display:flex;align-items:center;justify-content:center;\n    flex-shrink:0;\n  }\n  .opcion-card h3{\n    margin:0;\n    font-family:var(--font-serif);\n    font-size:1.02rem;\n    color:var(--text-strong);\n  }\n  .opcion-card p{\n    margin:0;\n    color:var(--muted);\n    font-size:0.87rem;\n    line-height:1.5;\n    flex:1;\n  }\n  .opcion-btn{\n    align-self:flex-start;\n    display:inline-flex;\n    align-items:center;\n    gap:6px;\n    background:var(--primary);\n    color:#fff;\n    font-weight:700;\n    font-size:0.82rem;\n    padding:8px 14px;\n    border-radius:9px;\n    border:none;\n    cursor:pointer;\n    text-decoration:none;\n    transition:background 200ms ease;\n  }\n  .opcion-btn:hover{ background:var(--primary-dark); }\n  .seccion-divisor{\n    display:flex;\n    align-items:center;\n    gap:12px;\n    margin:36px 0 20px;\n    color:var(--muted);\n    font-size:0.75rem;\n    font-weight:700;\n    text-transform:uppercase;\n    letter-spacing:0.1em;\n  }\n  .seccion-divisor::before, .seccion-divisor::after{\n    content:\"\";\n    flex:1;\n    height:1px;\n    background:var(--border);\n  }\n</style>\n</head>\n<body>\n<div class=\"bg-blob blob-a\"></div>\n<div class=\"bg-blob blob-b\"></div>\n<div class=\"bg-blob blob-c\"></div>\n<div class=\"topbar\">\n  <div class=\"topbar-inner\">\n    <div class=\"topbar-badge\">\n      <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--navy)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg>\n    </div>\n    <span class=\"topbar-brand\">Salud Financiera</span>\n  </div>\n</div>\n<div class=\"container\">\n  <header style=\"padding-top:8px;\">\n    <div class=\"eyebrow\">Herramientas interactivas</div>\n    <h1>Prueba nuestras <span>calculadoras</span></h1>\n    <p>Pequeñas simulaciones que te ayudan a tomar decisiones financieras con datos reales, no con intuición</p>\n  </header>\n\n  <div class=\"card\">\n    <div class=\"insight-box\" style=\"margin-top:0;\">\n      <svg class=\"insight-icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></svg>\n      <div class=\"insight-text\">\n        <b>¿Por qué usar una calculadora financiera?</b> Nuestro cerebro es malo estimando el efecto del tiempo y el interés compuesto: subestimamos cuánto puede crecer un ahorro constante y sobreestimamos lo que necesitamos aportar para llegar a una meta. Cada una de las 4 opciones de abajo responde a una pregunta distinta que te puedes estar haciendo sobre tu dinero. Elige la que encaje con tu situación y te llevará directamente a esa calculadora, ya configurada.\n      </div>\n    </div>\n  </div>\n\n  <div class=\"card\">\n    <div class=\"section-title\" style=\"margin-bottom:14px;\">Elige qué quieres calcular</div>\n    <div class=\"opciones-grid\">\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg></div>\n        <h3>Capital final</h3>\n        <p><b>¿Para qué sirve?</b> Calcula cuánto dinero acumularás al cabo de los años si mantienes tu depósito inicial, tu aportación mensual y una rentabilidad estimada. <b>Por qué importa:</b> te muestra el efecto real del interés compuesto y cuánto de tu capital final serán intereses generados, no solo lo que has aportado tú.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('capital')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/></svg></div>\n        <h3>Tiempo para llegar a una meta</h3>\n        <p><b>¿Para qué sirve?</b> Indicas tu objetivo de ahorro y calcula cuántos años y meses necesitas para alcanzarlo con tu aportación y rentabilidad actuales. <b>Por qué importa:</b> convierte una meta abstracta (\"quiero ahorrar para X\") en un plazo concreto, para saber si vas a tiempo o necesitas ajustar algo.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('tiempo')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg></div>\n        <h3>Aportación mensual necesaria</h3>\n        <p><b>¿Para qué sirve?</b> Fijas tu objetivo y el plazo en el que quieres lograrlo, y calcula cuánto necesitas aportar cada mes. <b>Por qué importa:</b> te dice si esa meta es realista con tu capacidad de ahorro actual, antes de comprometerte a un plan que no puedas mantener.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('aportacion')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 17l6-6 4 4 8-8\"/><path d=\"M14 7h7v7\"/></svg></div>\n        <h3>Rentabilidad necesaria</h3>\n        <p><b>¿Para qué sirve?</b> Con tu capital, tu aportación y tu plazo, calcula qué rentabilidad anual media necesitarías para llegar a tu objetivo. <b>Por qué importa:</b> te ayuda a valorar si esa rentabilidad es razonable o si estás asumiendo un riesgo excesivo para conseguirla.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('rentabilidad')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n    </div>\n  </div>\n\n  <div class=\"seccion-divisor\" id=\"calculadora-divider\" style=\"display:none;\">La calculadora</div>\n\n  <div id=\"calculadora-app\" style=\"display:none;\">\n  <header style=\"padding-top:0;margin-bottom:24px;\">\n    <div class=\"eyebrow\">Tu dinero, en perspectiva</div>\n    <h1 style=\"font-size:clamp(1.4rem, 3.2vw, 1.9rem);\">Calculadora de <span>Interés Compuesto</span></h1>\n    <p>Descubre cuánto puede crecer tu dinero ahorrando e invirtiendo a largo plazo</p>\n  </header>\n\n  <!-- SELECTOR DE MODO -->\n  <div class=\"card\" style=\"padding:10px;\">\n    <div class=\"mode-tabs\">\n      <button class=\"mode-tab active\" id=\"tabCapital\" data-mode=\"capital\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg>\n        ¿Cuánto tendré?\n      </button>\n      <button class=\"mode-tab\" id=\"tabTiempo\" data-mode=\"tiempo\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/></svg>\n        ¿Cuánto tardaré?\n      </button>\n      <button class=\"mode-tab\" id=\"tabAportacion\" data-mode=\"aportacion\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg>\n        ¿Cuánto necesitaré?\n      </button>\n      <button class=\"mode-tab\" id=\"tabRentabilidad\" data-mode=\"rentabilidad\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg>\n        ¿Qué rentabilidad?\n      </button>\n    </div>\n  </div>\n\n  <!-- INPUTS -->\n  <div class=\"card\">\n    <div class=\"section-title\" id=\"inputsTitle\">Tus datos</div>\n    <div class=\"grid-inputs\">\n\n      <div class=\"field\">\n        <label>Depósito inicial <span class=\"unit\">€</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeInicial\" min=\"0\" max=\"100000\" step=\"100\" value=\"1000\">\n          <input type=\"number\" id=\"numInicial\" min=\"0\" max=\"1000000\" step=\"100\" value=\"1000\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldMensual\">\n        <label>Aportación mensual <span class=\"unit\">€/mes</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeMensual\" min=\"0\" max=\"5000\" step=\"10\" value=\"100\">\n          <input type=\"number\" id=\"numMensual\" min=\"0\" max=\"100000\" step=\"10\" value=\"100\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldPlazo\">\n        <label>Plazo de inversión <span class=\"unit\">años</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangePlazo\" min=\"1\" max=\"50\" step=\"1\" value=\"50\">\n          <input type=\"number\" id=\"numPlazo\" min=\"1\" max=\"100\" step=\"1\" value=\"50\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldObjetivo\" style=\"display:none;\">\n        <label>Objetivo de capital <span class=\"unit\">€</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeObjetivo\" min=\"1000\" max=\"1000000\" step=\"1000\" value=\"100000\">\n          <input type=\"number\" id=\"numObjetivo\" min=\"0\" max=\"100000000\" step=\"1000\" value=\"100000\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldTasa\">\n        <label>Rentabilidad anual estimada <span class=\"unit\">%</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeTasa\" min=\"0\" max=\"20\" step=\"0.1\" value=\"7\">\n          <input type=\"number\" id=\"numTasa\" min=\"0\" max=\"50\" step=\"0.1\" value=\"7\">\n        </div>\n      </div>\n\n    </div>\n\n    <div class=\"insight-box\">\n      <svg class=\"insight-icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2a10 10 0 100 20 10 10 0 000-20z\"/><path d=\"M12 16v-5M12 8h.01\"/></svg>\n      <div class=\"insight-text\"><b>El interés compuesto premia el tiempo, no solo el dinero.</b> Aportar antes, aunque sea poco, suele pesar más a largo plazo que aportar mucho pero empezar tarde.</div>\n    </div>\n  </div>\n\n  <!-- RESULTADOS: MODO CAPITAL -->\n  <div class=\"card\" id=\"resultsCapital\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <div class=\"label\">Capital Total Final</div>\n        <div class=\"value\" id=\"resTotal\">0 €</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportado\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteres\">0 €</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- RESULTADOS: MODO TIEMPO -->\n  <div class=\"card\" id=\"resultsTiempo\" style=\"display:none;\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg></div>\n        <div class=\"label\">Tiempo necesario</div>\n        <div class=\"value\" id=\"resTiempo\">0 años</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportadoTiempo\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteresTiempo\">0 €</div>\n      </div>\n    </div>\n    <p id=\"avisoObjetivo\" style=\"color:var(--muted); font-size:0.85rem; text-align:center; margin:16px 0 0;\"></p>\n  </div>\n\n  <!-- RESULTADOS: MODO APORTACIÓN NECESARIA -->\n  <div class=\"card\" id=\"resultsAportacion\" style=\"display:none;\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Aportación mensual necesaria</div>\n        <div class=\"value\" id=\"resMensualNecesaria\">0 €</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportadoNecesaria\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteresNecesaria\">0 €</div>\n      </div>\n    </div>\n    <p id=\"avisoAportacion\" style=\"color:var(--muted); font-size:0.85rem; text-align:center; margin:16px 0 0;\"></p>\n  </div>\n\n  <!-- RESULTADOS: MODO RENTABILIDAD NECESARIA -->\n  <div class=\"card\" id=\"resultsRentabilidad\" style=\"display:none;\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Rentabilidad anual necesaria</div>\n        <div class=\"value\" id=\"resTasaNecesaria\">0 %</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportadoRentabilidad\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteresRentabilidad\">0 €</div>\n      </div>\n    </div>\n    <p id=\"avisoRentabilidad\" style=\"color:var(--muted); font-size:0.85rem; text-align:center; margin:16px 0 0;\"></p>\n  </div>\n\n  <!-- GRAFICO -->\n  <div class=\"card\">\n    <div class=\"section-title\">Evolución año a año</div>\n    <div class=\"chart-wrap\">\n      <canvas id=\"chart\"></canvas>\n    </div>\n  </div>\n\n  <!-- TABLA AÑO A AÑO -->\n  <div class=\"card\">\n    <div class=\"section-title\">Detalle año a año</div>\n    <div class=\"table-wrap\">\n      <table id=\"tablaDetalle\">\n        <thead>\n          <tr>\n            <th>Año</th>\n            <th>Aportado acumulado</th>\n            <th>Intereses acumulados</th>\n            <th>Capital total</th>\n          </tr>\n        </thead>\n        <tbody id=\"tablaBody\">\n        </tbody>\n      </table>\n    </div>\n  </div>\n\n  <p class=\"disclaimer\">Esta calculadora es una herramienta orientativa y no constituye asesoramiento financiero. Los rendimientos pasados no garantizan resultados futuros.</p>\n  </div>\n</div>\n\n<script>\n  const el = id => document.getElementById(id);\n\n  const rangeInicial = el('rangeInicial'), numInicial = el('numInicial');\n  const rangeMensual = el('rangeMensual'), numMensual = el('numMensual');\n  const rangePlazo = el('rangePlazo'), numPlazo = el('numPlazo');\n  const rangeObjetivo = el('rangeObjetivo'), numObjetivo = el('numObjetivo');\n  const rangeTasa = el('rangeTasa'), numTasa = el('numTasa');\n\n  const tabCapital = el('tabCapital'), tabTiempo = el('tabTiempo');\n  const tabAportacion = el('tabAportacion'), tabRentabilidad = el('tabRentabilidad');\n  const fieldMensual = el('fieldMensual'), fieldPlazo = el('fieldPlazo');\n  const fieldObjetivo = el('fieldObjetivo'), fieldTasa = el('fieldTasa');\n  const resultsCapital = el('resultsCapital'), resultsTiempo = el('resultsTiempo');\n  const resultsAportacion = el('resultsAportacion'), resultsRentabilidad = el('resultsRentabilidad');\n\n  let modo = 'capital'; // 'capital' | 'tiempo' | 'aportacion' | 'rentabilidad'\n\n  // Qué campos de entrada se muestran en cada modo\n  const camposPorModo = {\n    capital:       { mensual:true,  plazo:true,  objetivo:false, tasa:true  },\n    tiempo:        { mensual:true,  plazo:false, objetivo:true,  tasa:true  },\n    aportacion:    { mensual:false, plazo:true,  objetivo:true,  tasa:true  },\n    rentabilidad:  { mensual:true,  plazo:true,  objetivo:true,  tasa:false }\n  };\n\n  function syncPair(range, num, callback){\n    range.addEventListener('input', () => { num.value = range.value; callback(); });\n    num.addEventListener('input', () => {\n      let v = parseFloat(num.value);\n      if(isNaN(v)) v = 0;\n      if(range.max && v > parseFloat(range.max)) range.max = v;\n      range.value = v;\n      callback();\n    });\n  }\n\n  const formatter = new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 });\n  const fmt = n => formatter.format(Math.round(n));\n\n  let chart;\n\n  function cambiarModo(nuevoModo){\n    modo = nuevoModo;\n\n    tabCapital.classList.toggle('active', modo === 'capital');\n    tabTiempo.classList.toggle('active', modo === 'tiempo');\n    tabAportacion.classList.toggle('active', modo === 'aportacion');\n    tabRentabilidad.classList.toggle('active', modo === 'rentabilidad');\n\n    const campos = camposPorModo[modo];\n    fieldMensual.style.display = campos.mensual ? '' : 'none';\n    fieldPlazo.style.display = campos.plazo ? '' : 'none';\n    fieldObjetivo.style.display = campos.objetivo ? '' : 'none';\n    fieldTasa.style.display = campos.tasa ? '' : 'none';\n\n    resultsCapital.style.display = modo === 'capital' ? '' : 'none';\n    resultsTiempo.style.display = modo === 'tiempo' ? '' : 'none';\n    resultsAportacion.style.display = modo === 'aportacion' ? '' : 'none';\n    resultsRentabilidad.style.display = modo === 'rentabilidad' ? '' : 'none';\n\n    calcular();\n  }\n\n  tabCapital.addEventListener('click', () => cambiarModo('capital'));\n  tabTiempo.addEventListener('click', () => cambiarModo('tiempo'));\n  tabAportacion.addEventListener('click', () => cambiarModo('aportacion'));\n  tabRentabilidad.addEventListener('click', () => cambiarModo('rentabilidad'));\n\n  // Usado por los botones de la sección \"Elige qué quieres calcular\":\n  // abre la calculadora seleccionada dentro de esta misma página.\n  window.irACalculadora = function(nuevoModo){\n    document.getElementById('calculadora-app').style.display = '';\n    document.getElementById('calculadora-divider').style.display = 'flex';\n    cambiarModo(nuevoModo);\n    document.getElementById('calculadora-app').scrollIntoView({behavior:'smooth', block:'start'});\n  };\n\n  // Simula la evolución mes a mes hasta un número de años dado y devuelve\n  // arrays año a año, útil para ambos modos y para el gráfico.\n  function simular(inicial, mensual, tasaMensual, anios){\n    const labels = [0];\n    const dataAportado = [inicial];\n    const dataInteres = [0];\n    const dataTotal = [inicial];\n\n    let capital = inicial;\n    let totalAportado = inicial;\n\n    for(let year = 1; year <= anios; year++){\n      for(let m = 0; m < 12; m++){\n        capital = capital * (1 + tasaMensual) + mensual;\n        totalAportado += mensual;\n      }\n      labels.push(year);\n      dataAportado.push(Math.round(totalAportado));\n      dataTotal.push(Math.round(capital));\n      dataInteres.push(Math.round(capital - totalAportado));\n    }\n\n    return { labels, dataAportado, dataInteres, dataTotal, capitalFinal: capital, totalAportado };\n  }\n\n  function calcular(){\n    const inicial = parseFloat(numInicial.value) || 0;\n    const mensual = parseFloat(numMensual.value) || 0;\n    const tasaAnual = (parseFloat(numTasa.value) || 0) / 100;\n    const tasaMensual = tasaAnual / 12;\n\n    if(modo === 'capital'){\n      const anios = parseInt(numPlazo.value) || 0;\n      const r = simular(inicial, mensual, tasaMensual, anios);\n\n      el('resTotal').textContent = fmt(r.capitalFinal);\n      el('resAportado').textContent = fmt(r.totalAportado);\n      el('resInteres').textContent = fmt(r.capitalFinal - r.totalAportado);\n\n      updateChart(r.labels, r.dataAportado, r.dataInteres);\n\n    } else if(modo === 'aportacion'){\n      const anios = parseInt(numPlazo.value) || 0;\n      const objetivo = parseFloat(numObjetivo.value) || 0;\n      const n = anios * 12;\n      const i = tasaMensual;\n\n      let mensualNecesaria;\n      if(n <= 0){\n        mensualNecesaria = 0;\n      } else if(i > 0){\n        const factorCrecimiento = Math.pow(1 + i, n);\n        const factorAnualidad = (factorCrecimiento - 1) / i;\n        mensualNecesaria = (objetivo - inicial * factorCrecimiento) / factorAnualidad;\n      } else {\n        mensualNecesaria = (objetivo - inicial) / n;\n      }\n\n      if(mensualNecesaria <= 0){\n        el('resMensualNecesaria').textContent = '0 €/mes';\n        el('avisoAportacion').textContent = 'Con tu depósito inicial y la rentabilidad estimada ya alcanzas el objetivo sin necesidad de aportar más.';\n        const r = simular(inicial, 0, tasaMensual, anios);\n        el('resAportadoNecesaria').textContent = fmt(r.totalAportado);\n        el('resInteresNecesaria').textContent = fmt(r.capitalFinal - r.totalAportado);\n        updateChart(r.labels, r.dataAportado, r.dataInteres);\n      } else {\n        el('avisoAportacion').textContent = `Aportando ${fmt(mensualNecesaria)} al mes alcanzarás ${fmt(objetivo)} en ${anios} años, con la rentabilidad estimada.`;\n        const r = simular(inicial, mensualNecesaria, tasaMensual, anios);\n        el('resMensualNecesaria').textContent = fmt(mensualNecesaria) + '/mes';\n        el('resAportadoNecesaria').textContent = fmt(r.totalAportado);\n        el('resInteresNecesaria').textContent = fmt(r.capitalFinal - r.totalAportado);\n        updateChart(r.labels, r.dataAportado, r.dataInteres);\n      }\n\n    } else if(modo === 'rentabilidad'){\n      const anios = parseInt(numPlazo.value) || 0;\n      const objetivo = parseFloat(numObjetivo.value) || 0;\n\n      const capitalConTasa = (tasaAnualProbada) => {\n        const iMensual = tasaAnualProbada / 12;\n        return simular(inicial, mensual, iMensual, anios);\n      };\n\n      const capitalCero = capitalConTasa(0).capitalFinal;\n\n      if(capitalCero >= objetivo){\n        el('resTasaNecesaria').textContent = '0 %';\n        el('avisoRentabilidad').textContent = 'Con tu depósito inicial y tu aportación mensual ya alcanzas el objetivo sin necesidad de rentabilidad.';\n        const r = capitalConTasa(0);\n        el('resAportadoRentabilidad').textContent = fmt(r.totalAportado);\n        el('resInteresRentabilidad').textContent = fmt(r.capitalFinal - r.totalAportado);\n        updateChart(r.labels, r.dataAportado, r.dataInteres);\n      } else {\n        let lo = 0, hi = 1; // 0% a 100% anual\n        let capitalHi = capitalConTasa(hi).capitalFinal;\n        let iter = 0;\n        while(capitalHi < objetivo && hi < 100 && iter < 60){\n          hi *= 2;\n          capitalHi = capitalConTasa(hi).capitalFinal;\n          iter++;\n        }\n\n        if(capitalHi < objetivo){\n          el('resTasaNecesaria').textContent = 'Más de 10.000 %';\n          el('avisoRentabilidad').textContent = 'Con estos datos, no existe una rentabilidad anual realista que alcance el objetivo en ese plazo. Prueba a aumentar el plazo o la aportación mensual.';\n          const r = capitalConTasa(hi);\n          el('resAportadoRentabilidad').textContent = fmt(r.totalAportado);\n          el('resInteresRentabilidad').textContent = fmt(r.capitalFinal - r.totalAportado);\n          updateChart(r.labels, r.dataAportado, r.dataInteres);\n        } else {\n          for(let k = 0; k < 60; k++){\n            const mid = (lo + hi) / 2;\n            const capitalMid = capitalConTasa(mid).capitalFinal;\n            if(capitalMid < objetivo) lo = mid; else hi = mid;\n          }\n          const tasaNecesaria = (lo + hi) / 2;\n          const r = capitalConTasa(tasaNecesaria);\n\n          el('resTasaNecesaria').textContent = (tasaNecesaria * 100).toFixed(2) + ' %';\n          el('avisoRentabilidad').textContent = `Necesitarías una rentabilidad anual media del ${(tasaNecesaria * 100).toFixed(2)}% para alcanzar ${fmt(objetivo)} en ${anios} años.`;\n          el('resAportadoRentabilidad').textContent = fmt(r.totalAportado);\n          el('resInteresRentabilidad').textContent = fmt(r.capitalFinal - r.totalAportado);\n          updateChart(r.labels, r.dataAportado, r.dataInteres);\n        }\n      }\n\n    } else {\n      const objetivo = parseFloat(numObjetivo.value) || 0;\n      const MAX_ANIOS = 100;\n\n      // Si ni siquiera con 100 años se alcanza el objetivo (o el objetivo ya\n      // está cubierto por el depósito inicial), gestionamos esos casos.\n      if(inicial >= objetivo){\n        el('resTiempo').textContent = '¡Ya lo tienes!';\n        el('resAportadoTiempo').textContent = fmt(inicial);\n        el('resInteresTiempo').textContent = fmt(0);\n        el('avisoObjetivo').textContent = 'Tu depósito inicial ya cubre el objetivo marcado.';\n        updateChart([0], [inicial], [0]);\n        return;\n      }\n\n      let capital = inicial;\n      let totalAportado = inicial;\n      let mesesTotales = 0;\n      let alcanzado = false;\n\n      const labels = [0];\n      const dataAportado = [inicial];\n      const dataInteres = [0];\n\n      for(let year = 1; year <= MAX_ANIOS; year++){\n        for(let m = 0; m < 12; m++){\n          capital = capital * (1 + tasaMensual) + mensual;\n          totalAportado += mensual;\n          mesesTotales++;\n          if(capital >= objetivo && !alcanzado){\n            alcanzado = true;\n            break;\n          }\n        }\n        labels.push(year);\n        dataAportado.push(Math.round(totalAportado));\n        dataInteres.push(Math.round(capital - totalAportado));\n        if(alcanzado) break;\n      }\n\n      if(!alcanzado){\n        el('resTiempo').textContent = `Más de ${MAX_ANIOS} años`;\n        el('avisoObjetivo').textContent = 'Con estos datos, no alcanzarías el objetivo en un plazo razonable. Prueba a subir la aportación mensual o la rentabilidad estimada.';\n      } else {\n        const aniosCompletos = Math.floor(mesesTotales / 12);\n        const mesesRestantes = mesesTotales % 12;\n        el('resTiempo').textContent = mesesRestantes > 0\n          ? `${aniosCompletos} años y ${mesesRestantes} meses`\n          : `${aniosCompletos} años`;\n        el('avisoObjetivo').textContent = `Alcanzarás ${fmt(objetivo)} aproximadamente en ese plazo, manteniendo tu aportación y rentabilidad estimada.`;\n      }\n\n      el('resAportadoTiempo').textContent = fmt(totalAportado);\n      el('resInteresTiempo').textContent = fmt(capital - totalAportado);\n\n      updateChart(labels, dataAportado, dataInteres);\n    }\n  }\n\n  function updateTabla(labels, dataAportado, dataInteres){\n    const tbody = el('tablaBody');\n    tbody.innerHTML = '';\n    const lastIndex = labels.length - 1;\n\n    labels.forEach((year, i) => {\n      const aportado = dataAportado[i];\n      const interes = dataInteres[i];\n      const total = aportado + interes;\n\n      const tr = document.createElement('tr');\n      if(i === lastIndex) tr.classList.add('row-final');\n\n      tr.innerHTML = `\n        <td>${year === 0 ? 'Inicio' : 'Año ' + year}</td>\n        <td class=\"col-aportado\">${fmt(aportado)}</td>\n        <td class=\"col-interes\">${fmt(interes)}</td>\n        <td class=\"col-total\">${fmt(total)}</td>\n      `;\n      tbody.appendChild(tr);\n    });\n  }\n\n  function updateChart(labels, dataAportado, dataInteres){\n    updateTabla(labels, dataAportado, dataInteres);\n    const ctx = document.getElementById('chart').getContext('2d');\n    if(chart){\n      chart.data.labels = labels;\n      chart.data.datasets[0].data = dataAportado;\n      chart.data.datasets[1].data = dataInteres;\n      chart.update();\n      return;\n    }\n    chart = new Chart(ctx, {\n      type: 'bar',\n      data: {\n        labels: labels,\n        datasets: [\n          {\n            label: 'Dinero Aportado',\n            data: dataAportado,\n            backgroundColor: '#0ea5e9',\n            borderRadius: 6,\n            stack: 'stack0'\n          },\n          {\n            label: 'Intereses Generados',\n            data: dataInteres,\n            backgroundColor: '#10b981',\n            borderRadius: 6,\n            stack: 'stack0'\n          }\n        ]\n      },\n      options: {\n        responsive: true,\n        maintainAspectRatio: false,\n        interaction: { mode: 'index', intersect: false },\n        plugins: {\n          legend: { position: 'bottom', labels: { usePointStyle:true, padding:20, font:{size:12} } },\n          tooltip: {\n            callbacks: {\n              label: function(context){\n                return context.dataset.label + ': ' + fmt(context.raw);\n              }\n            }\n          }\n        },\n        scales: {\n          x: {\n            title: { display:true, text:'Año' },\n            stacked: true,\n            grid: { display:false }\n          },\n          y: {\n            stacked: true,\n            ticks: {\n              callback: value => fmt(value)\n            },\n            grid: { color:'#f0f0f0' }\n          }\n        }\n      }\n    });\n  }\n\n  syncPair(rangeInicial, numInicial, calcular);\n  syncPair(rangeMensual, numMensual, calcular);\n  syncPair(rangePlazo, numPlazo, calcular);\n  syncPair(rangeObjetivo, numObjetivo, calcular);\n  syncPair(rangeTasa, numTasa, calcular);\n\n  const modoInicial = \"__MODO_INICIAL__\" || new URLSearchParams(window.location.search).get('modo');\n  const modosValidos = ['capital','tiempo','aportacion','rentabilidad'];\n\n  if(modosValidos.includes(modoInicial)){\n    document.getElementById('calculadora-app').style.display = '';\n    document.getElementById('calculadora-divider').style.display = 'flex';\n    cambiarModo(modoInicial);\n  }\n\n  // ---- Auto-ajuste de altura para cuando esta pagina vive dentro de un <iframe> ----\n  // Informa al documento padre de la altura real del contenido para que el iframe\n  // pueda ajustarse dinamicamente (evita huecos en blanco o contenido cortado en movil).\n  function enviarAltura(){\n    var h = document.documentElement.scrollHeight;\n    if(window.parent) window.parent.postMessage({ tipo:'calculadora-altura', altura:h }, '*');\n  }\n  if(window.ResizeObserver){\n    new ResizeObserver(enviarAltura).observe(document.body);\n  } else {\n    window.addEventListener('resize', enviarAltura);\n  }\n  window.addEventListener('load', enviarAltura);\n  setTimeout(enviarAltura, 100);\n  setTimeout(enviarAltura, 500);\n  setTimeout(enviarAltura, 1500);\n<\/script>\n</body>\n</html>\n";

/* ============================================================
   BLOG — artículos editoriales para cumplir requisitos de AdSense
   (contenido textual real, indexable, editable sin tocar código)
   ============================================================ */
const BLOG_ADMIN_EMAIL = "soportemoneypilot@gmail.com";
function slugify(s) {
  return (s || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function fmtFecha(d) {
  try {
    return new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return '';
  }
}
function escHtml(s) {
  return (s || '').replace(/[&<>]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  })[c]);
}
// Conversor Markdown -> HTML minimalista (sin dependencias externas): soporta
// ## subtítulos, negritas **texto**, listas con "- " y párrafos normales.
function mdToHtml(md) {
  const lineas = (md || '').split('\n');
  let html = '';
  let enLista = false;
  for (let raw of lineas) {
    const linea = raw.trim();
    const encabezado = linea.match(/^#{1,6}\s*(.+)$/);
    if (encabezado) {
      if (enLista) {
        html += '</ul>';
        enLista = false;
      }
      html += `<h2 style="font-size:1.35rem;font-weight:800;margin:28px 0 12px;color:inherit;">${escHtml(encabezado[1])}</h2>`;
    } else if (linea.startsWith('- ')) {
      if (!enLista) {
        html += '<ul>';
        enLista = true;
      }
      html += `<li>${escHtml(linea.slice(2)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`;
    } else if (linea === '') {
      if (enLista) {
        html += '</ul>';
        enLista = false;
      }
    } else {
      if (enLista) {
        html += '</ul>';
        enLista = false;
      }
      html += `<p>${escHtml(linea).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>`;
    }
  }
  if (enLista) html += '</ul>';
  return html;
}
function Blog({
  user
}) {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [slugAbierto, setSlugAbierto] = useState(null);
  const [editando, setEditando] = useState(null); // null | {} (nuevo) | post existente
  const esAdmin = !!(user && user.email && user.email.toLowerCase() === BLOG_ADMIN_EMAIL.toLowerCase());
  async function cargar() {
    setCargando(true);
    let query = supa.from('posts').select('*').order('created_at', {
      ascending: false
    });
    if (!esAdmin) query = query.eq('published', true);
    const {
      data
    } = await query;
    setPosts(data || []);
    setCargando(false);
  }
  useEffect(() => {
    cargar();
  }, [esAdmin]);
  async function guardar(e) {
    e.preventDefault();
    const f = e.target;
    const payload = {
      title: f.title.value.trim(),
      slug: f.slug.value.trim() || slugify(f.title.value),
      excerpt: f.excerpt.value.trim(),
      content: f.content.value,
      category: f.category.value.trim() || 'General',
      author: f.author.value.trim() || 'Equipo MoneyPilot',
      cover_emoji: f.cover_emoji.value.trim() || '📊',
      published: f.published.checked,
      updated_at: new Date().toISOString()
    };
    let error;
    if (editando && editando.id) {
      ({
        error
      } = await supa.from('posts').update(payload).eq('id', editando.id));
    } else {
      ({
        error
      } = await supa.from('posts').insert(payload));
    }
    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }
    setEditando(null);
    cargar();
  }
  async function borrar(id) {
    if (!confirm('¿Borrar este artículo? No se puede deshacer.')) return;
    await supa.from('posts').delete().eq('id', id);
    cargar();
  }
  const post = slugAbierto ? posts.find(p => p.slug === slugAbierto) : null;
  if (post) {
    return /*#__PURE__*/React.createElement("div", {
      className: "max-w-3xl mx-auto px-4 sm:px-6 py-12"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setSlugAbierto(null),
      className: "text-sm font-bold mb-6",
      style: {
        color: C.sand
      }
    }, "← Volver al blog"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold uppercase mb-1",
      style: {
        color: C.mej,
        letterSpacing: "0.1em"
      }
    }, post.category || 'General'), /*#__PURE__*/React.createElement("h1", {
      className: "font-serif text-3xl font-bold mb-2",
      style: {
        color: C.ink
      }
    }, post.title), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mb-8",
      style: {
        color: C.muted
      }
    }, "Por ", post.author || 'Equipo MoneyPilot', " · ", fmtFecha(post.created_at)), /*#__PURE__*/React.createElement("div", {
      className: "prose-blog",
      style: {
        color: C.ink,
        lineHeight: 1.75
      },
      dangerouslySetInnerHTML: {
        __html: mdToHtml(post.content)
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "mt-10 p-5 rounded-2xl text-sm",
      style: {
        backgroundColor: C.sandLight,
        color: C.navy
      }
    }, "¿Quieres aplicar esto a tu propio caso? Usa el ", /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setSlugAbierto(null);
      },
      className: "font-bold underline"
    }, "diagnóstico gratuito de MoneyPilot"), " arriba en el menú."));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto px-4 sm:px-6 py-12"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Educación financiera"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-3xl sm:text-4xl font-bold mb-2",
    style: {
      color: C.ink
    }
  }, "Blog de finanzas personales"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mb-8",
    style: {
      color: C.muted
    }
  }, "Guías claras sobre ahorro, inversión y presupuesto, además de noticias financieras y análisis de empresas cotizadas, escritas por el equipo de MoneyPilot."), esAdmin && /*#__PURE__*/React.createElement("div", {
    className: "mb-8 p-4 rounded-2xl border",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold",
    style: {
      color: C.muted
    }
  }, "Sesión de administrador — puedes escribir artículos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditando({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      author: '',
      cover_emoji: '📊',
      published: false
    }),
    className: "text-xs font-bold px-3 py-1.5 rounded-lg",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "+ Nuevo artículo"))), editando && /*#__PURE__*/React.createElement("form", {
    onSubmit: guardar,
    className: "mb-10 p-5 rounded-2xl border space-y-3",
    style: {
      borderColor: C.border,
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-serif font-bold",
    style: {
      color: C.ink
    }
  }, editando.id ? 'Editar artículo' : 'Nuevo artículo'), /*#__PURE__*/React.createElement("input", {
    name: "title",
    defaultValue: editando.title,
    placeholder: "Título",
    required: true,
    className: "w-full border rounded-lg px-3 py-2 text-sm",
    style: {
      borderColor: C.border
    }
  }), /*#__PURE__*/React.createElement("input", {
    name: "slug",
    defaultValue: editando.slug,
    placeholder: "url-del-articulo (opcional, se genera solo)",
    className: "w-full border rounded-lg px-3 py-2 text-sm",
    style: {
      borderColor: C.border
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("input", {
    name: "category",
    defaultValue: editando.category,
    placeholder: "Categoría",
    className: "border rounded-lg px-3 py-2 text-sm",
    style: {
      borderColor: C.border
    }
  }), /*#__PURE__*/React.createElement("input", {
    name: "cover_emoji",
    defaultValue: editando.cover_emoji,
    placeholder: "Emoji",
    className: "border rounded-lg px-3 py-2 text-sm",
    style: {
      borderColor: C.border
    }
  })), /*#__PURE__*/React.createElement("input", {
    name: "author",
    defaultValue: editando.author,
    placeholder: "Autor",
    className: "w-full border rounded-lg px-3 py-2 text-sm",
    style: {
      borderColor: C.border
    }
  }), /*#__PURE__*/React.createElement("textarea", {
    name: "excerpt",
    defaultValue: editando.excerpt,
    placeholder: "Resumen corto",
    rows: "2",
    className: "w-full border rounded-lg px-3 py-2 text-sm",
    style: {
      borderColor: C.border
    }
  }), /*#__PURE__*/React.createElement("textarea", {
    name: "content",
    defaultValue: editando.content,
    placeholder: "Contenido — usa ## para subtítulos y líneas normales para párrafos",
    rows: "12",
    className: "w-full border rounded-lg px-3 py-2 text-sm font-mono",
    style: {
      borderColor: C.border
    }
  }), /*#__PURE__*/React.createElement("label", {
    className: "flex items-center gap-2 text-sm",
    style: {
      color: C.ink
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    name: "published",
    defaultChecked: editando.published
  }), " Publicado"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "text-xs font-bold px-4 py-2 rounded-lg",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Guardar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setEditando(null),
    className: "text-xs font-bold px-4 py-2 rounded-lg",
    style: {
      backgroundColor: C.sandLight,
      color: C.navy
    }
  }, "Cancelar"))), cargando ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm",
    style: {
      color: C.muted
    }
  }, "Cargando artículos…") : posts.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-sm",
    style: {
      color: C.muted
    }
  }, esAdmin ? 'Aún no has publicado ningún artículo. Crea el primero.' : 'Muy pronto publicaremos aquí guías de ahorro e inversión.') : /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, posts.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "border rounded-2xl p-5",
    style: {
      borderColor: C.border,
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-3xl"
  }, p.cover_emoji || '📊'), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold uppercase mb-1",
    style: {
      color: C.mej
    }
  }, p.category || 'General', !p.published && ' · Borrador'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSlugAbierto(p.slug),
    className: "font-serif font-bold text-lg text-left",
    style: {
      color: C.ink
    }
  }, p.title), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-1",
    style: {
      color: C.muted
    }
  }, p.excerpt), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-2",
    style: {
      color: C.mutedLight
    }
  }, p.author || 'Equipo MoneyPilot', " · ", fmtFecha(p.created_at)), esAdmin && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 flex gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditando(p),
    className: "text-xs font-bold",
    style: {
      color: C.sand
    }
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => borrar(p.id),
    className: "text-xs font-bold",
    style: {
      color: C.crit
    }
  }, "Borrar"))))))));
}
function PaginaLegal({
  titulo,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl mx-auto px-4 sm:px-6 py-12",
    style: {
      color: C.ink,
      lineHeight: 1.75
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-2xl font-bold mb-1"
  }, titulo), /*#__PURE__*/React.createElement("p", {
    className: "text-xs mb-6",
    style: {
      color: C.mutedLight
    }
  }, "Última actualización: 1 de septiembre de 2026"), /*#__PURE__*/React.createElement("div", {
    className: "text-sm space-y-4"
  }, children));
}
function Contacto() {
  const [nombre, setNombre] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const enviar = e => {
    e.preventDefault();
    const cuerpo = `Nombre: ${nombre}\n\n${mensaje}`;
    const url = `mailto:soportemoneypilot@gmail.com?subject=${encodeURIComponent(asunto || "Contacto desde MoneyPilot")}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = url;
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl mx-auto px-4 sm:px-6 py-12"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Estamos para ayudarte"), /*#__PURE__*/React.createElement("h1", {
    className: "font-serif text-3xl sm:text-4xl font-bold mb-3",
    style: {
      color: C.ink
    }
  }, "Contacta con nosotros"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mb-6",
    style: {
      color: C.muted
    }
  }, "¿Tienes dudas sobre algún concepto financiero, quieres comentarnos algo sobre tus objetivos o simplemente hablar con alguien sobre cómo usar mejor la herramienta? Escríbenos y te respondemos personalmente."), /*#__PURE__*/React.createElement("div", {
    className: "mb-6 p-4 rounded-2xl text-sm",
    style: {
      backgroundColor: C.sandLight,
      color: C.navy
    }
  }, /*#__PURE__*/React.createElement("b", null, "Antes de escribirnos, un aviso importante:"), " no somos asesores financieros y no ofrecemos asesoramiento de inversión personalizado. Podemos ayudarte a entender conceptos, resolver dudas sobre cómo usar MoneyPilot, o darte una orientación general — pero cualquier decisión financiera concreta (qué invertir, cuánto arriesgar, etc.) debe tomarla cada persona valorando su propia situación, y si es una decisión importante, lo recomendable es consultar con un profesional cualificado y colegiado."), /*#__PURE__*/React.createElement("form", {
    onSubmit: enviar,
    className: "space-y-3 p-5 rounded-2xl border",
    style: {
      borderColor: C.border,
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Tu nombre"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: nombre,
    onChange: e => setNombre(e.target.value),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Asunto"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Ej: Duda sobre el fondo de emergencia",
    value: asunto,
    onChange: e => setAsunto(e.target.value),
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-bold mb-1",
    style: {
      color: C.ink
    }
  }, "Tu mensaje"), /*#__PURE__*/React.createElement("textarea", {
    required: true,
    rows: "6",
    value: mensaje,
    onChange: e => setMensaje(e.target.value),
    placeholder: "Cuéntanos qué necesitas, tu duda o tu objetivo…",
    className: "w-full rounded-lg px-3 py-2 text-sm border outline-none",
    style: {
      borderColor: C.border,
      color: C.ink,
      backgroundColor: C.paper
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2.5 rounded-lg text-sm font-bold",
    style: {
      backgroundColor: C.navy,
      color: C.white
    }
  }, "Enviar mensaje"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-center",
    style: {
      color: C.mutedLight
    }
  }, "Esto abrirá tu programa de correo con el mensaje ya redactado. También puedes escribirnos directamente a ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:soportemoneypilot@gmail.com",
    style: {
      color: C.sand,
      textDecoration: "underline"
    }
  }, "soportemoneypilot@gmail.com"), ".")));
}
function App() {
  const {
    ready,
    savedState,
    save,
    clear
  } = useDatosPersistidos();
  const {
    user,
    authReady,
    signUp,
    signIn,
    signOut
  } = useAuth();
  const [vistaActual, setVistaActual] = useState('inicio');
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [vistaActual]);

  // Altura real del iframe de "Prueba nuestras calculadoras", recibida por
  // postMessage desde dentro del propio iframe (ver enviarAltura() en
  // CALCULADORA_DOCUMENTO). Evita huecos en blanco o contenido cortado en movil.
  const [alturaCalculadora, setAlturaCalculadora] = useState(1400);
  const [modoRecomendado, setModoRecomendado] = useState("");
  useEffect(() => {
    function onMessage(e) {
      if (e && e.data && e.data.tipo === 'calculadora-altura' && typeof e.data.altura === 'number') {
        setAlturaCalculadora(Math.max(600, e.data.altura));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  // Modo de calculadora recomendado por el asistente "¿No sabes cuál usar?".
  // Cuando tiene valor, se inyecta como modo inicial dentro del iframe.
  const [modoCalculadoraRecomendado, setModoCalculadoraRecomendado] = useState(null);
  const [datos, setDatos] = useState(datosVacios());
  const [perfil, setPerfil] = useState(null);
  const [perfilDetalle, setPerfilDetalle] = useState(null);
  const [quizState, setQuizState] = useState({
    respuestas: {},
    currentQuestionId: "edad",
    questionPath: ["edad"],
    paso: 0,
    terminado: false,
    resultado: null
  });
  const [sim, setSim] = useState({
    inicial: 0,
    mensual: 0,
    tasa: 6,
    horizonte: 0,
    objetivoId: null
  });
  const [objetivoSeleccionadoId, setObjetivoSeleccionadoId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFooterNotice, setShowFooterNotice] = useState(true);
  const {
    toast,
    show: showToast
  } = useToast();
  const [hydrated, setHydrated] = useState(false);
  const {
    cloudReady,
    registrarSnapshotNube
  } = useCloudSync({
    user,
    datos,
    setDatos,
    perfil,
    setPerfil,
    perfilDetalle,
    setPerfilDetalle,
    sim,
    setSim,
    setObjetivoSeleccionadoId,
    quizState,
    setQuizState,
    historial,
    setHistorial,
    onSaved: showToast
  });
  useEffect(() => {
    if (!ready) return;
    if (savedState && savedState.datos) {
      const datosRestaurados = {
        ...savedState.datos
      };
      const objetivosRestaurados = normalizarObjetivos(datosRestaurados);
      datosRestaurados.objetivos = objetivosRestaurados;
      datosRestaurados.objetivo = objetivoLegadoDesdeColeccion(objetivosRestaurados);
      setDatos(datosRestaurados);
      const quizGuardado = savedState.quizState || {
        respuestas: {},
        paso: 0,
        terminado: false,
        resultado: null
      };
      const quizRestaurado = reconstruirEstadoQuiz(quizGuardado, datosRestaurados);
      const resultadoGuardado = quizRestaurado.terminado ? calcularPerfilMultidimensional(quizRestaurado.respuestas, datosRestaurados) : savedState.perfilDetalle || quizRestaurado.resultado || null;
      setPerfil(resultadoGuardado?.perfil || savedState.perfil || null);
      setPerfilDetalle(resultadoGuardado);
      setSim(savedState.sim || {
        inicial: 0,
        mensual: 0,
        tasa: 6,
        horizonte: 0,
        objetivoId: null
      });
      setObjetivoSeleccionadoId(savedState.sim?.objetivoId || null);
      setQuizState({
        ...quizRestaurado,
        resultado: resultadoGuardado
      });
      setHistorial(savedState.historial || []);
    }
    setHydrated(true);
  }, [ready, savedState]);
  useDebouncedEffect(() => {
    if (!hydrated) return;
    if (datos.ingresos <= 0 && historial.length === 0) return;
    save({
      datos,
      perfil,
      perfilDetalle,
      sim,
      quizState,
      historial
    }).then(() => {
      if (!user) showToast("Guardado en este dispositivo");
    });
  }, [datos, perfil, perfilDetalle, sim, quizState, historial, hydrated]);
  const snapshotDone = useRef(false);
  useEffect(() => {
    if (!hydrated || snapshotDone.current || datos.ingresos <= 0) return;
    snapshotDone.current = true;
    const cuotasDeuda = calcularCapacidadFinanciera(datos).cuotasDeuda;
    const gasto = totalMensual(datos.gastosFijos) + totalMensual(datos.gastosDiscrecionales) + cuotasDeuda;
    const ratio = datos.ingresos > 0 ? (datos.ingresos - gasto) / datos.ingresos : 0;
    setHistorial(prev => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.ratio - ratio) < 0.001) return prev;
      return [...prev, {
        ratio,
        ts: Date.now()
      }].slice(-20);
    });
    registrarSnapshotNube(ratio);
  }, [hydrated, datos.ingresos, datos.gastosFijos, datos.gastosDiscrecionales, datos.deudas]);
  const reiniciar = async () => {
    await clear();
    setDatos(datosVacios());
    setPerfil(null);
    setPerfilDetalle(null);
    setSim({
      inicial: 0,
      mensual: 0,
      tasa: 6,
      horizonte: 0,
      objetivoId: null
    });
    setObjetivoSeleccionadoId(null);
    setQuizState({
      respuestas: {},
      currentQuestionId: "edad",
      questionPath: ["edad"],
      paso: 0,
      terminado: false,
      resultado: null
    });
    setHistorial([]);
    snapshotDone.current = false;
    setVistaActual('inicio');
  };
  const capacidadFinanciera = calcularCapacidadFinanciera(datos);
  const cuotasDeuda = capacidadFinanciera.cuotasDeuda;
  const gastoTotal = totalMensual(datos.gastosFijos) + totalMensual(datos.gastosDiscrecionales) + cuotasDeuda;
  const ahorroDisponible = capacidadFinanciera.capacidadMensual == null ? 0 : capacidadFinanciera.capacidadMensual;
  const ratioAhorro = capacidadFinanciera.ingresos > 0 ? ahorroDisponible / capacidadFinanciera.ingresos : 0;
  const planObjetivos = useMemo(() => calcularPlanObjetivos(datos), [datos]);
  useEffect(() => {
    if (!hydrated) return;
    if (sim.objetivoId || sim.inicial !== 0 || sim.mensual !== 0) return;
    setSim({
      inicial: Number(datos.ahorroActual) > 0 ? Number(datos.ahorroActual) : 0,
      mensual: ahorroDisponible > 0 ? ahorroDisponible : 0,
      tasa: perfil ? PERFILES_INFO[perfil].rentabilidad : 6,
      horizonte: 0,
      objetivoId: null
    });
  }, [hydrated, datos.ahorroActual, ahorroDisponible, perfil]);
  if (!ready || !hydrated) {
    /* FASE 2: antes era backgroundColor:C.navy a pantalla completa — el único
       punto de toda la app donde el usuario veía un fondo oscuro sólido antes
       de que cargara nada claro. Ahora usa --surface-0, coherente con el resto. */
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen w-full flex items-center justify-center",
      style: {
        backgroundColor: C.bgDeep
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-bold animate-pulse",
      style: {
        color: C.sand
      }
    }, "Cargando…"));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen w-full relative no-print",
    style: {
      backgroundColor: C.bgDeep
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 pointer-events-none",
    style: {
      background: "radial-gradient(120% 100% at 50% -10%, rgba(49,46,129,0.06) 0%, rgba(49,46,129,0.10) 60%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 pointer-events-none",
    style: {
      backgroundImage: `url(${PATTERN_URI_STATIC})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.35,
      mixBlendMode: "multiply"
    }
  }), /*#__PURE__*/React.createElement("header", {
    className: "glass-nav sticky top-0 z-50",
    style: {
      backgroundColor: "rgba(6,10,19,0.88)",
      borderBottom: "1px solid " + C.glassBorder,
      boxShadow: "0 8px 24px -12px rgba(0,0,0,0.6)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between flex-wrap gap-y-2 py-2 gap-x-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('inicio'),
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-7 h-7 rounded-full flex items-center justify-center",
    style: {
      backgroundColor: C.sand
    }
  }, /*#__PURE__*/React.createElement(I.chartLine, {
    size: 14,
    color: C.navy
  })), /*#__PURE__*/React.createElement("span", {
    className: "font-serif font-bold text-sm",
    style: {
      color: C.white
    }
  }, "MoneyPilot")), /*#__PURE__*/React.createElement("nav", {
    className: "hidden md:flex items-center gap-1 text-xs font-bold flex-wrap"
  }, [["inicio", "Introducción"], ["diagnostico", "Diagnóstico"], ["estrategia", "Estrategia"], ["simulador", "Simulador"], ["blog", "Blog"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setVistaActual(id),
    className: "px-3 py-2 rounded-lg transition-colors hover:bg-white/10 " + (vistaActual === id ? "nav-link-active" : "nav-link-muted"),
    style: vistaActual === id ? {
      color: C.sand,
      borderBottom: "2px solid " + C.sand
    } : {}
  }, label)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual("calculadoras"),
    className: "shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Prueba nuestras calculadoras")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, authReady && (user ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hidden xl:inline text-xs font-bold max-w-40 truncate nav-link-muted"
  }, user.email), /*#__PURE__*/React.createElement("button", {
    onClick: signOut,
    className: "text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted whitespace-nowrap"
  }, "Cerrar sesión")) : /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAuthModal(true),
    className: "text-xs font-bold px-3 py-1.5 rounded-lg",
    style: {
      backgroundColor: C.sand,
      color: C.navy
    }
  }, "Guardar")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFeedbackModal(true),
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 whitespace-nowrap",
    style: {
      color: C.sand
    },
    title: "Evaluar página"
  }, /*#__PURE__*/React.createElement(I.clipboard, {
    size: 14
  }), "Evaluar"), /*#__PURE__*/React.createElement("button", {
    onClick: reiniciar,
    "aria-label": "Borrar datos y empezar de nuevo",
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-white/10 nav-link-muted",
    title: "Borra tus datos guardados y vuelve a empezar"
  }, /*#__PURE__*/React.createElement(I.trash, {
    size: 13
  })))), /*#__PURE__*/React.createElement("div", {
    className: "md:hidden flex gap-1 overflow-x-auto pb-2 -mx-1 px-1"
  }, [["inicio", "Introducción"], ["diagnostico", "Diagnóstico"], ["estrategia", "Estrategia"], ["simulador", "Simulador"], ["blog", "Blog"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setVistaActual(id),
    className: "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold " + (vistaActual === id ? "nav-link-active" : "nav-link-muted"),
    style: vistaActual === id ? {
      backgroundColor: "rgba(79,70,229,.16)",
      color: C.sand
    } : {
      backgroundColor: "rgba(255,255,255,.04)"
    }
  }, label)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual("calculadoras"),
    className: "shrink-0 inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Prueba nuestras calculadoras")))), /*#__PURE__*/React.createElement("main", {
    className: "relative z-10"
  }, vistaActual === 'inicio' && /*#__PURE__*/React.createElement("div", {
    key: "inicio",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(HeroSection, {
    onStart: () => setVistaActual('diagnostico')
  }), /*#__PURE__*/React.createElement(ConfianzaPrivacidad, null)), vistaActual === 'diagnostico' && /*#__PURE__*/React.createElement("div", {
    key: "diagnostico",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Diagnostico, {
    datos: datos,
    setDatos: setDatos,
    objetivoSeleccionadoId: objetivoSeleccionadoId,
    onEliminarSeleccionado: () => {
      setObjetivoSeleccionadoId(null);
      setSim({
        ...sim,
        objetivoId: null
      });
    },
    onFinalizar: () => {
      setVistaActual('estrategia');
    }
  })), vistaActual === 'estrategia' && /*#__PURE__*/React.createElement("div", {
    key: "estrategia",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 space-y-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Resultados y estrategia"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "Tu salud financiera, en una sola vista"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Aquí se concentran las métricas clave, el perfil de riesgo y las decisiones que puedes tomar a continuación.")), /*#__PURE__*/React.createElement(Dashboard, {
    planObjetivos: planObjetivos,
    objetivos: normalizarObjetivos(datos),
    ingresos: capacidadFinanciera.ingresos,
    gastoTotal: gastoTotal,
    ahorroDisponible: ahorroDisponible,
    ratioAhorro: ratioAhorro,
    ahorroActual: datos.ahorroActual,
    cargaDeuda: capacidadFinanciera.ingresos > 0 ? cuotasDeuda / capacidadFinanciera.ingresos : 0,
    perfil: perfil,
    historial: historial,
    user: user,
    onOpenAuth: () => setShowAuthModal(true)
  }), datos.deudas.some(d => Number(d.pendiente) > 0) && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-5 section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Plan de amortización"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-2xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, "Sal de la deuda con un orden claro")), /*#__PURE__*/React.createElement(AmortizacionDeuda, {
    deudas: datos.deudas
  })), /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-5 sm:p-6",
    style: {
      backgroundColor: "rgba(79,70,229,.06)",
      border: "1px solid rgba(79,70,229,.14)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
    style: {
      backgroundColor: C.surface
    }
  }, /*#__PURE__*/React.createElement(I.target, {
    size: 18,
    color: C.sand
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Del objetivo a la estrategia"), /*#__PURE__*/React.createElement("h3", {
    className: "font-serif text-xl font-bold mt-1",
    style: {
      color: C.ink
    }
  }, planObjetivos.principal ? `Para “${planObjetivos.principal.nombre || OBJETIVOS_DEF.find(x => x.id === planObjetivos.principal.tipo)?.label || "tu objetivo"}”, evaluemos tu tolerancia al riesgo` : "Conectemos tus objetivos con tu perfil de riesgo"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2",
    style: {
      color: C.muted
    }
  }, planObjetivos.principal?.horizonteAniosCalculado > 0 ? `Tu horizonte es de ${planObjetivos.principal.horizonteAniosCalculado.toFixed(1)} años. El cuestionario combina ese plazo con tu tolerancia, liquidez y capacidad financiera para que la estrategia tenga sentido para tu situación.` : datos.deudas.some(d => Number(d.pendiente) > 0) ? "Con tu plan de deuda ya en marcha, veamos también qué nivel de riesgo encaja con tus objetivos y tu situación." : "El cuestionario no busca una etiqueta por sí sola: ayuda a entender qué nivel de riesgo encaja con tus objetivos y tu situación.")))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-6"
  }, /*#__PURE__*/React.createElement(PerfilRiesgo, {
    onPerfilCalculado: (nuevoPerfil, nuevoDetalle) => {
      setPerfil(nuevoPerfil);
      setPerfilDetalle(nuevoDetalle);
    },
    quizState: quizState,
    setQuizState: setQuizState,
    datos: datos
  }), /*#__PURE__*/React.createElement(Estrategia, {
    perfil: perfil,
    onGoToPerfil: () => setVistaActual('estrategia'),
    onGoToSimulador: () => setVistaActual('simulador'),
    setSim: setSim,
    ahorroDisponible: ahorroDisponible,
    datos: datos,
    onSeleccionarObjetivo: setObjetivoSeleccionadoId
  }))))), vistaActual === 'simulador' && /*#__PURE__*/React.createElement("div", {
    key: "simulador",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-16 sm:py-24 section-tinted"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl mb-10 section-intro"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Tu proyección personalizada"), /*#__PURE__*/React.createElement("h2", {
    className: "font-serif text-3xl sm:text-4xl font-bold mt-2",
    style: {
      color: C.ink
    }
  }, "¿Qué puede hacer tu ahorro con el tiempo?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm sm:text-base mt-3",
    style: {
      color: C.muted
    }
  }, "Este es el escenario calculado con tus propios datos: tu objetivo, tu ahorro y tu perfil de riesgo.")), /*#__PURE__*/React.createElement(Simulador, {
    sim: sim,
    setSim: setSim,
    objetivos: planObjetivos.objetivos,
    objetivoSeleccionadoId: objetivoSeleccionadoId || sim.objetivoId,
    onSeleccionarObjetivo: setObjetivoSeleccionadoId,
    ahorroDisponible: ahorroDisponible,
    perfil: perfil,
    onIrACalculadoras: () => setVistaActual("calculadoras")
  })))), vistaActual === 'calculadoras' && /*#__PURE__*/React.createElement("div", {
    key: "calculadoras",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement("section", {
    className: "py-8 sm:py-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('inicio'),
    className: "inline-flex items-center gap-2 text-sm font-bold nav-link-muted"
  }, "← Volver a MoneyPilot")), /*#__PURE__*/React.createElement(SelectorCalculadora, {
    onRecomendar: modo => {
      setModoRecomendado(modo);
      requestAnimationFrame(() => {
        document.getElementById('calculadora-iframe')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    }
  }), /*#__PURE__*/React.createElement("iframe", {
    id: "calculadora-iframe",
    key: modoRecomendado,
    title: "Prueba nuestras calculadoras",
    srcDoc: CALCULADORA_DOCUMENTO.replace('"__MODO_INICIAL__"', JSON.stringify(modoRecomendado || "")),
    style: {
      width: "100%",
      height: alturaCalculadora + "px",
      border: "0",
      display: "block",
      background: "#f5f6fa",
      transition: "height 150ms ease"
    }
  })))), vistaActual === 'blog' && /*#__PURE__*/React.createElement("div", {
    key: "blog",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Blog, {
    user: user
  })), vistaActual === 'privacidad' && /*#__PURE__*/React.createElement("div", {
    key: "privacidad",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Política de Privacidad"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "1. Responsable del tratamiento."), " Óscar Baca Martínez, particular residente en España, con contacto en soportemoneypilot@gmail.com, es el responsable de los datos tratados a través de MoneyPilot."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "2. Datos que recogemos."), " Los datos financieros que introduces voluntariamente en la herramienta (ingresos, gastos, ahorros) se usan únicamente para generar tu diagnóstico, además de datos técnicos de navegación (dirección IP, tipo de dispositivo, páginas visitadas) recogidos de forma automática."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "3. Cookies y publicidad."), " Este sitio utiliza cookies propias y de terceros, incluyendo Google AdSense, para mostrar anuncios personalizados según tus intereses. Google, como proveedor externo, utiliza cookies para publicar anuncios basados en tus visitas anteriores a este sitio o a otros sitios web. Puedes inhabilitar el uso de cookies de personalización de anuncios visitando la ", /*#__PURE__*/React.createElement("a", {
    href: "https://adssettings.google.com",
    target: "_blank",
    rel: "noopener",
    style: {
      color: C.sand,
      textDecoration: "underline"
    }
  }, "Configuración de anuncios de Google"), "."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "4. Finalidad del tratamiento."), " Los datos se usan para prestar el servicio solicitado, mejorar la experiencia de usuario y, en su caso, mostrar publicidad relevante a través de terceros como Google AdSense."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "5. Conservación de los datos."), " Los datos financieros que introduces se guardan en tu dispositivo y, si creas una cuenta, en la nube, únicamente mientras mantengas tu cuenta activa o decidas borrarlos tú mismo desde la propia aplicación."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "6. Derechos del usuario."), " Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición y portabilidad escribiendo a soportemoneypilot@gmail.com."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "7. Cambios en esta política."), " Esta política puede actualizarse para adaptarse a cambios legales o del servicio. Recomendamos revisarla periódicamente."))), vistaActual === 'aviso-legal' && /*#__PURE__*/React.createElement("div", {
    key: "aviso-legal",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Aviso Legal y Términos de Uso"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "1. Titular."), " MoneyPilot es un proyecto operado por Óscar Baca Martínez, particular residente en España, contacto: soportemoneypilot@gmail.com."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "2. Objeto."), " MoneyPilot es una herramienta informativa de educación financiera que permite analizar de forma orientativa la situación económica personal introducida por el usuario. No sustituye el asesoramiento de un profesional financiero, fiscal o legal."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "3. Ausencia de asesoramiento financiero."), " Los resultados, diagnósticos y recomendaciones generados por MoneyPilot son orientativos y educativos. No constituyen recomendación de inversión ni asesoramiento financiero personalizado bajo ninguna normativa. El usuario es el único responsable de las decisiones económicas que tome."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "4. Propiedad intelectual."), " Los contenidos, textos, diseño y código de esta web son propiedad de MoneyPilot salvo que se indique lo contrario, y no pueden reproducirse sin autorización."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "5. Publicidad."), " Esta web puede mostrar anuncios de terceros, incluido Google AdSense, para financiar el servicio gratuito."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "6. Legislación aplicable."), " Este aviso legal se rige por la legislación española."))), vistaActual === 'quienes-somos' && /*#__PURE__*/React.createElement("div", {
    key: "quienes-somos",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(PaginaLegal, {
    titulo: "Quiénes somos"
  }, /*#__PURE__*/React.createElement("p", null, "Detrás de MoneyPilot hay un proyecto nacido de una realidad muy común: la falta de educación financiera genera estrés crónico y decisiones equivocadas. Somos desarrolladores y entusiastas de las finanzas personales que creemos firmemente que la tecnología debe servir para democratizar el bienestar económico."), /*#__PURE__*/React.createElement("p", null, "MoneyPilot está creado y mantenido por Óscar Baca Martínez, estudiante de Economía y apasionado de los mercados financieros, con más de 2 años gestionando su propia cartera en acciones y otros productos financieros."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "Cuál es nuestro objetivo."), " Nuestro propósito no es darte una simple hoja de cálculo matemática, sino educar, dar contexto y crear un plan de acción. Queremos ayudarte a:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "disc",
      paddingLeft: "1.4rem"
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Comprar tranquilidad:"), " construyendo un escudo contra los imprevistos para blindar a tu familia y reducir tu ansiedad."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Salir de las deudas:"), " trazando planes exactos (como la bola de nieve o la avalancha) para que recuperes tu margen mensual."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "Poner el tiempo a tu favor:"), " demostrando con datos reales cómo el interés compuesto y las decisiones tempranas pueden multiplicar tu patrimonio sin que sientas que sacrificas tu calidad de vida actual.")), /*#__PURE__*/React.createElement("p", null, "En definitiva, nuestro objetivo es acompañarte para que dejes de sobrevivir a fin de mes y empieces a diseñar tu libertad financiera."), /*#__PURE__*/React.createElement("p", null, "Puedes escribirnos a ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:soportemoneypilot@gmail.com",
    style: {
      color: C.sand,
      textDecoration: "underline"
    }
  }, "soportemoneypilot@gmail.com"), " para cualquier duda, sugerencia o colaboración."))), vistaActual === 'contacto' && /*#__PURE__*/React.createElement("div", {
    key: "contacto",
    className: "fade-switch-enter"
  }, /*#__PURE__*/React.createElement(Contacto, null))), showFooterNotice && /*#__PURE__*/React.createElement("footer", {
    className: "relative z-10 border-t no-print",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "Recuerda: puedes evaluar esta página de forma ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: C.ink
    }
  }, "anónima"), ". Tu opinión nos ayuda a mejorar y la agradecemos de verdad."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFeedbackModal(true),
    className: "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0",
    style: {
      backgroundColor: C.sand,
      color: C.white
    }
  }, "Evaluar página"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowFooterNotice(false),
    "aria-label": "Cerrar aviso",
    className: "w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 shrink-0",
    style: {
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement(I.x, {
    size: 14
  }))))), /*#__PURE__*/React.createElement("footer", {
    className: "relative z-10 border-t no-print",
    style: {
      borderColor: C.border,
      backgroundColor: C.paper
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs",
    style: {
      color: C.mutedLight
    }
  }, /*#__PURE__*/React.createElement("span", null, "© ", new Date().getFullYear(), " MoneyPilot"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-center gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('blog'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Blog"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('privacidad'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Política de Privacidad"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('aviso-legal'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Aviso Legal"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('quienes-somos'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Quiénes somos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setVistaActual('contacto'),
    className: "hover:underline",
    style: {
      color: C.mutedLight
    }
  }, "Contacto")))), showAuthModal && /*#__PURE__*/React.createElement(AuthModal, {
    onClose: () => setShowAuthModal(false),
    onAuthSuccess: () => {
      setShowAuthModal(false);
      showToast("Sesión iniciada");
    },
    signUp: signUp,
    signIn: signIn
  }), showFeedbackModal && /*#__PURE__*/React.createElement(FeedbackModal, {
    onClose: () => setShowFeedbackModal(false)
  }), /*#__PURE__*/React.createElement(Toast, {
    toast: toast
  })), /*#__PURE__*/React.createElement(PrintSummary, {
    datos: datos,
    perfil: perfil,
    gastoTotal: gastoTotal,
    ahorroDisponible: ahorroDisponible,
    ratioAhorro: ratioAhorro
  }));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));