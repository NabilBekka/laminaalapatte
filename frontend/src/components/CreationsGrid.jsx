"use client";

import { useEffect, useRef } from "react";
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

export default function CreationsGrid({ creations = [], homepage = false }) {
  const sectionRef = useRef(null);

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

  const getSpanClass = (index) => {
    if (!homepage) return "";
    if (index === 0) return "creations__item--span-row";
    if (index === 3) return "creations__item--span-col";
    return "";
  };

  const getImageUrl = (creation) => {
    if (!creation.main_image) return null;
    if (creation.main_image.startsWith("http")) return creation.main_image;
    return `${API_BASE}${creation.main_image}`;
  };

  return (
    <section className="section creations" id="creations" ref={sectionRef}>
      <p className="section__label reveal">Portfolio</p>
      <h2 className="section__title reveal">Nos Créations</h2>
      <div className="section__divider reveal" />

      <div className={`reveal ${homepage ? "creations__grid" : "creations__grid--full"}`}>
        {creations.map((creation, i) => {
          const imageUrl = getImageUrl(creation);
          return (
            <Link
              key={creation.id}
              href={`/creations/${creation.id}`}
              className={`creations__item ${getSpanClass(i)}`}
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

      {homepage && (
        <div className="creations__more reveal">
          <Link href="/creations" className="creations__more-link">
            Voir toutes nos créations
          </Link>
        </div>
      )}
    </section>
  );
}
