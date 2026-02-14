"use client";

import { useState, useEffect, useRef } from "react";
import {
  fetchCreations, createCreation, updateCreation, deleteCreation,
  addCreationImage, updateCreationImage, deleteCreationImage,
  uploadImage, uploadImages, BASE,
} from "@/lib/api";

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

  useEffect(() => { loadCreations(); }, []);

  async function loadCreations() {
    try {
      const data = await fetchCreations();
      setCreations(data);
    } catch { setMsg({ type: "error", text: "Erreur de chargement" }); }
    setLoading(false);
  }

  async function handleRankChange(id, newRank) {
    try {
      await updateCreation(id, { sort_order: parseInt(newRank, 10) });
      await loadCreations();
    } catch { setMsg({ type: "error", text: "Erreur mise à jour rang" }); }
  }

  async function handleDeleteCreation(id, title) {
    if (!confirm(`Supprimer la création "${title}" ?`)) return;
    try {
      await deleteCreation(id);
      setCreations((prev) => prev.filter((c) => c.id !== id));
      setMsg({ type: "success", text: "Création supprimée" });
    } catch { setMsg({ type: "error", text: "Erreur suppression" }); }
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      {msg && <div className={`msg msg--${msg.type}`}>{msg.text}</div>}

      <div className="todo-list">
        {creations.map((c) => (
          <div key={c.id}>
            <div className="todo-item">
              <span className="todo-item__title">{c.title}</span>
              <input
                type="number"
                className="todo-item__rank"
                min={1}
                max={creations.length}
                value={c.sort_order}
                onChange={(e) => handleRankChange(c.id, e.target.value)}
                title="Rang"
              />
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => setEditId(editId === c.id ? null : c.id)}
              >
                Modifier
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => handleDeleteCreation(c.id, c.title)}>
                Supprimer
              </button>
            </div>

            {editId === c.id && (
              <EditCreationForm
                creation={c}
                onSaved={() => { setEditId(null); loadCreations(); setMsg({ type: "success", text: "Création modifiée" }); }}
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
          onSaved={() => { setShowAdd(false); loadCreations(); setMsg({ type: "success", text: "Création ajoutée" }); }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   EDIT CREATION FORM
   ════════════════════════════════════════════════════════════ */
function EditCreationForm({ creation, onSaved, onCancel }) {
  const [title, setTitle] = useState(creation.title);
  const [description, setDescription] = useState(creation.description);
  const [eventType, setEventType] = useState(creation.event_type);
  const [mainImage, setMainImage] = useState(creation.main_image);
  const [images, setImages] = useState(creation.additional_images || []);
  const [saving, setSaving] = useState(false);
  const mainInputRef = useRef(null);
  const addImgRef = useRef(null);

  async function handleReplaceMain(e) {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await uploadImage(file);
    setMainImage(url);
  }

  async function handleImageRankChange(imageId, newRank) {
    try {
      await updateCreationImage(imageId, parseInt(newRank, 10));
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, sort_order: parseInt(newRank, 10) } : img))
      );
    } catch { alert("Erreur rang image"); }
  }

  async function handleDeleteImage(imageId) {
    try {
      await deleteCreationImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch { alert("Erreur suppression image"); }
  }

  async function handleAddImages(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const { urls } = await uploadImages(files);
      for (let i = 0; i < urls.length; i++) {
        const result = await addCreationImage(creation.id, urls[i], images.length + i + 1);
        setImages((prev) => [...prev, result]);
      }
    } catch { alert("Erreur upload images"); }
    e.target.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description || !eventType) return;
    setSaving(true);
    try {
      await updateCreation(creation.id, {
        title, description, event_type: eventType, main_image: mainImage,
      });
      onSaved();
    } catch { alert("Erreur"); }
    setSaving(false);
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h4>Modifier la création</h4>

      <div className="form-group">
        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Événement</label>
        <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} required />
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

      {/* Additional images */}
      <div className="form-group">
        <label>Images secondaires ({images.length})</label>
        {images.map((img) => (
          <div key={img.id} className="img-row">
            <img src={imgSrc(img.image_url)} alt="" className="img-preview" />
            <span className="img-label">{img.image_url.split("/").pop()}</span>
            <input
              type="number"
              className="img-row__rank"
              min={1}
              max={images.length}
              value={img.sort_order}
              onChange={(e) => handleImageRankChange(img.id, e.target.value)}
              title="Rang"
            />
            <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDeleteImage(img.id)}>
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
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════
   ADD CREATION FORM
   ════════════════════════════════════════════════════════════ */
function AddCreationForm({ nextOrder, onSaved, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [sortOrder, setSortOrder] = useState(nextOrder);
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainPreview, setMainPreview] = useState(null);
  const [additionalUrls, setAdditionalUrls] = useState([]);
  const [saving, setSaving] = useState(false);
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

  function removeAdditional(index) {
    setAdditionalUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !description || !eventType || !mainImageUrl) {
      alert("Veuillez remplir tous les champs et ajouter une image principale.");
      return;
    }
    setSaving(true);
    try {
      const additional_images = additionalUrls.map((url, i) => ({
        image_url: url,
        sort_order: i + 1,
      }));
      await createCreation({
        title,
        description,
        event_type: eventType,
        main_image: mainImageUrl,
        sort_order: sortOrder,
        additional_images,
      });
      onSaved();
    } catch { alert("Erreur création"); }
    setSaving(false);
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h4>Ajouter une création</h4>

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
          <label>Ordre d&apos;affichage</label>
          <input type="number" min={1} value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value, 10))} />
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
            <button type="button" className="btn btn--danger btn--sm" onClick={() => removeAdditional(i)}>
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
      </div>
    </form>
  );
}
