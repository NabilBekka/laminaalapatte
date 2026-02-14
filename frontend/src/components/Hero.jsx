const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

function getLogoUrl(url) {
  if (!url) return "/logo.jpg";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE}${url}`;
  return url;
}

export default function Hero({ logoUrl }) {
  const src = getLogoUrl(logoUrl);

  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="hero__deco" />
      <div className="hero__content">
        <div className="hero__logo">
          <img src={src} alt="La Mina à La Pate — Pâtisserie Artisanale" width={300} height={300} />
        </div>
        <p className="hero__tagline">L&apos;art de la pâtisserie, fait avec amour</p>
        <p className="hero__subtitle">Pâtisserie artisanale sur mesure</p>
        <a href="#contact" className="hero__cta">Demander un devis</a>
      </div>
      <div className="hero__scroll">
        <span>Découvrir</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
