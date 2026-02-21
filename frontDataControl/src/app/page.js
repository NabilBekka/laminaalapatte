"use client";

import { useState, useEffect } from "react";
import { getSession, clearSession, verifyToken, logout } from "@/lib/auth";
import LoginPage from "@/components/LoginPage";
import SettingsForm from "@/components/SettingsForm";
import ServicesManager from "@/components/ServicesManager";
import CreationsManager from "@/components/CreationsManager";

const SECTIONS = [
  { id: "settings", label: "Paramètres du site", icon: "⚙️", Component: SettingsForm },
  { id: "services", label: "Nos Services", icon: "📋", Component: ServicesManager },
  { id: "creations", label: "Nos Créations", icon: "🎂", Component: CreationsManager },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [openSection, setOpenSection] = useState(null);

  // Check existing session on load
  useEffect(() => {
    async function checkSession() {
      const token = getSession();
      if (token) {
        try {
          const result = await verifyToken(token);
          if (result.valid) {
            setAuthenticated(true);
          } else {
            clearSession();
          }
        } catch {
          clearSession();
        }
      }
      setChecking(false);
    }
    checkSession();
  }, []);

  async function handleLogout() {
    const token = getSession();
    if (token) await logout(token);
    clearSession();
    setAuthenticated(false);
  }

  const toggle = (id) => setOpenSection(openSection === id ? null : id);

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#9E6B7B" }}>
        Chargement...
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <>
      <header className="admin-header">
        <span>🎀</span>
        <h1>La Mina à La Pate — Administration</h1>
        <button className="admin-header__logout" onClick={handleLogout}>
          Déconnexion
        </button>
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
