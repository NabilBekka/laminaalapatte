"use client";

import { useState, useEffect, useRef } from "react";
import {
  fetchCreations, createCreation, updateCreation, deleteCreation,
  uploadImage, uploadImages, BASE,
} from "@/lib/api";
import ConfirmModal from "@/components/ConfirmModal";

function imgSrc(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${BASE}${url}`;
  return url;
}

export default function CreationsManager() {
  const [creations, setCreations] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadCreations(); }, []);

  async function loadCreations() {
    try { setCreations(await fetchCreations()); }
    catch { setMsg({ type: "error", text: "Erreur de chargement" }); }
    setLoading(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCreation(deleteTarget.id);
      await loadCreations();
      setMsg({ type: "success", text: "Création supprimée" });
    } catch { setMsg({ type: "error", text: "Erreur suppression" }); }
    setDeleteTarget(null);
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      {msg && <div className={`msg msg--${msg.type}`}>{msg.text}</div>}

      {deleteTarget && (
        <ConfirmModal
          message={`Supprimer la création "${deleteTarget.title}" et toutes ses images ?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="todo-list">
        {creations.map((c) => (
          <div key={c.id}>
            <div className="todo-item">
              <span className="todo-item__rank-badge">{c.sort_order}</span>
              <span className="todo-item__title">{c.title}</span>
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setEditId(editId === c.id ? null : c.id)}
              >
                Modifier
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(c)}>
                Supprimer
              </button>
            </div>

            {editId === c.id && (
              <EditCreationForm
                creation={c}
                totalCount={creations.length}
                onSaved={() => { setEditId(null); loadCreations(); }}
                onCancel={() => setEditId(null)}
              />
            )}
          </div>
        ))}
      </div>

      {!showAdd ? (
        <button className="btn btn--add" onClick={() => setShowAdd(true)}>
          + Ajouter une création
        </button>
      ) : (
        <AddCreationForm
          nextOrder={creations.length + 1}
          totalCount={creations.length}
          onSaved={() => { setShowAdd(false); loadCreations(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   EDIT CREATION FORM
   All changes (text, rank, images) are LOCAL
   until the user clicks "Enregistrer"
   ════════════════════════════════════════════ */
function EditCreationForm({ creation, totalCount, onSaved, onCancel }) {
  const [title, setTitle] = useState(creation.title);
  const [description, setDescription] = useState(creation.description);
  const [eventType, setEventType] = useState(creation.event_type);
  const [sortOrder, setSortOrder] = useState(creation.sort_order);
  const [mainImage, setMainImage] = useState(creation.main_image);

  // Images: track existing, pending deletes, pending adds
  const [existingImages, setExistingImages] = useState(creation.additional_images || []);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
  const [pendingAddUrls, setPendingAddUrls] = useState([]);

  const [saving, setSaving] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [deleteImgTarget, setDeleteImgTarget] = useState(null); // { type: 'existing', id } or { type: 'pending', index }
  const mainInputRef = useRef(null);
  const addImgRef = useRef(null);

  // Visible images = existing minus pending deletes + pending adds
  const visibleExisting = existingImages.filter((img) => !pendingDeleteIds.includes(img.id));

  async function handleReplaceMain(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setMainImage(url);
    } catch { alert("Erreur upload"); }
  }

  async function handleAddImages(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const { urls } = await uploadImages(files);
      setPendingAddUrls((prev) => [...prev, ...urls]);
    } catch { alert("Erreur upload"); }
    e.target.value = "";
  }

  function requestDeleteImage(target) {
    setDeleteImgTarget(target);
  }

  function confirmDeleteImage() {
    if (!deleteImgTarget) return;
    if (deleteImgTarget.type === "existing") {
      setPendingDeleteIds((prev) => [...prev, deleteImgTarget.id]);
    } else {
      setPendingAddUrls((prev) => prev.filter((_, i) => i !== deleteImgTarget.index));
    }
    setDeleteImgTarget(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description || !eventType) return;
    setSaving(true);
    setInlineMsg(null);
    try {
      await updateCreation(creation.id, {
        title,
        description,
        event_type: eventType,
        main_image: mainImage,
        sort_order: sortOrder,
        images_to_delete: pendingDeleteIds,
        images_to_add: pendingAddUrls,
      });
      setInlineMsg({ type: "success", text: "Enregistré !" });
      setTimeout(() => onSaved(), 800);
    } catch {
      setInlineMsg({ type: "error", text: "Erreur" });
    }
    setSaving(false);
  }

  const hasChanges = pendingDeleteIds.length > 0 || pendingAddUrls.length > 0;

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h4>Modifier la création</h4>

      {deleteImgTarget && (
        <ConfirmModal
          message="Supprimer cette image ?"
          onConfirm={confirmDeleteImage}
          onCancel={() => setDeleteImgTarget(null)}
        />
      )}

      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Événement</label>
          <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Rang (1 à {totalCount})</label>
          <input type="number" min={1} max={totalCount} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)} />
        </div>
      </div>

      {/* Main image */}
      <div className="form-group">
        <label>Image principale</label>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {mainImage && <img src={imgSrc(mainImage)} alt="Principale" className="img-preview" />}
          <input type="file" accept="image/*" ref={mainInputRef} onChange={handleReplaceMain} style={{ display: "none" }} />
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => mainInputRef.current?.click()}>
            Remplacer
          </button>
        </div>
      </div>

      {/* Existing images (minus pending deletes) */}
      <div className="form-group">
        <label>
          Autres images ({visibleExisting.length + pendingAddUrls.length})
          {hasChanges && <span style={{ color: "var(--mauve)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>— modifications en attente</span>}
        </label>

        {visibleExisting.map((img) => (
          <div key={img.id} className="img-row">
            <img src={imgSrc(img.image_url)} alt="" className="img-preview" />
            <span className="img-label">{img.image_url.split("/").pop()}</span>
            <button type="button" className="btn btn--danger btn--sm"
              onClick={() => requestDeleteImage({ type: "existing", id: img.id })}>
              Supprimer
            </button>
          </div>
        ))}

        {/* Pending adds (not yet saved) */}
        {pendingAddUrls.map((url, i) => (
          <div key={`new-${i}`} className="img-row" style={{ borderLeft: "3px solid var(--green)" }}>
            <img src={imgSrc(url)} alt="" className="img-preview" />
            <span className="img-label" style={{ color: "var(--green)" }}>Nouvelle image</span>
            <button type="button" className="btn btn--danger btn--sm"
              onClick={() => requestDeleteImage({ type: "pending", index: i })}>
              Supprimer
            </button>
          </div>
        ))}

        <input type="file" accept="image/*" multiple ref={addImgRef} onChange={handleAddImages} style={{ display: "none" }} />
        <button type="button" className="btn btn--secondary btn--sm" style={{ marginTop: "0.5rem" }} onClick={() => addImgRef.current?.click()}>
          + Ajouter des images
        </button>
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

/* ════════════════════════════════════════════
   ADD CREATION FORM
   ════════════════════════════════════════════ */
function AddCreationForm({ nextOrder, totalCount, onSaved, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [sortOrder, setSortOrder] = useState(nextOrder);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainPreview, setMainPreview] = useState(null);
  const [additionalUrls, setAdditionalUrls] = useState([]);
  const [saving, setSaving] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const mainInputRef = useRef(null);
  const otherInputRef = useRef(null);

  async function handleMainUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setMainImageUrl(url);
      setMainPreview(imgSrc(url));
    } catch { alert("Erreur upload"); }
  }

  async function handleOtherUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const { urls } = await uploadImages(files);
      setAdditionalUrls((prev) => [...prev, ...urls]);
    } catch { alert("Erreur upload"); }
    e.target.value = "";
  }

  function confirmRemoveAdditional() {
    if (deleteIdx === null) return;
    setAdditionalUrls((prev) => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description || !eventType || !mainImageUrl) {
      setInlineMsg({ type: "error", text: "Remplissez tous les champs + image principale" });
      return;
    }
    setSaving(true);
    setInlineMsg(null);
    try {
      const additional_images = additionalUrls.map((url, i) => ({
        image_url: url,
        sort_order: i + 1,
      }));
      await createCreation({
        title, description, event_type: eventType,
        main_image: mainImageUrl, sort_order: sortOrder, additional_images,
      });
      setInlineMsg({ type: "success", text: "Création ajoutée !" });
      setTimeout(() => onSaved(), 800);
    } catch {
      setInlineMsg({ type: "error", text: "Erreur création" });
    }
    setSaving(false);
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h4>Ajouter une création</h4>

      {deleteIdx !== null && (
        <ConfirmModal
          message="Supprimer cette image ?"
          onConfirm={confirmRemoveAdditional}
          onCancel={() => setDeleteIdx(null)}
        />
      )}

      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Événement</label>
          <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} required placeholder="Ex: Mariage, Anniversaire..." />
        </div>
        <div className="form-group">
          <label>Rang (1 à {totalCount + 1})</label>
          <input type="number" min={1} max={totalCount + 1} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)} />
        </div>
      </div>

      {/* Main image */}
      <div className="form-group">
        <label>Image principale *</label>
        {mainPreview && <img src={mainPreview} alt="Principale" className="img-preview" style={{ marginBottom: "0.5rem", display: "block" }} />}
        <input type="file" accept="image/*" ref={mainInputRef} onChange={handleMainUpload} style={{ display: "none" }} />
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => mainInputRef.current?.click()}>
          {mainImageUrl ? "Remplacer l'image principale" : "Choisir l'image principale"}
        </button>
      </div>

      {/* Other images */}
      <div className="form-group">
        <label>Autres images ({additionalUrls.length})</label>
        {additionalUrls.map((url, i) => (
          <div key={i} className="img-row">
            <img src={imgSrc(url)} alt="" className="img-preview" />
            <span className="img-label">{url.split("/").pop()}</span>
            <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteIdx(i)}>
              Supprimer
            </button>
          </div>
        ))}
        <input type="file" accept="image/*" multiple ref={otherInputRef} onChange={handleOtherUpload} style={{ display: "none" }} />
        <button type="button" className="btn btn--secondary btn--sm" style={{ marginTop: "0.5rem" }} onClick={() => otherInputRef.current?.click()}>
          + Ajouter des images
        </button>
      </div>

      <div className="btn-group">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "..." : "Créer"}
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>Annuler</button>
        {inlineMsg && <span className={`inline-msg inline-msg--${inlineMsg.type}`}>{inlineMsg.text}</span>}
      </div>
    </form>
  );
}
