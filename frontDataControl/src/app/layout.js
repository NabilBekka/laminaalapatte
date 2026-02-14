import "./globals.css";

export const metadata = {
  title: "Administration — La Mina à La Pate",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
