"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

const GRADIENTS = [
  "linear-gradient(135deg, #E8C4CF 0%, #C9A0AE 100%)",
  "linear-gradient(135deg, #E8D5A8 0%, #C9A96E 100%)",
  "linear-gradient(135deg, #C9A0AE 0%, #9E6B7B 100%)",
  "linear-gradient(135deg, #F5E1E8 0%, #E8C4CF 100%)",
  "linear-gradient(135deg, #9E6B7B 0%, #7A4F5D 100%)",
  "linear-gradient(135deg, #C9A96E 0%, #C9A0AE 100%)",
  "linear-gradient(135deg, #E8C4CF 0%, #9E6B7B 100%)",
];

export default function CreationsPageContent({ creations = [], eventTypes = [] }) {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filters = ["Tous", ...eventTypes];

  const filtered = activeFilter === "Tous"
    ? creations
    : creations.filter((c) => c.event_type === activeFilter);

  const getImageUrl = (creation) => {
    if (!creation.main_image) return null;
    if (creation.main_image.startsWith("http")) return creation.main_image;
    return `${API_BASE}${creation.main_image}`;
  };

  return (
    <div className="creations-page">
      <div className="creations-page__header">
        <p className="section__label">Portfolio</p>
        <h1 className="section__title">Nos Créations</h1>
        <div className="section__divider" />
        <div className="creations-page__filters">
          {filters.map((type) => (
            <button
              key={type}
              className={`creations-page__filter${
                activeFilter === type ? " creations-page__filter--active" : ""
              }`}
              onClick={() => setActiveFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="creations-page__grid">
        <Link href="/" className="creations-page__back">
          ← Retour à l&apos;accueil
        </Link>

        <div className="creations__grid--full">
          {filtered.map((creation, i) => {
            const imageUrl = getImageUrl(creation);
            return (
              <Link
                key={creation.id}
                href={`/creations/${creation.id}`}
                className="creations__item"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="creations__item-bg"
                  style={
                    imageUrl
                      ? { backgroundImage: `url(${imageUrl})` }
                      : { background: GRADIENTS[i % GRADIENTS.length] }
                  }
                />
                <div className="creations__item-overlay" />
                <div className="creations__item-content">
                  <h3 className="creations__item-title">{creation.title}</h3>
                  <span className="creations__item-tag">{creation.event_type}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--warm-gray)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.2rem",
          }}>
            Aucune création dans cette catégorie pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
