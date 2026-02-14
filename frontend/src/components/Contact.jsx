"use client";

import { useState, useEffect, useRef } from "react";
import { submitContact } from "@/lib/api";

const PLATFORM_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.2 8.2 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z"/>
    </svg>
  ),
};

export default function Contact({ settings = {}, socialLinks = [] }) {
  const sectionRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    event_type: "",
    event_date: "",
    guests: "",
    message: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = sectionRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.email) {
      alert("Veuillez remplir au moins votre prénom et email.");
      return;
    }

    setLoading(true);
    try {
      await submitContact(form);
      setSubmitted(true);
    } catch (err) {
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section contact" id="contact" ref={sectionRef}>
      <p className="section__label reveal">Parlons de votre projet</p>
      <h2 className="section__title reveal">Demande de Devis</h2>
      <div className="section__divider reveal" />

      <div className="contact__inner">
        {/* Left: info */}
        <div className="contact__info reveal">
          <h3>Envie d&apos;une création unique ?</h3>
          <p>
            Décrivez-nous votre projet et nous vous répondrons avec un devis
            personnalisé dans les 48 heures. Chaque création est unique, pensée
            et réalisée spécialement pour vous.
          </p>

          <div className="contact__detail">
            <div className="contact__detail-icon">📍</div>
            <div className="contact__detail-text">
              <strong>Localisation</strong>
              {settings.location || "Île-de-France"}
            </div>
          </div>
          <div className="contact__detail">
            <div className="contact__detail-icon">📧</div>
            <div className="contact__detail-text">
              <strong>Email</strong>
              {settings.email || "contact@laminaalapate.fr"}
            </div>
          </div>
          <div className="contact__detail">
            <div className="contact__detail-icon">📱</div>
            <div className="contact__detail-text">
              <strong>Téléphone</strong>
              {settings.phone || "06 XX XX XX XX"}
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="contact__social">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="contact__social-link"
                  title={link.platform}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {PLATFORM_ICONS[link.platform] || link.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: form */}
        <div className="contact__form reveal reveal--d1">
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <h3 className="contact__form-title">Votre projet gourmand</h3>
              <p className="contact__form-subtitle">
                Remplissez le formulaire, nous reviendrons vers vous rapidement
              </p>

              <div className="form__row">
                <div className="form__group">
                  <label htmlFor="first_name">Prénom *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    placeholder="Votre prénom"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="last_name">Nom</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Votre nom"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form__row">
                <div className="form__group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="votre@email.fr"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="phone">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="06 XX XX XX XX"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form__group">
                <label htmlFor="event_type">Type d&apos;événement</label>
                <select
                  id="event_type"
                  name="event_type"
                  value={form.event_type}
                  onChange={handleChange}
                >
                  <option value="" disabled>Choisissez un événement</option>
                  <option value="Mariage">Mariage</option>
                  <option value="Anniversaire">Anniversaire</option>
                  <option value="Baptême">Baptême</option>
                  <option value="Baby Shower">Baby Shower / Gender Reveal</option>
                  <option value="Entreprise">Événement d&apos;entreprise</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="form__row">
                <div className="form__group">
                  <label htmlFor="event_date">Date souhaitée</label>
                  <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    value={form.event_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="form__group">
                  <label htmlFor="guests">Nombre de personnes</label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    placeholder="Ex: 50"
                    min="1"
                    value={form.guests}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form__group">
                <label htmlFor="message">Décrivez votre projet</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Décrivez le gâteau ou les pâtisseries souhaitées, le thème, les parfums, les couleurs..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="form__submit"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Envoyer ma demande"}
              </button>
              <p className="form__note">Réponse sous 48h · Sans engagement</p>
            </form>
          ) : (
            <div className="form__success">
              <div className="form__success-icon">🎀</div>
              <h3 className="form__success-title">Merci pour votre demande !</h3>
              <p className="form__success-text">
                Nous avons bien reçu votre projet et nous vous répondrons avec un
                devis personnalisé dans les 48 heures.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
