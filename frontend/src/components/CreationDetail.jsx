"use client";

import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

const GRADIENT_MAIN = "linear-gradient(135deg, #E8C4CF 0%, #C9A0AE 60%, #9E6B7B 100%)";
const GRADIENT_SEC = "linear-gradient(135deg, #F5E1E8 0%, #E8C4CF 100%)";

export default function CreationDetail({ creation }) {
  const mainImage = getImageUrl(creation.main_image);
  const additionalImages = creation.additional_images || [];

  return (
    <div className="creation-detail">
      {/* Hero banner with main image */}
      <div className="creation-detail__hero">
        <div
          className="creation-detail__hero-bg"
          style={
            mainImage
              ? { backgroundImage: `url(${mainImage})` }
              : { background: GRADIENT_MAIN }
          }
        />
        <div className="creation-detail__hero-overlay" />
        <div className="creation-detail__hero-content">
          <span className="creation-detail__tag">{creation.event_type}</span>
          <h1 className="creation-detail__title">{creation.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="creation-detail__body">
        <Link href="/creations" className="creations-page__back">
          ← Toutes les créations
        </Link>

        <div className="creation-detail__info">
          <div className="creation-detail__meta">
            <span className="creation-detail__meta-label">Type d&apos;événement</span>
            <span className="creation-detail__meta-value">{creation.event_type}</span>
          </div>

          <p className="creation-detail__description">{creation.description}</p>

          {/* Main image full display */}
          <div className="creation-detail__main-image">
            {mainImage ? (
              <img src={mainImage} alt={creation.title} />
            ) : (
              <div
                className="creation-detail__main-image-placeholder"
                style={{ background: GRADIENT_MAIN }}
              >
                <span>{creation.title}</span>
              </div>
            )}
          </div>

          {/* Secondary images */}
          {additionalImages.length > 0 && (
            <>
              <h2 className="creation-detail__gallery-title">
                Plus de photos
              </h2>
              <div className="creation-detail__gallery">
                {additionalImages.map((img, i) => {
                  const url = getImageUrl(img.image_url);
                  return (
                    <div key={img.id || i} className="creation-detail__gallery-item">
                      {url ? (
                        <img src={url} alt={`${creation.title} - photo ${i + 1}`} />
                      ) : (
                        <div
                          className="creation-detail__gallery-placeholder"
                          style={{ background: GRADIENT_SEC }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* CTA */}
          <div className="creation-detail__cta">
            <p className="creation-detail__cta-text">
              Envie d&apos;une création similaire ?
            </p>
            <Link href="/#contact" className="creation-detail__cta-btn">
              Demander un devis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
