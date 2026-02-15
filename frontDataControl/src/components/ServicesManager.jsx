"use client";

import { useState, useEffect } from "react";
import { fetchServices, createService, updateService, deleteService } from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    try { setServices(await fetchServices()); }
    catch { setMsg({ type: "error", text: "Erreur de chargement" }); }
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteService(deleteTarget.id);
      await loadServices();
      setMsg({ type: "success", text: "Service supprimé" });
    } catch { setMsg({ type: "error", text: "Erreur suppression" }); }
    setDeleteTarget(null);
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      {msg && <div className={`msg msg--${msg.type}`}>{msg.text}</div>}

      {deleteTarget && (
        <ConfirmModal
          message={`Supprimer le service "${deleteTarget.title}" ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="todo-list">
        {services.map((s) => (
          <div key={s.id}>
            <div className="todo-item">
              <span className="todo-item__rank-badge">{s.sort_order}</span>
              <span className="todo-item__title">{s.title}</span>
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setEditId(editId === s.id ? null : s.id)}
              >
                Modifier
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(s)}>
                Supprimer
              </button>
            </div>

            {editId === s.id && (
              <EditServiceForm
                service={s}
                totalCount={services.length}
                onSaved={() => { setEditId(null); loadServices(); }}
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
          totalCount={services.length}
          onSaved={() => { setShowAdd(false); loadServices(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function EditServiceForm({ service, totalCount, onSaved, onCancel }) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [sortOrder, setSortOrder] = useState(service.sort_order);
  const [saving, setSaving] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);
    setInlineMsg(null);
    try {
      await updateService(service.id, { title, description, sort_order: sortOrder });
      setInlineMsg({ type: "success", text: "Enregistré !" });
      setTimeout(() => onSaved(), 800);
    } catch {
      setInlineMsg({ type: "error", text: "Erreur" });
    }
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
      <div className="form-group">
        <label>Rang (1 à {totalCount})</label>
        <input type="number" min={1} max={totalCount} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)} />
      </div>
      <div className="btn-group">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "..." : "Enregistrer"}
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>Annuler</button>
        {inlineMsg && <span className={`inline-msg inline-msg--${inlineMsg.type}`}>{inlineMsg.text}</span>}
      </div>
    </form>
  );
}

function AddServiceForm({ nextOrder, totalCount, onSaved, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(nextOrder);
  const [saving, setSaving] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);
    setInlineMsg(null);
    try {
      await createService({ title, description, sort_order: sortOrder });
      setInlineMsg({ type: "success", text: "Ajouté !" });
      setTimeout(() => onSaved(), 800);
    } catch {
      setInlineMsg({ type: "error", text: "Erreur" });
    }
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
        <label>Rang (1 à {totalCount + 1})</label>
        <input type="number" min={1} max={totalCount + 1} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)} />
      </div>
      <div className="btn-group">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "..." : "Ajouter"}
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>Annuler</button>
        {inlineMsg && <span className={`inline-msg inline-msg--${inlineMsg.type}`}>{inlineMsg.text}</span>}
      </div>
    </form>
  );
}
