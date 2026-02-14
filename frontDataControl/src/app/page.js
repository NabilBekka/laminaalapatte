"use client";

import { useState } from "react";
import SettingsForm from "@/components/SettingsForm";
import ServicesManager from "@/components/ServicesManager";
import CreationsManager from "@/components/CreationsManager";

const SECTIONS = [
  { id: "settings", label: "Paramètres du site", icon: "⚙️", Component: SettingsForm },
  { id: "services", label: "Nos Services", icon: "📋", Component: ServicesManager },
  { id: "creations", label: "Nos Créations", icon: "🎂", Component: CreationsManager },
];

export default function AdminPage() {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <>
      <header className="admin-header">
        <span>🎀</span>
        <h1>La Mina à La Pate — Administration</h1>
      </header>

      <div className="admin-container">
        {SECTIONS.map(({ id, label, icon, Component }) => (
          <div key={id} className="admin-section">
            <div className="admin-section__header" onClick={() => toggle(id)}>
              <h2>{icon} {label}</h2>
              <span className={`admin-section__arrow${openSection === id ? " admin-section__arrow--open" : ""}`}>
                ▼
              </span>
            </div>
            {openSection === id && (
              <div className="admin-section__body">
                <Component />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
