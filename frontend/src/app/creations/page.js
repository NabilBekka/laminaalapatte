import { fetchCreations, fetchEventTypes } from "@/lib/api";
import Navbar from "@/components/Navbar";
import CreationsPageContent from "@/components/CreationsPageContent";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nos Créations — La Mina à La Pate",
  description: "Découvrez toutes nos créations pâtissières : gâteaux de mariage, anniversaires, sweet tables et plus.",
};

export default async function CreationsPage() {
  let creations = [];
  let eventTypes = [];

  try {
    [creations, eventTypes] = await Promise.all([
      fetchCreations(),
      fetchEventTypes(),
    ]);
  } catch (err) {
    console.error("Failed to fetch creations:", err.message);
  }

  return (
    <>
      <Navbar />
      <CreationsPageContent creations={creations} eventTypes={eventTypes} />
      <Footer />
    </>
  );
}
