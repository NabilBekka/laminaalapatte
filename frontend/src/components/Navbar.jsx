"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className={`nav${scrolled ? " nav--scrolled" : ""}`}>
        <Link href="/" className="nav__logo">
          La Mina à La Pate
        </Link>
        <ul className="nav__links">
          <li><Link href="/#about" className="nav__link">À propos</Link></li>
          <li><Link href="/creations" className="nav__link">Nos Créations</Link></li>
          <li><Link href="/#services" className="nav__link">Services</Link></li>
          <li><Link href="/#contact" className="nav__link">Devis</Link></li>
        </ul>
        <button
          className="nav__toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div className={`nav-mobile${mobileOpen ? " nav-mobile--open" : ""}`}>
        <button className="nav-mobile__close" onClick={closeMobile}>
          ✕
        </button>
        <Link href="/#about" onClick={closeMobile}>À propos</Link>
        <Link href="/creations" onClick={closeMobile}>Nos Créations</Link>
        <Link href="/#services" onClick={closeMobile}>Services</Link>
        <Link href="/#contact" onClick={closeMobile}>Demander un devis</Link>
      </div>
    </>
  );
}
