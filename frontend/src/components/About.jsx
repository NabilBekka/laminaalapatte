"use client";

import { useEffect, useRef } from "react";

export default function About({ text }) {
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
      { threshold: 0.15 }
    );

    const els = sectionRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Split text to wrap brand name in styled span
  const renderText = (raw) => {
    if (!raw) return null;
    const parts = raw.split("La Mina à La Pate");
    if (parts.length === 1) return raw;
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span className="about__brand">La Mina à La Pate</span>
        )}
      </span>
    ));
  };

  return (
    <section className="section about" id="about" ref={sectionRef}>
      <div className="about__inner">
        <p className="section__label reveal">Notre histoire</p>
        <h2 className="section__title reveal">À propos</h2>
        <div className="section__divider reveal" />
        <p className="about__text reveal">{renderText(text)}</p>
        <div className="about__values">
          <div className="about__value reveal reveal--d1">
            <div className="about__value-icon">🎨</div>
            <span className="about__value-label">Sur Mesure</span>
          </div>
          <div className="about__value reveal reveal--d2">
            <div className="about__value-icon">💝</div>
            <span className="about__value-label">Fait avec Amour</span>
          </div>
        </div>
      </div>
    </section>
  );
}
