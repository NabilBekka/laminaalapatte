const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function sendCode() {
  const res = await fetch(`${API}/auth/send-code`, { method: "POST" });
  return res.json();
}

export async function verifyCode(code) {
  const res = await fetch(`${API}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  return res.json();
}

export async function verifyToken(token) {
  const res = await fetch(`${API}/auth/verify-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return res.json();
}

export async function logout(token) {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

// Session helpers (sessionStorage = cleared on tab close)
export function saveSession(token) {
  sessionStorage.setItem("admin_token", token);
}

export function getSession() {
  return sessionStorage.getItem("admin_token");
}

export function clearSession() {
  sessionStorage.removeItem("admin_token");
}
