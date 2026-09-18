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
