import "./globals.css";

export const metadata = {
  title: "La Mina à La Pate — Pâtisserie Artisanale",
  description:
    "Pâtisserie artisanale sur mesure. Gâteaux de mariage, anniversaires, sweet tables et événements en Île-de-France.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
