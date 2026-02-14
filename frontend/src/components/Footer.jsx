export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__logo">La Mina à La Pate</div>
      <p className="footer__tagline">Pâtisserie Artisanale</p>
      <div className="footer__line" />
      <p className="footer__copy">
        © {new Date().getFullYear()} La Mina à La Pate — Tous droits réservés
      </p>
    </footer>
  );
}
