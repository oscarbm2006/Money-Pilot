const { useState, useEffect, useRef, useCallback, useMemo, useId } = React;


export const SUPABASE_URL = "https://yhxebtkxagxowrvrqssf.supabase.co";

export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeGVidGt4YWd4b3dydnJxc3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTc0MTMsImV4cCI6MjEwMzA5MzQxM30.Mt9vWxpTP-YnZp38qtBAuZVmMMKmIxIKyXA4ni4WZzM";

export const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const PATTERN_URI_STATIC = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAwIiBoZWlnaHQ9IjEwMDAiIHZpZXdCb3g9IjAgMCAxNjAwIDEwMDAiPgo8ZGVmcz4KPHJhZGlhbEdyYWRpZW50IGlkPSJnYmxvYiIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDIxNywxNzgsMTE4LDAuMTYpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJyZ2JhKDIxNywxNzgsMTE4LDApIi8+PC9yYWRpYWxHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJ0YmxvYiIgY3g9IjUwJSIgY3k9IjUwJSIgcj0iNTAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSJyZ2JhKDExMSwxOTAsMTc4LDAuMTYpIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJyZ2JhKDExMSwxOTAsMTc4LDApIi8+PC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8cG9seWdvbiBwb2ludHM9IjIyNC4wMCw2MC4wMCAyNzUuOTYsOTAuMDAgMjc1Ljk2LDE1MC4wMCAyMjQuMDAsMTgwLjAwIDE3Mi4wNCwxNTAuMDAgMTcyLjA0LDkwLjAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNzAiLz48cG9seWdvbiBwb2ludHM9IjIyNC4wMCwtMi4wMCAzMjkuNjYsNTkuMDAgMzI5LjY2LDE4MS4wMCAyMjQuMDAsMjQyLjAwIDExOC4zNCwxODEuMDAgMTE4LjM0LDU5LjAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNjEiLz48cG9seWdvbiBwb2ludHM9IjIyNC4wMCwtNjQuMDAgMzgzLjM1LDI4LjAwIDM4My4zNSwyMTIuMDAgMjI0LjAwLDMwNC4wMCA2NC42NSwyMTIuMDAgNjQuNjUsMjguMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC41MiIvPjxwb2x5Z29uIHBvaW50cz0iMjI0LjAwLC0xMjYuMDAgNDM3LjA0LC0zLjAwIDQzNy4wNCwyNDMuMDAgMjI0LjAwLDM2Ni4wMCAxMC45NiwyNDMuMDAgMTAuOTYsLTMuMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC40MyIvPjxwb2x5Z29uIHBvaW50cz0iMjI0LjAwLC0xODguMDAgNDkwLjc0LC0zNC4wMCA0OTAuNzQsMjc0LjAwIDIyNC4wMCw0MjguMDAgLTQyLjc0LDI3NC4wMCAtNDIuNzQsLTM0LjAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuMzQiLz48cG9seWdvbiBwb2ludHM9IjIyNC4wMCwtMjUwLjAwIDU0NC40MywtNjUuMDAgNTQ0LjQzLDMwNS4wMCAyMjQuMDAsNDkwLjAwIC05Ni40MywzMDUuMDAgLTk2LjQzLC02NS4wMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjI1Ii8+PHBvbHlnb24gcG9pbnRzPSIxNDkwLjEyLDgxMi4zOSAxNTM5LjYxLDg2MS44OCAxNTIxLjUwLDkyOS41MCAxNDUzLjg4LDk0Ny42MSAxNDA0LjM5LDg5OC4xMiAxNDIyLjUwLDgzMC41MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDExMSwxOTAsMTc4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjcwIi8+PHBvbHlnb24gcG9pbnRzPSIxNTA1LjEzLDc1Ni4zNiAxNTk1LjY0LDg0Ni44NyAxNTYyLjUxLDk3MC41MSAxNDM4Ljg3LDEwMDMuNjQgMTM0OC4zNiw5MTMuMTMgMTM4MS40OSw3ODkuNDkiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMTEsMTkwLDE3OCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC42MSIvPjxwb2x5Z29uIHBvaW50cz0iMTUyMC4xNCw3MDAuMzQgMTY1MS42Niw4MzEuODYgMTYwMy41MiwxMDExLjUyIDE0MjMuODYsMTA1OS42NiAxMjkyLjM0LDkyOC4xNCAxMzQwLjQ4LDc0OC40OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDExMSwxOTAsMTc4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjUyIi8+PHBvbHlnb24gcG9pbnRzPSIxNTM1LjE1LDY0NC4zMSAxNzA3LjY5LDgxNi44NSAxNjQ0LjUzLDEwNTIuNTMgMTQwOC44NSwxMTE1LjY5IDEyMzYuMzEsOTQzLjE1IDEyOTkuNDcsNzA3LjQ3IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTExLDE5MCwxNzgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNDMiLz48cG9seWdvbiBwb2ludHM9IjE1NTAuMTYsNTg4LjI5IDE3NjMuNzEsODAxLjg0IDE2ODUuNTUsMTA5My41NSAxMzkzLjg0LDExNzEuNzEgMTE4MC4yOSw5NTguMTYgMTI1OC40NSw2NjYuNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMTEsMTkwLDE3OCwwLjUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC4zNCIvPjxwb2x5Z29uIHBvaW50cz0iMTU2NS4xNyw1MzIuMjcgMTgxOS43Myw3ODYuODMgMTcyNi41NiwxMTM0LjU2IDEzNzguODMsMTIyNy43MyAxMTI0LjI3LDk3My4xNyAxMjE3LjQ0LDYyNS40NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDExMSwxOTAsMTc4LDAuNSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjI1Ii8+PHBvbHlnb24gcG9pbnRzPSIxNTgwLjE5LDQ3Ni4yNCAxODc1Ljc2LDc3MS44MSAxNzY3LjU3LDExNzUuNTcgMTM2My44MSwxMjgzLjc2IDEwNjguMjQsOTg4LjE5IDExNzYuNDMsNTg0LjQzIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTExLDE5MCwxNzgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuMTYiLz48cG9seWdvbiBwb2ludHM9IjEzNjUuNTcsNjAuMzkgMTM5Ny4wOSw4NS4wMiAxMzkxLjUyLDEyNC42MyAxMzU0LjQzLDEzOS42MSAxMzIyLjkxLDExNC45OCAxMzI4LjQ4LDc1LjM3IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC40NSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjcwIi8+PHBvbHlnb24gcG9pbnRzPSIxMzcxLjk3LDE0Ljg0IDE0MzkuNzQsNjcuNzggMTQyNy43NywxNTIuOTUgMTM0OC4wMywxODUuMTYgMTI4MC4yNiwxMzIuMjIgMTI5Mi4yMyw0Ny4wNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuNDUpIiBzdHJva2Utd2lkdGg9IjEuMyIgb3BhY2l0eT0iMC42MSIvPjxwb2x5Z29uIHBvaW50cz0iMTM3OC4zNywtMzAuNzIgMTQ4Mi4zOSw1MC41NSAxNDY0LjAyLDE4MS4yNyAxMzQxLjYzLDIzMC43MiAxMjM3LjYxLDE0OS40NSAxMjU1Ljk4LDE4LjczIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC40NSkiIHN0cm9rZS13aWR0aD0iMS4zIiBvcGFjaXR5PSIwLjUyIi8+PHBvbHlnb24gcG9pbnRzPSIxMzg0Ljc3LC03Ni4yNyAxNTI1LjA0LDMzLjMyIDE1MDAuMjcsMjA5LjU5IDEzMzUuMjMsMjc2LjI3IDExOTQuOTYsMTY2LjY4IDEyMTkuNzMsLTkuNTkiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjQ1KSIgc3Ryb2tlLXdpZHRoPSIxLjMiIG9wYWNpdHk9IjAuNDMiLz48ZWxsaXBzZSBjeD0iMjQwIiBjeT0iMTUwIiByeD0iMjYwIiByeT0iMjIwIiBmaWxsPSJ1cmwoI2dibG9iKSIvPjxlbGxpcHNlIGN4PSIxNDQwIiBjeT0iODUwIiByeD0iMzAwIiByeT0iMjUwIiBmaWxsPSJ1cmwoI3RibG9iKSIvPjxsaW5lIHgxPSIyODQuMCIgeTE9IjEyMC4wIiB4Mj0iOTUzLjIiIHkyPSI2MjguNiIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuMjIpIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMjc2LjAiIHkxPSIxNTAuMCIgeDI9Ijg2OC40IiB5Mj0iNjg3LjkiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjIyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PGxpbmUgeDE9IjI1NC4wIiB5MT0iMTcyLjAiIHgyPSI3NjUuMyIgeTI9IjY5Ny4wIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC4yMikiIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSIyMjQuMCIgeTE9IjE4MC4wIiB4Mj0iNjcxLjQiIHkyPSI2NTMuMiIgc3Ryb2tlPSJyZ2JhKDIxNywxNzgsMTE4LDAuMjIpIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMTk0LjAiIHkxPSIxNzIuMCIgeDI9IjYxMi4xIiB5Mj0iNTY4LjQiIHN0cm9rZT0icmdiYSgyMTcsMTc4LDExOCwwLjIyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTSAyMjQuMDAwMDAwMDAwMDAwMDMgMTA0LjAgTCAyMzguMDAwMDAwMDAwMDAwMDMgMTExLjAgTCAyMzguMDAwMDAwMDAwMDAwMDMgMTI0LjAgUSAyMzguMDAwMDAwMDAwMDAwMDMgMTM2LjAgMjI0LjAwMDAwMDAwMDAwMDAzIDE0Mi4wIFEgMjEwLjAwMDAwMDAwMDAwMDAzIDEzNi4wIDIxMC4wMDAwMDAwMDAwMDAwMyAxMjQuMCBMIDIxMC4wMDAwMDAwMDAwMDAwMyAxMTEuMCBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjE3LDE3OCwxMTgsMC41KSIgc3Ryb2tlLXdpZHRoPSIxLjgiLz48ZyBmaWxsPSJyZ2JhKDExMSwxOTAsMTc4LDAuNTUpIj48cmVjdCB4PSIxNDU2LjAiIHk9Ijg4Mi4wIiB3aWR0aD0iNyIgaGVpZ2h0PSIxNiIgcng9IjEuNSIvPjxyZWN0IHg9IjE0NjcuMCIgeT0iODcwLjAiIHdpZHRoPSI3IiBoZWlnaHQ9IjI4IiByeD0iMS41Ii8+PHJlY3QgeD0iMTQ3OC4wIiB5PSI4NjIuMCIgd2lkdGg9IjciIGhlaWdodD0iMzYiIHJ4PSIxLjUiLz48L2c+Cjwvc3ZnPg==";

export const C = {
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

export function Ico({
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

export const I = {
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

export const GASTOS_FIJOS_DEF = [{
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

export const GASTOS_DISC_DEF = [{
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

export const FRECUENCIAS = [{
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

export const OBJETIVOS_DEF = [{
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

export const PRIORIDADES_OBJETIVO = ["alta", "media", "baja"];

export const PRIORIDAD_LABEL = {
  alta: "Alta",
  media: "Media",
  baja: "Baja"
};

export const QUIZ_DEF = {
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

export const PERFILES_INFO = {
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

export const ASIGNACION = {
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

export const ACTIVOS_DEF = [{
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

export const DEUDAS_DEF = ["Préstamo estudios", "Préstamo coche", "Préstamo personal / consumo", "Préstamo vacaciones / ocio", "Tarjeta de crédito (revolving)", "Otras deudas"].map(nombre => ({
  nombre,
  pendiente: 0,
  cuota: 0,
  tasa: 0
}));

export const CASOS_SIM = [{
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

export const STORAGE_KEY = "salud-financiera:datos-v1";

export const PERFILES_NIVELES = ["Muy conservador", "Conservador", "Moderado", "Agresivo", "Muy agresivo"];

export const CUENTAS_STORAGE_KEY = "salud-financiera:cuentas-v1";

export const CUENTA_TIPOS_DEF = ["Corriente", "Ahorro", "Remunerada", "Depósito", "Otra"];

export const INVERSIONES_STORAGE_KEY = "salud-financiera:inversiones-v1";

export const TIPOS_INVERSION_DEF = ["Acciones", "ETF", "Fondo indexado", "Fondo de pensiones", "Criptomoneda", "Otro"];

export const ACTIVOS_STORAGE_KEY = "salud-financiera:activos-v1";

export const TIPOS_ACTIVO_DEF = ["Vivienda", "Vehículo", "Otro"];

export const STATS_REALES = [{
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

export const GASTOS_HORMIGA_EJEMPLOS = [{
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

export const TASA_INDICE_GLOBAL = 7;

export const CALCULADORA_DOCUMENTO = "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Prueba nuestras calculadoras</title>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js\"><\/script>\n<style>\n  /* ============================================================\n     SISTEMA DE DISEÑO — extraído de \"Salud Financiera\" (Archivo Maestro)\n     ============================================================ */\n  :root{\n    --bg:#f5f6fa;\n    --surface:#ffffff;\n    --surface-soft:#fafafa;\n    --primary:#4f46e5;\n    --primary-dark:#3730a3;\n    --primary-soft:#eef0ff;\n    --navy:#312e81;\n    --green:#10b981;\n    --green-soft:#eafaf4;\n    --blue:#0ea5e9;\n    --blue-soft:#eaf7fd;\n    --amber:#f59e0b;\n    --amber-soft:#fff7e6;\n    --danger:#ef4444;\n    --danger-soft:#fff0f0;\n    --text:#374151;\n    --text-strong:#1e1e2e;\n    --muted:#6b7280;\n    --border:#e5e7eb;\n    --header-bg:#0b0f1a;\n    --insight-bg:#312e81;\n    --insight-text:#c7d2fe;\n    --shadow-soft: 0 1px 3px rgba(30,30,46,0.05), 0 8px 24px rgba(30,30,46,0.05);\n    --shadow-soft-hover: 0 4px 16px rgba(79,70,229,0.12);\n    --font-sans: ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n    --font-serif: ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif;\n  }\n  *{box-sizing:border-box;}\n  html{scroll-behavior:smooth;}\n  body{\n    margin:0;\n    font-family:var(--font-sans);\n    background:linear-gradient(180deg,#f1f3f9 0%,#f5f6fa 22%,#f8f9fc 52%,#f3f5fa 78%,#eef1f8 100%);\n    color:var(--text);\n    padding:0 0 60px;\n    position:relative;\n  }\n\n  /* ---- Patrón geométrico de líneas finas, adaptado al fondo claro del original ---- */\n  body::before{\n    content:\"\";\n    position:fixed;\n    inset:0;\n    pointer-events:none;\n    z-index:0;\n    opacity:0.5;\n    background-image:\n      repeating-linear-gradient(30deg, rgba(49,46,129,0.035) 0px, rgba(49,46,129,0.035) 1px, transparent 1px, transparent 96px),\n      repeating-linear-gradient(-30deg, rgba(49,46,129,0.035) 0px, rgba(49,46,129,0.035) 1px, transparent 1px, transparent 96px),\n      repeating-linear-gradient(90deg, rgba(49,46,129,0.02) 0px, rgba(49,46,129,0.02) 1px, transparent 1px, transparent 96px);\n    mask-image:radial-gradient(120% 100% at 50% 0%, #000 0%, rgba(0,0,0,0.5) 55%, transparent 90%);\n    -webkit-mask-image:radial-gradient(120% 100% at 50% 0%, #000 0%, rgba(0,0,0,0.5) 55%, transparent 90%);\n  }\n\n  /* ---- Resplandores de color muy tenues para dar profundidad, sin volver el fondo un lienzo blanco ---- */\n  .bg-blob{\n    position:fixed;\n    border-radius:9999px;\n    filter:blur(120px);\n    pointer-events:none;\n    z-index:0;\n    will-change:transform;\n  }\n  .blob-a{ width:520px; height:520px; top:-180px; left:-160px; background:var(--primary); opacity:0.28; animation:blobFloatA 26s ease-in-out infinite; }\n  .blob-b{ width:440px; height:440px; bottom:-160px; right:-140px; background:var(--blue); opacity:0.18; animation:blobFloatB 30s ease-in-out infinite; }\n  .blob-c{ width:380px; height:380px; top:40%; right:-160px; background:var(--green); opacity:0.10; animation:blobFloatC 28s ease-in-out infinite; }\n  @keyframes blobFloatA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px,-40px) scale(1.12); } 66% { transform: translate(-40px,30px) scale(0.92); } }\n  @keyframes blobFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px,50px) scale(1.15); } }\n  @keyframes blobFloatC { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(40px,40px) scale(1.05); } 75% { transform: translate(-30px,-30px) scale(0.95); } }\n\n  .topbar, .container{ position:relative; z-index:1; }\n  .container{\n    max-width:1000px;\n    margin:0 auto;\n    padding:0 16px;\n  }\n\n  /* ---- Barra superior \"de cristal\", como el glass-nav del Maestro ---- */\n  .topbar{\n    background:rgba(15,17,25,0.35);\n    backdrop-filter:blur(14px) saturate(140%);\n    -webkit-backdrop-filter:blur(14px) saturate(140%);\n    border-bottom:1px solid rgba(255,255,255,0.08);\n    padding:14px 16px;\n    margin-bottom:40px;\n  }\n  .topbar-inner{\n    max-width:1000px;\n    margin:0 auto;\n    display:flex;\n    align-items:center;\n    gap:10px;\n  }\n  .topbar-badge{\n    width:28px; height:28px; border-radius:9999px;\n    background:var(--primary);\n    display:flex; align-items:center; justify-content:center;\n    flex-shrink:0;\n  }\n  .topbar-brand{\n    font-family:var(--font-serif);\n    font-weight:700;\n    font-size:0.95rem;\n    color:#fff;\n  }\n\n  /* ---- Foco accesible, idéntico al Archivo Maestro ---- */\n  button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible {\n    outline: 2px solid var(--primary);\n    outline-offset: 2px;\n    border-radius: 4px;\n  }\n  input{ transition: border-color 200ms ease, box-shadow 200ms ease; }\n  input:focus{ border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }\n\n  @keyframes staggerIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }\n  .stagger-item { animation: staggerIn 380ms cubic-bezier(0.16,1,0.3,1) both; }\n  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; } }\n\n  header{\n    text-align:center;\n    margin-bottom:32px;\n  }\n  header .eyebrow{\n    font-size:0.72rem;\n    font-weight:700;\n    text-transform:uppercase;\n    letter-spacing:0.16em;\n    color:var(--primary-dark);\n    margin-bottom:10px;\n  }\n  header h1{\n    font-family:var(--font-serif);\n    font-size:clamp(1.7rem, 4.2vw, 2.4rem);\n    margin:0 0 10px;\n    font-weight:700;\n    color:var(--text-strong);\n    text-shadow:none;\n  }\n  header h1 span{ color:var(--primary); }\n  header p{\n    color:var(--muted);\n    margin:0;\n    font-size:1rem;\n    max-width:520px;\n    margin-left:auto;\n    margin-right:auto;\n  }\n\n  /* ---- Caja de insight: azul marino sólido + texto blanco, patrón del Maestro ---- */\n  .insight-box{\n    border-radius:14px;\n    padding:16px;\n    display:flex;\n    align-items:flex-start;\n    gap:12px;\n    background:var(--insight-bg);\n    margin-top:16px;\n  }\n  .insight-box .insight-icon{ color:var(--primary); flex-shrink:0; margin-top:2px; }\n  .insight-box .insight-text{ font-size:0.85rem; color:var(--insight-text); line-height:1.5; }\n  .insight-box .insight-text b{ color:#fff; }\n\n  /* ---- Tarjetas: superficie blanca + doble sombra suave del Maestro ---- */\n  .card{\n    background:var(--surface);\n    background-image:\n      radial-gradient(120% 140% at 0% 0%, rgba(79,70,229,0.05) 0%, rgba(79,70,229,0.015) 35%, rgba(0,0,0,0) 60%),\n      radial-gradient(100% 120% at 100% 100%, rgba(14,165,233,0.05) 0%, rgba(0,0,0,0) 55%);\n    border-radius:20px;\n    box-shadow:var(--shadow-soft);\n    padding:28px;\n    margin-bottom:24px;\n    border:1px solid var(--border);\n    transition: box-shadow 250ms ease, border-color 250ms ease;\n    position:relative;\n  }\n  .grid-inputs{\n    display:grid;\n    grid-template-columns:1fr 1fr;\n    gap:24px;\n  }\n  @media (max-width:640px){\n    .grid-inputs{grid-template-columns:1fr;}\n  }\n  .field{\n    display:flex;\n    flex-direction:column;\n    gap:8px;\n  }\n  .field label{\n    font-weight:700;\n    font-size:0.8rem;\n    text-transform:uppercase;\n    letter-spacing:0.06em;\n    color:var(--text);\n    display:flex;\n    justify-content:space-between;\n    align-items:center;\n  }\n  .field label span.unit{\n    color:var(--muted);\n    font-weight:400;\n    text-transform:none;\n    letter-spacing:0;\n    font-size:0.8rem;\n  }\n  .input-row{\n    display:flex;\n    align-items:center;\n    gap:12px;\n  }\n\n  /* ---- Inputs numéricos: mismo tratamiento que NumberField del Maestro (fondo suave, borde, focus índigo) ---- */\n  input[type=number]{\n    width:110px;\n    padding:8px 10px;\n    border-radius:10px;\n    border:1px solid var(--border);\n    font-size:0.95rem;\n    font-weight:700;\n    color:var(--text-strong);\n    background:var(--surface-soft);\n  }\n  input[type=number]:focus{\n    outline:none;\n    background:#fff;\n  }\n  input[type=range]{\n    flex:1;\n    -webkit-appearance:none;\n    appearance:none;\n    height:6px;\n    border-radius:6px;\n    background:linear-gradient(90deg, var(--primary) 0%, var(--primary) 0%, var(--border) 0%);\n    outline:none;\n  }\n  input[type=range]::-webkit-slider-thumb{\n    -webkit-appearance:none;\n    appearance:none;\n    width:20px;\n    height:20px;\n    border-radius:50%;\n    background:var(--primary);\n    cursor:pointer;\n    border:3px solid #fff;\n    box-shadow:0 0 0 1px var(--primary);\n  }\n  input[type=range]::-moz-range-thumb{\n    width:20px;\n    height:20px;\n    border-radius:50%;\n    background:var(--primary);\n    cursor:pointer;\n    border:3px solid #fff;\n    box-shadow:0 0 0 1px var(--primary);\n  }\n\n  /* ---- Resultados: tarjetas KPI al estilo StatCard del Maestro (superficie blanca + insignia de color + cifra en serif) ---- */\n  .results{\n    display:grid;\n    grid-template-columns:repeat(3, 1fr);\n    gap:16px;\n  }\n  @media (max-width:640px){\n    .results{grid-template-columns:1fr;}\n  }\n  .result-box{\n    background:var(--surface);\n    border:1px solid var(--border);\n    border-radius:18px;\n    padding:20px;\n    text-align:left;\n    box-shadow:var(--shadow-soft);\n    transition: box-shadow 250ms ease, border-color 250ms ease, transform 250ms ease;\n    min-width:0;\n  }\n  .result-box:hover{ transform:translateY(-2px); box-shadow:var(--shadow-soft-hover); }\n  .result-icon{\n    width:34px; height:34px; border-radius:9999px;\n    display:flex; align-items:center; justify-content:center;\n    margin-bottom:12px;\n  }\n  .result-box .label{\n    font-size:0.72rem;\n    text-transform:uppercase;\n    letter-spacing:0.1em;\n    margin-bottom:6px;\n    font-weight:700;\n  }\n  .result-box .value{\n    font-family:var(--font-serif);\n    font-size:clamp(1.15rem, 5vw, 1.6rem);\n    font-weight:700;\n    letter-spacing:-0.3px;\n    color:var(--text-strong);\n    overflow-wrap:break-word;\n    word-break:break-word;\n  }\n  .box-total .result-icon{ background:var(--primary-soft); color:var(--primary); }\n  .box-total .label{ color:var(--primary-dark); }\n  .box-aportado .result-icon{ background:var(--blue-soft); color:var(--blue); }\n  .box-aportado .label{ color:var(--blue); }\n  .box-interes .result-icon{ background:var(--green-soft); color:var(--green); }\n  .box-interes .label{ color:var(--green); }\n\n  .chart-wrap{\n    position:relative;\n    height:360px;\n  }\n\n  /* ---- CTA final: bloque oscuro índigo, coherente con la cabecera del Maestro ---- */\n  .cta-card{\n    background:linear-gradient(160deg,#1e1b4b,var(--navy));\n    color:#fff;\n    border-radius:20px;\n    padding:32px;\n    text-align:center;\n    box-shadow:var(--shadow-soft);\n  }\n  .cta-card h3{\n    font-family:var(--font-serif);\n    font-size:1.4rem;\n    font-weight:700;\n    margin:0 0 10px;\n  }\n  .cta-card p{\n    color:#c7d2fe;\n    margin:0 0 22px;\n    font-size:1rem;\n    max-width:560px;\n    margin-left:auto;\n    margin-right:auto;\n  }\n  .cta-btn{\n    display:inline-flex;\n    align-items:center;\n    gap:8px;\n    background:var(--primary);\n    color:#fff;\n    font-weight:700;\n    padding:12px 24px;\n    border-radius:10px;\n    text-decoration:none;\n    font-size:0.95rem;\n    transition:transform 150ms ease, box-shadow 150ms ease, background 150ms ease;\n    box-shadow:0 0 24px -6px rgba(79,70,229,0.5);\n  }\n  .cta-btn:hover{\n    transform:scale(1.03);\n    background:var(--primary-dark);\n  }\n  .disclaimer{\n    font-size:0.75rem;\n    color:#9aa1b3;\n    text-align:center;\n    margin-top:20px;\n  }\n  .section-title{\n    font-family:var(--font-serif);\n    font-weight:700;\n    font-size:1.15rem;\n    margin:0 0 20px;\n    color:var(--text-strong);\n  }\n\n  /* ---- Selector de modo: píldora índigo deslizante, igual que la navegación del Maestro ---- */\n  .mode-tabs{\n    display:grid;\n    grid-template-columns:repeat(4, 1fr);\n    gap:8px;\n  }\n  @media (max-width:640px){\n    .mode-tabs{ grid-template-columns:repeat(2, 1fr); }\n  }\n  .mode-tab{\n    display:inline-flex;\n    align-items:center;\n    justify-content:center;\n    gap:8px;\n    border:none;\n    background:transparent;\n    padding:12px 10px;\n    border-radius:14px;\n    font-size:0.85rem;\n    font-weight:700;\n    color:var(--muted);\n    cursor:pointer;\n    transition:background 150ms ease, color 150ms ease, transform 150ms ease;\n    text-align:center;\n  }\n  .mode-tab.active{\n    background:var(--primary);\n    color:var(--navy);\n    box-shadow:0 0 20px -4px rgba(79,70,229,0.45);\n  }\n  .mode-tab:not(.active):hover{\n    background:var(--primary-soft);\n    color:var(--primary-dark);\n  }\n  .mode-tab:active{ transform:scale(0.98); }\n\n  .table-wrap{\n    overflow-x:auto;\n    border-radius:14px;\n    border:1px solid var(--border);\n  }\n  table{\n    width:100%;\n    border-collapse:collapse;\n    font-size:0.9rem;\n    min-width:480px;\n  }\n  thead th{\n    background:var(--surface-soft);\n    text-align:right;\n    padding:12px 16px;\n    font-weight:700;\n    color:var(--text-strong);\n    border-bottom:2px solid var(--border);\n    white-space:nowrap;\n  }\n  thead th:first-child, tbody td:first-child{\n    text-align:left;\n  }\n  tbody td{\n    text-align:right;\n    padding:10px 16px;\n    border-bottom:1px solid var(--border);\n    color:var(--text);\n    white-space:nowrap;\n  }\n  tbody tr:last-child td{\n    border-bottom:none;\n  }\n  tbody tr:hover{\n    background:var(--surface-soft);\n  }\n  tbody tr.row-final{\n    background:var(--primary-soft);\n    font-weight:700;\n  }\n  td.col-aportado{ color:var(--blue); }\n  td.col-interes{ color:var(--green); }\n  td.col-total{ color:var(--primary); font-weight:700; }\n\n  /* ---- Tarjetas de opciones en la página de bienvenida ---- */\n  .opciones-grid{\n    display:grid;\n    grid-template-columns:1fr 1fr;\n    gap:18px;\n    margin-top:8px;\n  }\n  @media (max-width:640px){ .opciones-grid{ grid-template-columns:1fr; } }\n  .opcion-card{\n    display:flex;\n    flex-direction:column;\n    gap:10px;\n    height:100%;\n    min-width:0;\n  }\n  .opcion-card .opcion-icon{\n    width:38px;height:38px;border-radius:10px;\n    background:var(--primary-soft);\n    display:flex;align-items:center;justify-content:center;\n    flex-shrink:0;\n  }\n  .opcion-card h3{\n    margin:0;\n    font-family:var(--font-serif);\n    font-size:1.02rem;\n    color:var(--text-strong);\n  }\n  .opcion-card p{\n    margin:0;\n    color:var(--muted);\n    font-size:0.87rem;\n    line-height:1.5;\n    flex:1;\n  }\n  .opcion-btn{\n    align-self:flex-start;\n    display:inline-flex;\n    align-items:center;\n    gap:6px;\n    background:var(--primary);\n    color:#fff;\n    font-weight:700;\n    font-size:0.82rem;\n    padding:8px 14px;\n    border-radius:9px;\n    border:none;\n    cursor:pointer;\n    text-decoration:none;\n    transition:background 200ms ease;\n  }\n  .opcion-btn:hover{ background:var(--primary-dark); }\n  .seccion-divisor{\n    display:flex;\n    align-items:center;\n    gap:12px;\n    margin:36px 0 20px;\n    color:var(--muted);\n    font-size:0.75rem;\n    font-weight:700;\n    text-transform:uppercase;\n    letter-spacing:0.1em;\n  }\n  .seccion-divisor::before, .seccion-divisor::after{\n    content:\"\";\n    flex:1;\n    height:1px;\n    background:var(--border);\n  }\n</style>\n</head>\n<body>\n<div class=\"bg-blob blob-a\"></div>\n<div class=\"bg-blob blob-b\"></div>\n<div class=\"bg-blob blob-c\"></div>\n<div class=\"topbar\">\n  <div class=\"topbar-inner\">\n    <div class=\"topbar-badge\">\n      <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--navy)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg>\n    </div>\n    <span class=\"topbar-brand\">Salud Financiera</span>\n  </div>\n</div>\n<div class=\"container\">\n  <header style=\"padding-top:8px;\">\n    <div class=\"eyebrow\">Herramientas interactivas</div>\n    <h1>Prueba nuestras <span>calculadoras</span></h1>\n    <p>Pequeñas simulaciones que te ayudan a tomar decisiones financieras con datos reales, no con intuición</p>\n  </header>\n\n  <div class=\"card\">\n    <div class=\"insight-box\" style=\"margin-top:0;\">\n      <svg class=\"insight-icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></svg>\n      <div class=\"insight-text\">\n        <b>¿Por qué usar una calculadora financiera?</b> Nuestro cerebro es malo estimando el efecto del tiempo y el interés compuesto: subestimamos cuánto puede crecer un ahorro constante y sobreestimamos lo que necesitamos aportar para llegar a una meta. Cada una de las 4 opciones de abajo responde a una pregunta distinta que te puedes estar haciendo sobre tu dinero. Elige la que encaje con tu situación y te llevará directamente a esa calculadora, ya configurada.\n      </div>\n    </div>\n  </div>\n\n  <div class=\"card\">\n    <div class=\"section-title\" style=\"margin-bottom:14px;\">Elige qué quieres calcular</div>\n    <div class=\"opciones-grid\">\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <h3>Capital final</h3>\n        <p><b>¿Para qué sirve?</b> Calcula cuánto dinero acumularás al cabo de los años si mantienes tu depósito inicial, tu aportación mensual y una rentabilidad estimada. <b>Por qué importa:</b> te muestra el efecto real del interés compuesto y cuánto de tu capital final serán intereses generados, no solo lo que has aportado tú.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('capital')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/></svg></div>\n        <h3>Tiempo para llegar a una meta</h3>\n        <p><b>¿Para qué sirve?</b> Indicas tu objetivo de ahorro y calcula cuántos años y meses necesitas para alcanzarlo con tu aportación y rentabilidad actuales. <b>Por qué importa:</b> convierte una meta abstracta (\"quiero ahorrar para X\") en un plazo concreto, para saber si vas a tiempo o necesitas ajustar algo.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('tiempo')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg></div>\n        <h3>Aportación mensual necesaria</h3>\n        <p><b>¿Para qué sirve?</b> Fijas tu objetivo y el plazo en el que quieres lograrlo, y calcula cuánto necesitas aportar cada mes. <b>Por qué importa:</b> te dice si esa meta es realista con tu capacidad de ahorro actual, antes de comprometerte a un plan que no puedas mantener.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('aportacion')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n      <div class=\"opcion-card\">\n        <div class=\"opcion-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--primary)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 17l6-6 4 4 8-8\"/><path d=\"M14 7h7v7\"/></svg></div>\n        <h3>Rentabilidad necesaria</h3>\n        <p><b>¿Para qué sirve?</b> Con tu capital, tu aportación y tu plazo, calcula qué rentabilidad anual media necesitarías para llegar a tu objetivo. <b>Por qué importa:</b> te ayuda a valorar si esa rentabilidad es razonable o si estás asumiendo un riesgo excesivo para conseguirla.</p>\n        <button class=\"opcion-btn\" onclick=\"irACalculadora('rentabilidad')\">Ir a esta calculadora\n          <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"/><path d=\"M12 5l7 7-7 7\"/></svg>\n        </button>\n      </div>\n\n    </div>\n  </div>\n\n  <div class=\"seccion-divisor\" id=\"calculadora-divider\" style=\"display:none;\">La calculadora</div>\n\n  <div id=\"calculadora-app\" style=\"display:none;\">\n  <header style=\"padding-top:0;margin-bottom:24px;\">\n    <div class=\"eyebrow\">Tu dinero, en perspectiva</div>\n    <h1 style=\"font-size:clamp(1.4rem, 3.2vw, 1.9rem);\">Calculadora de <span>Interés Compuesto</span></h1>\n    <p>Descubre cuánto puede crecer tu dinero ahorrando e invirtiendo a largo plazo</p>\n  </header>\n\n  <!-- SELECTOR DE MODO -->\n  <div class=\"card\" style=\"padding:10px;\">\n    <div class=\"mode-tabs\">\n      <button class=\"mode-tab active\" id=\"tabCapital\" data-mode=\"capital\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg>\n        ¿Cuánto tendré?\n      </button>\n      <button class=\"mode-tab\" id=\"tabTiempo\" data-mode=\"tiempo\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/></svg>\n        ¿Cuánto tardaré?\n      </button>\n      <button class=\"mode-tab\" id=\"tabAportacion\" data-mode=\"aportacion\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg>\n        ¿Cuánto necesitaré?\n      </button>\n      <button class=\"mode-tab\" id=\"tabRentabilidad\" data-mode=\"rentabilidad\">\n        <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg>\n        ¿Qué rentabilidad?\n      </button>\n    </div>\n  </div>\n\n  <!-- INPUTS -->\n  <div class=\"card\">\n    <div class=\"section-title\" id=\"inputsTitle\">Tus datos</div>\n    <div class=\"grid-inputs\">\n\n      <div class=\"field\">\n        <label>Depósito inicial <span class=\"unit\">€</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeInicial\" min=\"0\" max=\"100000\" step=\"100\" value=\"1000\">\n          <input type=\"number\" id=\"numInicial\" min=\"0\" max=\"1000000\" step=\"100\" value=\"1000\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldMensual\">\n        <label>Aportación mensual <span class=\"unit\">€/mes</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeMensual\" min=\"0\" max=\"5000\" step=\"10\" value=\"100\">\n          <input type=\"number\" id=\"numMensual\" min=\"0\" max=\"100000\" step=\"10\" value=\"100\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldPlazo\">\n        <label>Plazo de inversión <span class=\"unit\">años</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangePlazo\" min=\"1\" max=\"50\" step=\"1\" value=\"50\">\n          <input type=\"number\" id=\"numPlazo\" min=\"1\" max=\"100\" step=\"1\" value=\"50\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldObjetivo\" style=\"display:none;\">\n        <label>Objetivo de capital <span class=\"unit\">€</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeObjetivo\" min=\"1000\" max=\"1000000\" step=\"1000\" value=\"100000\">\n          <input type=\"number\" id=\"numObjetivo\" min=\"0\" max=\"100000000\" step=\"1000\" value=\"100000\">\n        </div>\n      </div>\n\n      <div class=\"field\" id=\"fieldTasa\">\n        <label>Rentabilidad anual estimada <span class=\"unit\">%</span></label>\n        <div class=\"input-row\">\n          <input type=\"range\" id=\"rangeTasa\" min=\"0\" max=\"20\" step=\"0.1\" value=\"7\">\n          <input type=\"number\" id=\"numTasa\" min=\"0\" max=\"50\" step=\"0.1\" value=\"7\">\n        </div>\n      </div>\n\n    </div>\n\n    <div class=\"insight-box\">\n      <svg class=\"insight-icon\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2a10 10 0 100 20 10 10 0 000-20z\"/><path d=\"M12 16v-5M12 8h.01\"/></svg>\n      <div class=\"insight-text\"><b>El interés compuesto premia el tiempo, no solo el dinero.</b> Aportar antes, aunque sea poco, suele pesar más a largo plazo que aportar mucho pero empezar tarde.</div>\n    </div>\n  </div>\n\n  <!-- RESULTADOS: MODO CAPITAL -->\n  <div class=\"card\" id=\"resultsCapital\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <div class=\"label\">Capital Total Final</div>\n        <div class=\"value\" id=\"resTotal\">0 €</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportado\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteres\">0 €</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- RESULTADOS: MODO TIEMPO -->\n  <div class=\"card\" id=\"resultsTiempo\" style=\"display:none;\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/></svg></div>\n        <div class=\"label\">Tiempo necesario</div>\n        <div class=\"value\" id=\"resTiempo\">0 años</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportadoTiempo\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteresTiempo\">0 €</div>\n      </div>\n    </div>\n    <p id=\"avisoObjetivo\" style=\"color:var(--muted); font-size:0.85rem; text-align:center; margin:16px 0 0;\"></p>\n  </div>\n\n  <!-- RESULTADOS: MODO APORTACIÓN NECESARIA -->\n  <div class=\"card\" id=\"resultsAportacion\" style=\"display:none;\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Aportación mensual necesaria</div>\n        <div class=\"value\" id=\"resMensualNecesaria\">0 €</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportadoNecesaria\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteresNecesaria\">0 €</div>\n      </div>\n    </div>\n    <p id=\"avisoAportacion\" style=\"color:var(--muted); font-size:0.85rem; text-align:center; margin:16px 0 0;\"></p>\n  </div>\n\n  <!-- RESULTADOS: MODO RENTABILIDAD NECESARIA -->\n  <div class=\"card\" id=\"resultsRentabilidad\" style=\"display:none;\">\n    <div class=\"section-title\">Resultados</div>\n    <div class=\"results\">\n      <div class=\"result-box box-total stagger-item\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 6l-9.5 9.5-5-5L1 18\"/><path d=\"M17 6h6v6\"/></svg></div>\n        <div class=\"label\">Rentabilidad anual necesaria</div>\n        <div class=\"value\" id=\"resTasaNecesaria\">0 %</div>\n      </div>\n      <div class=\"result-box box-aportado stagger-item\" style=\"animation-delay:60ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 7V5a2 2 0 00-2-2H5a2 2 0 000 4h14a2 2 0 012 2v3M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-6a1 1 0 00-1-1h-4a2 2 0 000 4h4\"/></svg></div>\n        <div class=\"label\">Total Aportado</div>\n        <div class=\"value\" id=\"resAportadoRentabilidad\">0 €</div>\n      </div>\n      <div class=\"result-box box-interes stagger-item\" style=\"animation-delay:120ms\">\n        <div class=\"result-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/></svg></div>\n        <div class=\"label\">Intereses Ganados</div>\n        <div class=\"value\" id=\"resInteresRentabilidad\">0 €</div>\n      </div>\n    </div>\n    <p id=\"avisoRentabilidad\" style=\"color:var(--muted); font-size:0.85rem; text-align:center; margin:16px 0 0;\"></p>\n  </div>\n\n  <!-- GRAFICO -->\n  <div class=\"card\">\n    <div class=\"section-title\">Evolución año a año</div>\n    <div class=\"chart-wrap\">\n      <canvas id=\"chart\"></canvas>\n    </div>\n  </div>\n\n  <!-- TABLA AÑO A AÑO -->\n  <div class=\"card\">\n    <div class=\"section-title\">Detalle año a año</div>\n    <div class=\"table-wrap\">\n      <table id=\"tablaDetalle\">\n        <thead>\n          <tr>\n            <th>Año</th>\n            <th>Aportado acumulado</th>\n            <th>Intereses acumulados</th>\n            <th>Capital total</th>\n          </tr>\n        </thead>\n        <tbody id=\"tablaBody\">\n        </tbody>\n      </table>\n    </div>\n  </div>\n\n  <p class=\"disclaimer\">Esta calculadora es una herramienta orientativa y no constituye asesoramiento financiero. Los rendimientos pasados no garantizan resultados futuros.</p>\n  </div>\n</div>\n\n<script>\n  const el = id => document.getElementById(id);\n\n  const rangeInicial = el('rangeInicial'), numInicial = el('numInicial');\n  const rangeMensual = el('rangeMensual'), numMensual = el('numMensual');\n  const rangePlazo = el('rangePlazo'), numPlazo = el('numPlazo');\n  const rangeObjetivo = el('rangeObjetivo'), numObjetivo = el('numObjetivo');\n  const rangeTasa = el('rangeTasa'), numTasa = el('numTasa');\n\n  const tabCapital = el('tabCapital'), tabTiempo = el('tabTiempo');\n  const tabAportacion = el('tabAportacion'), tabRentabilidad = el('tabRentabilidad');\n  const fieldMensual = el('fieldMensual'), fieldPlazo = el('fieldPlazo');\n  const fieldObjetivo = el('fieldObjetivo'), fieldTasa = el('fieldTasa');\n  const resultsCapital = el('resultsCapital'), resultsTiempo = el('resultsTiempo');\n  const resultsAportacion = el('resultsAportacion'), resultsRentabilidad = el('resultsRentabilidad');\n\n  let modo = 'capital'; // 'capital' | 'tiempo' | 'aportacion' | 'rentabilidad'\n\n  // Qué campos de entrada se muestran en cada modo\n  const camposPorModo = {\n    capital:       { mensual:true,  plazo:true,  objetivo:false, tasa:true  },\n    tiempo:        { mensual:true,  plazo:false, objetivo:true,  tasa:true  },\n    aportacion:    { mensual:false, plazo:true,  objetivo:true,  tasa:true  },\n    rentabilidad:  { mensual:true,  plazo:true,  objetivo:true,  tasa:false }\n  };\n\n  function syncPair(range, num, callback){\n    range.addEventListener('input', () => { num.value = range.value; callback(); });\n    num.addEventListener('input', () => {\n      let v = parseFloat(num.value);\n      if(isNaN(v)) v = 0;\n      if(range.max && v > parseFloat(range.max)) range.max = v;\n      range.value = v;\n      callback();\n    });\n  }\n\n  const formatter = new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 });\n  const fmt = n => formatter.format(Math.round(n));\n\n  let chart;\n\n  function cambiarModo(nuevoModo){\n    modo = nuevoModo;\n\n    tabCapital.classList.toggle('active', modo === 'capital');\n    tabTiempo.classList.toggle('active', modo === 'tiempo');\n    tabAportacion.classList.toggle('active', modo === 'aportacion');\n    tabRentabilidad.classList.toggle('active', modo === 'rentabilidad');\n\n    const campos = camposPorModo[modo];\n    fieldMensual.style.display = campos.mensual ? '' : 'none';\n    fieldPlazo.style.display = campos.plazo ? '' : 'none';\n    fieldObjetivo.style.display = campos.objetivo ? '' : 'none';\n    fieldTasa.style.display = campos.tasa ? '' : 'none';\n\n    resultsCapital.style.display = modo === 'capital' ? '' : 'none';\n    resultsTiempo.style.display = modo === 'tiempo' ? '' : 'none';\n    resultsAportacion.style.display = modo === 'aportacion' ? '' : 'none';\n    resultsRentabilidad.style.display = modo === 'rentabilidad' ? '' : 'none';\n\n    calcular();\n  }\n\n  tabCapital.addEventListener('click', () => cambiarModo('capital'));\n  tabTiempo.addEventListener('click', () => cambiarModo('tiempo'));\n  tabAportacion.addEventListener('click', () => cambiarModo('aportacion'));\n  tabRentabilidad.addEventListener('click', () => cambiarModo('rentabilidad'));\n\n  // Usado por los botones de la sección \"Elige qué quieres calcular\":\n  // abre la calculadora seleccionada dentro de esta misma página.\n  window.irACalculadora = function(nuevoModo){\n    document.getElementById('calculadora-app').style.display = '';\n    document.getElementById('calculadora-divider').style.display = 'flex';\n    cambiarModo(nuevoModo);\n    document.getElementById('calculadora-app').scrollIntoView({behavior:'smooth', block:'start'});\n  };\n\n  // Simula la evolución mes a mes hasta un número de años dado y devuelve\n  // arrays año a año, útil para ambos modos y para el gráfico.\n  function simular(inicial, mensual, tasaMensual, anios){\n    const labels = [0];\n    const dataAportado = [inicial];\n    const dataInteres = [0];\n    const dataTotal = [inicial];\n\n    let capital = inicial;\n    let totalAportado = inicial;\n\n    for(let year = 1; year <= anios; year++){\n      for(let m = 0; m < 12; m++){\n        capital = capital * (1 + tasaMensual) + mensual;\n        totalAportado += mensual;\n      }\n      labels.push(year);\n      dataAportado.push(Math.round(totalAportado));\n      dataTotal.push(Math.round(capital));\n      dataInteres.push(Math.round(capital - totalAportado));\n    }\n\n    return { labels, dataAportado, dataInteres, dataTotal, capitalFinal: capital, totalAportado };\n  }\n\n  function calcular(){\n    const inicial = parseFloat(numInicial.value) || 0;\n    const mensual = parseFloat(numMensual.value) || 0;\n    const tasaAnual = (parseFloat(numTasa.value) || 0) / 100;\n    const tasaMensual = tasaAnual / 12;\n\n    if(modo === 'capital'){\n      const anios = parseInt(numPlazo.value) || 0;\n      const r = simular(inicial, mensual, tasaMensual, anios);\n\n      el('resTotal').textContent = fmt(r.capitalFinal);\n      el('resAportado').textContent = fmt(r.totalAportado);\n      el('resInteres').textContent = fmt(r.capitalFinal - r.totalAportado);\n\n      updateChart(r.labels, r.dataAportado, r.dataInteres);\n\n    } else if(modo === 'aportacion'){\n      const anios = parseInt(numPlazo.value) || 0;\n      const objetivo = parseFloat(numObjetivo.value) || 0;\n      const n = anios * 12;\n      const i = tasaMensual;\n\n      let mensualNecesaria;\n      if(n <= 0){\n        mensualNecesaria = 0;\n      } else if(i > 0){\n        const factorCrecimiento = Math.pow(1 + i, n);\n        const factorAnualidad = (factorCrecimiento - 1) / i;\n        mensualNecesaria = (objetivo - inicial * factorCrecimiento) / factorAnualidad;\n      } else {\n        mensualNecesaria = (objetivo - inicial) / n;\n      }\n\n      if(mensualNecesaria <= 0){\n        el('resMensualNecesaria').textContent = '0 €/mes';\n        el('avisoAportacion').textContent = 'Con tu depósito inicial y la rentabilidad estimada ya alcanzas el objetivo sin necesidad de aportar más.';\n        const r = simular(inicial, 0, tasaMensual, anios);\n        el('resAportadoNecesaria').textContent = fmt(r.totalAportado);\n        el('resInteresNecesaria').textContent = fmt(r.capitalFinal - r.totalAportado);\n        updateChart(r.labels, r.dataAportado, r.dataInteres);\n      } else {\n        el('avisoAportacion').textContent = `Aportando ${fmt(mensualNecesaria)} al mes alcanzarás ${fmt(objetivo)} en ${anios} años, con la rentabilidad estimada.`;\n        const r = simular(inicial, mensualNecesaria, tasaMensual, anios);\n        el('resMensualNecesaria').textContent = fmt(mensualNecesaria) + '/mes';\n        el('resAportadoNecesaria').textContent = fmt(r.totalAportado);\n        el('resInteresNecesaria').textContent = fmt(r.capitalFinal - r.totalAportado);\n        updateChart(r.labels, r.dataAportado, r.dataInteres);\n      }\n\n    } else if(modo === 'rentabilidad'){\n      const anios = parseInt(numPlazo.value) || 0;\n      const objetivo = parseFloat(numObjetivo.value) || 0;\n\n      const capitalConTasa = (tasaAnualProbada) => {\n        const iMensual = tasaAnualProbada / 12;\n        return simular(inicial, mensual, iMensual, anios);\n      };\n\n      const capitalCero = capitalConTasa(0).capitalFinal;\n\n      if(capitalCero >= objetivo){\n        el('resTasaNecesaria').textContent = '0 %';\n        el('avisoRentabilidad').textContent = 'Con tu depósito inicial y tu aportación mensual ya alcanzas el objetivo sin necesidad de rentabilidad.';\n        const r = capitalConTasa(0);\n        el('resAportadoRentabilidad').textContent = fmt(r.totalAportado);\n        el('resInteresRentabilidad').textContent = fmt(r.capitalFinal - r.totalAportado);\n        updateChart(r.labels, r.dataAportado, r.dataInteres);\n      } else {\n        let lo = 0, hi = 1; // 0% a 100% anual\n        let capitalHi = capitalConTasa(hi).capitalFinal;\n        let iter = 0;\n        while(capitalHi < objetivo && hi < 100 && iter < 60){\n          hi *= 2;\n          capitalHi = capitalConTasa(hi).capitalFinal;\n          iter++;\n        }\n\n        if(capitalHi < objetivo){\n          el('resTasaNecesaria').textContent = 'Más de 10.000 %';\n          el('avisoRentabilidad').textContent = 'Con estos datos, no existe una rentabilidad anual realista que alcance el objetivo en ese plazo. Prueba a aumentar el plazo o la aportación mensual.';\n          const r = capitalConTasa(hi);\n          el('resAportadoRentabilidad').textContent = fmt(r.totalAportado);\n          el('resInteresRentabilidad').textContent = fmt(r.capitalFinal - r.totalAportado);\n          updateChart(r.labels, r.dataAportado, r.dataInteres);\n        } else {\n          for(let k = 0; k < 60; k++){\n            const mid = (lo + hi) / 2;\n            const capitalMid = capitalConTasa(mid).capitalFinal;\n            if(capitalMid < objetivo) lo = mid; else hi = mid;\n          }\n          const tasaNecesaria = (lo + hi) / 2;\n          const r = capitalConTasa(tasaNecesaria);\n\n          el('resTasaNecesaria').textContent = (tasaNecesaria * 100).toFixed(2) + ' %';\n          el('avisoRentabilidad').textContent = `Necesitarías una rentabilidad anual media del ${(tasaNecesaria * 100).toFixed(2)}% para alcanzar ${fmt(objetivo)} en ${anios} años.`;\n          el('resAportadoRentabilidad').textContent = fmt(r.totalAportado);\n          el('resInteresRentabilidad').textContent = fmt(r.capitalFinal - r.totalAportado);\n          updateChart(r.labels, r.dataAportado, r.dataInteres);\n        }\n      }\n\n    } else {\n      const objetivo = parseFloat(numObjetivo.value) || 0;\n      const MAX_ANIOS = 100;\n\n      // Si ni siquiera con 100 años se alcanza el objetivo (o el objetivo ya\n      // está cubierto por el depósito inicial), gestionamos esos casos.\n      if(inicial >= objetivo){\n        el('resTiempo').textContent = '¡Ya lo tienes!';\n        el('resAportadoTiempo').textContent = fmt(inicial);\n        el('resInteresTiempo').textContent = fmt(0);\n        el('avisoObjetivo').textContent = 'Tu depósito inicial ya cubre el objetivo marcado.';\n        updateChart([0], [inicial], [0]);\n        return;\n      }\n\n      let capital = inicial;\n      let totalAportado = inicial;\n      let mesesTotales = 0;\n      let alcanzado = false;\n\n      const labels = [0];\n      const dataAportado = [inicial];\n      const dataInteres = [0];\n\n      for(let year = 1; year <= MAX_ANIOS; year++){\n        for(let m = 0; m < 12; m++){\n          capital = capital * (1 + tasaMensual) + mensual;\n          totalAportado += mensual;\n          mesesTotales++;\n          if(capital >= objetivo && !alcanzado){\n            alcanzado = true;\n            break;\n          }\n        }\n        labels.push(year);\n        dataAportado.push(Math.round(totalAportado));\n        dataInteres.push(Math.round(capital - totalAportado));\n        if(alcanzado) break;\n      }\n\n      if(!alcanzado){\n        el('resTiempo').textContent = `Más de ${MAX_ANIOS} años`;\n        el('avisoObjetivo').textContent = 'Con estos datos, no alcanzarías el objetivo en un plazo razonable. Prueba a subir la aportación mensual o la rentabilidad estimada.';\n      } else {\n        const aniosCompletos = Math.floor(mesesTotales / 12);\n        const mesesRestantes = mesesTotales % 12;\n        el('resTiempo').textContent = mesesRestantes > 0\n          ? `${aniosCompletos} años y ${mesesRestantes} meses`\n          : `${aniosCompletos} años`;\n        el('avisoObjetivo').textContent = `Alcanzarás ${fmt(objetivo)} aproximadamente en ese plazo, manteniendo tu aportación y rentabilidad estimada.`;\n      }\n\n      el('resAportadoTiempo').textContent = fmt(totalAportado);\n      el('resInteresTiempo').textContent = fmt(capital - totalAportado);\n\n      updateChart(labels, dataAportado, dataInteres);\n    }\n  }\n\n  function updateTabla(labels, dataAportado, dataInteres){\n    const tbody = el('tablaBody');\n    tbody.innerHTML = '';\n    const lastIndex = labels.length - 1;\n\n    labels.forEach((year, i) => {\n      const aportado = dataAportado[i];\n      const interes = dataInteres[i];\n      const total = aportado + interes;\n\n      const tr = document.createElement('tr');\n      if(i === lastIndex) tr.classList.add('row-final');\n\n      tr.innerHTML = `\n        <td>${year === 0 ? 'Inicio' : 'Año ' + year}</td>\n        <td class=\"col-aportado\">${fmt(aportado)}</td>\n        <td class=\"col-interes\">${fmt(interes)}</td>\n        <td class=\"col-total\">${fmt(total)}</td>\n      `;\n      tbody.appendChild(tr);\n    });\n  }\n\n  function updateChart(labels, dataAportado, dataInteres){\n    updateTabla(labels, dataAportado, dataInteres);\n    const ctx = document.getElementById('chart').getContext('2d');\n    if(chart){\n      chart.data.labels = labels;\n      chart.data.datasets[0].data = dataAportado;\n      chart.data.datasets[1].data = dataInteres;\n      chart.update();\n      return;\n    }\n    chart = new Chart(ctx, {\n      type: 'bar',\n      data: {\n        labels: labels,\n        datasets: [\n          {\n            label: 'Dinero Aportado',\n            data: dataAportado,\n            backgroundColor: '#0ea5e9',\n            borderRadius: 6,\n            stack: 'stack0'\n          },\n          {\n            label: 'Intereses Generados',\n            data: dataInteres,\n            backgroundColor: '#10b981',\n            borderRadius: 6,\n            stack: 'stack0'\n          }\n        ]\n      },\n      options: {\n        responsive: true,\n        maintainAspectRatio: false,\n        interaction: { mode: 'index', intersect: false },\n        plugins: {\n          legend: { position: 'bottom', labels: { usePointStyle:true, padding:20, font:{size:12} } },\n          tooltip: {\n            callbacks: {\n              label: function(context){\n                return context.dataset.label + ': ' + fmt(context.raw);\n              }\n            }\n          }\n        },\n        scales: {\n          x: {\n            title: { display:true, text:'Año' },\n            stacked: true,\n            grid: { display:false }\n          },\n          y: {\n            stacked: true,\n            ticks: {\n              callback: value => fmt(value)\n            },\n            grid: { color:'#f0f0f0' }\n          }\n        }\n      }\n    });\n  }\n\n  syncPair(rangeInicial, numInicial, calcular);\n  syncPair(rangeMensual, numMensual, calcular);\n  syncPair(rangePlazo, numPlazo, calcular);\n  syncPair(rangeObjetivo, numObjetivo, calcular);\n  syncPair(rangeTasa, numTasa, calcular);\n\n  const modoInicial = \"__MODO_INICIAL__\" || new URLSearchParams(window.location.search).get('modo');\n  const modosValidos = ['capital','tiempo','aportacion','rentabilidad'];\n\n  if(modosValidos.includes(modoInicial)){\n    document.getElementById('calculadora-app').style.display = '';\n    document.getElementById('calculadora-divider').style.display = 'flex';\n    cambiarModo(modoInicial);\n  }\n\n  // ---- Auto-ajuste de altura para cuando esta pagina vive dentro de un <iframe> ----\n  // Informa al documento padre de la altura real del contenido para que el iframe\n  // pueda ajustarse dinamicamente (evita huecos en blanco o contenido cortado en movil).\n  function enviarAltura(){\n    var h = document.documentElement.scrollHeight;\n    if(window.parent) window.parent.postMessage({ tipo:'calculadora-altura', altura:h }, '*');\n  }\n  if(window.ResizeObserver){\n    new ResizeObserver(enviarAltura).observe(document.body);\n  } else {\n    window.addEventListener('resize', enviarAltura);\n  }\n  window.addEventListener('load', enviarAltura);\n  setTimeout(enviarAltura, 100);\n  setTimeout(enviarAltura, 500);\n  setTimeout(enviarAltura, 1500);\n<\/script>\n</body>\n</html>\n";

export const BLOG_ADMIN_EMAIL = "soportemoneypilot@gmail.com";

export const SECCIONES_BLOG = [
  { key: 'bolsa', label: 'Noticias de bolsa' },
  { key: 'actualidad', label: 'Noticias de actualidad' },
  { key: 'tesis', label: 'Tesis de inversión' },
  { key: 'guia', label: 'Guía de educación financiera' },
];

export const NOMBRES_FASE_BLOG = {
  1: 'Fase 1: Organización y Cimientos',
  2: 'Fase 2: Psicología y Filosofía del Dinero',
  3: 'Fase 3: Iniciación a la Inversión',
  4: 'Fase 4: Optimización y Estrategia Avanzada',
  5: 'Fase 5: Objetivos Vitales y Legado',
};
