"use client";

import { useEffect, useRef } from "react";

export default function Services({ services = [] }) {
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

  return (
    <section className="section services" id="services" ref={sectionRef}>
      <p className="section__label reveal">Ce que nous proposons</p>
      <h2 className="section__title reveal">Nos Services</h2>
      <div className="section__divider reveal" />
      <div className="services__grid">
        {services.map((service, i) => (
          <div
            key={service.id}
            className={`services__card reveal reveal--d${i + 1}`}
          >
            <h3 className="services__card-title">{service.title}</h3>
            <p className="services__card-desc">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
