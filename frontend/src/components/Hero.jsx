export default function Hero({ logoUrl }) {
  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="hero__deco" />
      <div className="hero__content">
        <div className="hero__logo">
          <img
            src={logoUrl || "/logo.jpg"}
            alt="La Mina à La Pate — Pâtisserie Artisanale"
            width={300}
            height={300}
          />
        </div>
        <p className="hero__tagline">L&apos;art de la pâtisserie, fait avec amour</p>
        <p className="hero__subtitle">Pâtisserie artisanale sur mesure</p>
        <a href="#contact" className="hero__cta">
          Demander un devis
        </a>
      </div>
      <div className="hero__scroll">
        <span>Découvrir</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
