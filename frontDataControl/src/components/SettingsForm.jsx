"use client";

import { useState, useEffect, useRef } from "react";
import { fetchSettings, updateSetting, fetchSocialLinks, updateSocialLink, uploadImage, BASE } from "@/lib/api";

export default function SettingsForm() {
  const [settings, setSettings] = useState({});
  const [socials, setSocials] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, sl] = await Promise.all([fetchSettings(), fetchSocialLinks()]);
      setSettings(s);
      setSocials(sl);
    } catch (err) {
      setMsg({ type: "error", text: "Erreur de chargement" });
    }
    setLoading(false);
  }

  function handleChange(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSocialChange(id, url) {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, url } : s)));
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      handleChange("logo_url", url);
      setMsg({ type: "success", text: "Logo uploadé (pensez à enregistrer)" });
    } catch {
      setMsg({ type: "error", text: "Erreur upload logo" });
    }
  }

  async function handleSave() {
    setMsg(null);
    try {
      const keys = ["site_name", "logo_url", "about_text", "location", "email", "phone"];
      for (const key of keys) {
        if (settings[key] !== undefined) {
          await updateSetting(key, settings[key]);
        }
      }
      for (const s of socials) {
        await updateSocialLink(s.id, s.url);
      }
      setMsg({ type: "success", text: "Paramètres enregistrés !" });
    } catch {
      setMsg({ type: "error", text: "Erreur lors de la sauvegarde" });
    }
  }

  function getLogoSrc() {
    const url = settings.logo_url;
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${BASE}${url}`;
    return url;
  }

  if (loading) return <p>Chargement...</p>;

  const platformLabels = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" };

  return (
    <div>

      <div className="form-group">
        <label>Nom du site</label>
        <input
          type="text"
          value={settings.site_name || ""}
          onChange={(e) => handleChange("site_name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Logo</label>
        {getLogoSrc() && <img src={getLogoSrc()} alt="Logo" className="logo-preview" />}
        <br />
        <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} style={{ display: "none" }} />
        <button className="btn btn--secondary btn--sm" onClick={() => logoInputRef.current?.click()}>
          Changer le logo
        </button>
      </div>

      <div className="form-group">
        <label>Texte À propos</label>
        <textarea
          rows={5}
          value={settings.about_text || ""}
          onChange={(e) => handleChange("about_text", e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Localisation</label>
          <input
            type="text"
            value={settings.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={settings.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Téléphone</label>
        <input
          type="text"
          value={settings.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid var(--border)" }} />
      <h4 style={{ fontSize: "0.85rem", marginBottom: "0.8rem", color: "var(--mauve-dark)" }}>Réseaux sociaux</h4>

      {socials.map((s) => (
        <div className="form-group" key={s.id}>
          <label>{platformLabels[s.platform] || s.platform}</label>
          <input
            type="url"
            value={s.url || ""}
            placeholder={`URL ${s.platform}`}
            onChange={(e) => handleSocialChange(s.id, e.target.value)}
          />
        </div>
      ))}

      <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center" }}>
        <button className="btn btn--primary" onClick={handleSave}>
          Enregistrer les paramètres
        </button>
        {msg && <span className={`inline-msg inline-msg--${msg.type}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
