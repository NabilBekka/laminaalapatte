import { fetchCreation } from "@/lib/api";
import Navbar from "@/components/Navbar";
import CreationDetail from "@/components/CreationDetail";
import Footer from "@/components/Footer";

export async function generateMetadata({ params }) {
  try {
    const p = await params;
    const creation = await fetchCreation(p.id);
    return {
      title: `${creation.title} — La Mina à La Pate`,
      description: creation.description,
    };
  } catch {
    return { title: "Création — La Mina à La Pate" };
  }
}

export default async function CreationPage({ params }) {
  const p = await params;
  let creation = null;

  try {
    creation = await fetchCreation(p.id);
  } catch (err) {
    console.error("Failed to fetch creation:", err.message);
  }

  if (!creation) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.5rem",
          color: "var(--warm-gray)",
        }}>
          Création introuvable.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CreationDetail creation={creation} />
      <Footer />
    </>
  );
}
