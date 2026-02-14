const router = require("express").Router();
const pool = require("../db");

// GET /api/creations — all creations (with optional ?limit=7)
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    let query = "SELECT * FROM creations ORDER BY sort_order ASC, created_at DESC";
    const params = [];

    if (limit) {
      query += " LIMIT $1";
      params.push(parseInt(limit, 10));
    }

    const { rows: creations } = await pool.query(query, params);

    // Fetch additional images for each creation
    const ids = creations.map((c) => c.id);
    let imagesMap = {};

    if (ids.length > 0) {
      const { rows: images } = await pool.query(
        "SELECT * FROM creation_images WHERE creation_id = ANY($1) ORDER BY sort_order",
        [ids]
      );
      images.forEach((img) => {
        if (!imagesMap[img.creation_id]) imagesMap[img.creation_id] = [];
        imagesMap[img.creation_id].push(img);
      });
    }

    const result = creations.map((c) => ({
      ...c,
      additional_images: imagesMap[c.id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/creations/event-types — distinct event types from DB
router.get("/event-types", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT DISTINCT event_type FROM creations ORDER BY event_type ASC"
    );
    res.json(rows.map((r) => r.event_type));
  } catch (err) {
    console.error("GET /api/creations/event-types error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/creations/:id — single creation with images
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM creations WHERE id = $1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Creation not found" });
    }

    const { rows: images } = await pool.query(
      "SELECT * FROM creation_images WHERE creation_id = $1 ORDER BY sort_order",
      [id]
    );

    res.json({ ...rows[0], additional_images: images });
  } catch (err) {
    console.error("GET /api/creations/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
