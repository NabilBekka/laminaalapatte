"use client";

import { useState, useEffect } from "react";
import { fetchServices, createService, updateService, deleteService } from "@/lib/api";

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch { setMsg({ type: "error", text: "Erreur de chargement" }); }
    setLoading(false);
  }

  async function handleRankChange(id, newRank) {
    try {
      await updateService(id, { sort_order: parseInt(newRank, 10) });
      await loadServices();
    } catch { setMsg({ type: "error", text: "Erreur mise à jour rang" }); }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Supprimer le service "${title}" ?`)) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setMsg({ type: "success", text: "Service supprimé" });
    } catch { setMsg({ type: "error", text: "Erreur suppression" }); }
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      {msg && <div className={`msg msg--${msg.type}`}>{msg.text}</div>}

      <div className="todo-list">
        {services.map((s) => (
          <div key={s.id}>
            <div className="todo-item">
              <span className="todo-item__title">{s.title}</span>
              <input
                type="number"
                className="todo-item__rank"
                min={1}
                max={services.length}
                value={s.sort_order}
                onChange={(e) => handleRankChange(s.id, e.target.value)}
                title="Rang"
              />
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setEditId(editId === s.id ? null : s.id)}
              >
                Modifier
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => handleDelete(s.id, s.title)}>
                Supprimer
              </button>
            </div>

            {editId === s.id && (
              <EditServiceForm
                service={s}
                onSaved={() => { setEditId(null); loadServices(); setMsg({ type: "success", text: "Service modifié" }); }}
                onCancel={() => setEditId(null)}
              />
            )}
          </div>
        ))}
      </div>

      {!showAdd ? (
        <button className="btn btn--add" onClick={() => setShowAdd(true)}>
          + Ajouter un service
        </button>
      ) : (
        <AddServiceForm
          nextOrder={services.length + 1}
          onSaved={() => { setShowAdd(false); loadServices(); setMsg({ type: "success", text: "Service ajouté" }); }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function EditServiceForm({ service, onSaved, onCancel }) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);
    try {
      await updateService(service.id, { title, description });
      onSaved();
    } catch { alert("Erreur"); }
    setSaving(false);
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h4>Modifier le service</h4>
      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="btn-group">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "..." : "Enregistrer"}
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}

function AddServiceForm({ nextOrder, onSaved, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(nextOrder);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);
    try {
      await createService({ title, description, sort_order: sortOrder });
      onSaved();
    } catch { alert("Erreur"); }
    setSaving(false);
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h4>Ajouter un service</h4>
      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Ordre d&apos;affichage</label>
        <input type="number" min={1} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10))} />
      </div>
      <div className="btn-group">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "..." : "Ajouter"}
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  );
}
