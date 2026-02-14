const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BASE = API.replace("/api", "");

export { API, BASE };

// ── Settings ──
export async function fetchSettings() {
  const res = await fetch(`${API}/settings`);
  return res.json();
}

export async function updateSetting(key, value) {
  const res = await fetch(`${API}/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  return res.json();
}

// ── Social Links ──
export async function fetchSocialLinks() {
  const res = await fetch(`${API}/social-links`);
  return res.json();
}

export async function updateSocialLink(id, url) {
  const res = await fetch(`${API}/social-links/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

// ── Services ──
export async function fetchServices() {
  const res = await fetch(`${API}/services`);
  return res.json();
}

export async function createService(data) {
  const res = await fetch(`${API}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateService(id, data) {
  const res = await fetch(`${API}/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteService(id) {
  const res = await fetch(`${API}/services/${id}`, { method: "DELETE" });
  return res.json();
}

// ── Creations ──
export async function fetchCreations() {
  const res = await fetch(`${API}/creations`);
  return res.json();
}

export async function createCreation(data) {
  const res = await fetch(`${API}/creations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCreation(id, data) {
  const res = await fetch(`${API}/creations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCreation(id) {
  const res = await fetch(`${API}/creations/${id}`, { method: "DELETE" });
  return res.json();
}

// ── Creation Images ──
export async function addCreationImage(creationId, image_url, sort_order) {
  const res = await fetch(`${API}/creations/${creationId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url, sort_order }),
  });
  return res.json();
}

export async function updateCreationImage(imageId, sort_order) {
  const res = await fetch(`${API}/creations/images/${imageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sort_order }),
  });
  return res.json();
}

export async function deleteCreationImage(imageId) {
  const res = await fetch(`${API}/creations/images/${imageId}`, { method: "DELETE" });
  return res.json();
}

// ── Upload ──
export async function uploadImage(file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API}/upload`, { method: "POST", body: form });
  return res.json();
}

export async function uploadImages(files) {
  const form = new FormData();
  for (const f of files) form.append("images", f);
  const res = await fetch(`${API}/upload/multiple`, { method: "POST", body: form });
  return res.json();
}
