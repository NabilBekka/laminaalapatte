const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchSettings() {
  const res = await fetch(`${API}/settings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function fetchCreations(limit) {
  const url = limit ? `${API}/creations?limit=${limit}` : `${API}/creations`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch creations");
  return res.json();
}

export async function fetchCreation(id) {
  const res = await fetch(`${API}/creations/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch creation");
  return res.json();
}

export async function fetchEventTypes() {
  const res = await fetch(`${API}/creations/event-types`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch event types");
  return res.json();
}

export async function fetchServices() {
  const res = await fetch(`${API}/services`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function fetchSocialLinks() {
  const res = await fetch(`${API}/social-links`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch social links");
  return res.json();
}

export async function submitContact(data) {
  const res = await fetch(`${API}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    return { success: false, error: json.error || "Erreur serveur" };
  }
  return json;
}
