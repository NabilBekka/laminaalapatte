const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function seed() {
  const client = await pool.connect();

  try {
    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await client.query(schema);
    console.log("✓ Schema created");

    // Clear existing data
    await client.query("DELETE FROM creation_images");
    await client.query("DELETE FROM creations");
    await client.query("DELETE FROM services");
    await client.query("DELETE FROM site_settings");
    await client.query("DELETE FROM social_links");
    console.log("✓ Existing data cleared");

    // ── Site Settings ──
    const settings = [
      ["logo_url", "/logo.jpg"],
      [
        "about_text",
        "Derrière chaque création se cache une passion débordante pour l'art sucré. La Mina à La Pate est née de l'envie de transformer des ingrédients simples en véritables œuvres d'art gourmandes. Chaque gâteau est conçu sur mesure, avec des produits frais et de qualité, pour sublimer vos moments les plus précieux — mariages, anniversaires, baptêmes ou simplement le plaisir de se faire plaisir.",
      ],
      ["location", "Île-de-France"],
      ["email", "contact@laminaalapate.fr"],
      ["phone", "06 XX XX XX XX"],
    ];

    for (const [key, value] of settings) {
      await client.query(
        "INSERT INTO site_settings (key, value) VALUES ($1, $2)",
        [key, value]
      );
    }
    console.log("✓ Site settings seeded");

    // ── Creations ──
    const creations = [
      {
        title: "Wedding Cake Romantique",
        description:
          "Un gâteau de mariage à trois étages orné de fleurs en sucre délicates et de drapés fondants, dans des tons roses et ivoire.",
        event_type: "Mariage",
        main_image: "/uploads/creations/wedding-cake-romantique.jpg",
        sort_order: 1,
      },
      {
        title: "Entremets Passion-Mangue",
        description:
          "Un entremets exotique alliant la douceur de la mangue à l'acidulé du fruit de la passion, sur un croustillant spéculoos.",
        event_type: "Entremets",
        main_image: "/uploads/creations/entremets-passion.jpg",
        sort_order: 2,
      },
      {
        title: "Cupcakes Fleuris",
        description:
          "Une collection de cupcakes vanille et framboise décorés de fleurs en crème au beurre dans des teintes pastel.",
        event_type: "Cupcakes",
        main_image: "/uploads/creations/cupcakes-fleuris.jpg",
        sort_order: 3,
      },
      {
        title: "Layer Cake Fraises des Bois",
        description:
          "Un layer cake moelleux garni de crème mascarpone et de fraises des bois fraîches, décoré d'un drip au chocolat blanc.",
        event_type: "Gâteaux",
        main_image: "/uploads/creations/layer-cake-fraises.jpg",
        sort_order: 4,
      },
      {
        title: "Cake Design Personnalisé",
        description:
          "Un gâteau d'anniversaire entièrement personnalisé avec un thème au choix du client — ici un univers féérique en pâte à sucre.",
        event_type: "Anniversaire",
        main_image: "/uploads/creations/cake-design-perso.jpg",
        sort_order: 5,
      },
      {
        title: "Number Cake Élégant",
        description:
          "Un number cake garni de crème diplomate, macarons, meringues et fruits frais pour un anniversaire mémorable.",
        event_type: "Anniversaire",
        main_image: "/uploads/creations/number-cake.jpg",
        sort_order: 6,
      },
      {
        title: "Macaron Tower Doré",
        description:
          "Une pyramide de macarons aux saveurs variées — pistache, rose, caramel, chocolat — pour une pièce montée moderne.",
        event_type: "Mariage",
        main_image: "/uploads/creations/macaron-tower.jpg",
        sort_order: 7,
      },
      {
        title: "Baby Shower Cake Pastel",
        description:
          "Un gâteau baby shower tout en douceur avec des tons pastel, des petits chaussons en pâte à sucre et un dégradé de crème.",
        event_type: "Baby Shower",
        main_image: "/uploads/creations/baby-shower-cake.jpg",
        sort_order: 8,
      },
      {
        title: "Sweet Table Enchantée",
        description:
          "Une table gourmande complète avec cupcakes, cake pops, sablés décorés et mini tartelettes assortis au thème de l'événement.",
        event_type: "Événement",
        main_image: "/uploads/creations/sweet-table.jpg",
        sort_order: 9,
      },
    ];

    for (const c of creations) {
      await client.query(
        "INSERT INTO creations (title, description, event_type, main_image, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [c.title, c.description, c.event_type, c.main_image, c.sort_order]
      );
    }
    console.log(`✓ ${creations.length} creations seeded`);

    // ── Services ──
    const services = [
      {
        title: "Gâteaux sur Mesure",
        description:
          "Wedding cakes, layer cakes, number cakes — chaque pièce est unique et créée selon vos envies et votre thème.",
        sort_order: 1,
      },
      {
        title: "Sweet Tables",
        description:
          "Cupcakes, cake pops, macarons, sablés décorés — une table gourmande complète pour vos événements.",
        sort_order: 2,
      },
      {
        title: "Événements",
        description:
          "Mariages, baptêmes, anniversaires, gender reveal — nous accompagnons chacun de vos moments précieux.",
        sort_order: 3,
      },
    ];

    for (const s of services) {
      await client.query(
        "INSERT INTO services (title, description, sort_order) VALUES ($1, $2, $3)",
        [s.title, s.description, s.sort_order]
      );
    }
    console.log(`✓ ${services.length} services seeded`);

    // ── Social Links ──
    const socialLinks = [
      { platform: "instagram", url: "https://www.instagram.com/laminaalapate", sort_order: 1 },
      { platform: "facebook", url: "https://www.facebook.com/laminaalapate", sort_order: 2 },
      { platform: "tiktok", url: "https://www.tiktok.com/@laminaalapate", sort_order: 3 },
    ];

    for (const s of socialLinks) {
      await client.query(
        "INSERT INTO social_links (platform, url, sort_order) VALUES ($1, $2, $3)",
        [s.platform, s.url, s.sort_order]
      );
    }
    console.log(`✓ ${socialLinks.length} social links seeded`);

    console.log("\n🎀 Database seeded successfully!");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
