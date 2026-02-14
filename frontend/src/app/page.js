import { fetchSettings, fetchCreations, fetchServices, fetchSocialLinks } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import CreationsGrid from "@/components/CreationsGrid";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default async function Home() {
  let settings = {};
  let creations = [];
  let services = [];
  let socialLinks = [];

  try {
    [settings, creations, services, socialLinks] = await Promise.all([
      fetchSettings(),
      fetchCreations(7),
      fetchServices(),
      fetchSocialLinks(),
    ]);
  } catch (err) {
    console.error("Failed to fetch data:", err.message);
  }

  return (
    <>
      <Navbar />
      <Hero logoUrl={settings.logo_url} />
      <About text={settings.about_text} />
      <CreationsGrid creations={creations} homepage />
      <Services services={services} />
      <Contact settings={settings} socialLinks={socialLinks} />
      <Footer />
    </>
  );
}
