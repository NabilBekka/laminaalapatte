const router = require("express").Router();
const pool = require("../db");

// GET /api/creations
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    let query = "SELECT * FROM creations ORDER BY sort_order ASC, created_at DESC";
    const params = [];
    if (limit) { query += " LIMIT $1"; params.push(parseInt(limit, 10)); }
    const { rows: creations } = await pool.query(query, params);
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
    const result = creations.map((c) => ({ ...c, additional_images: imagesMap[c.id] || [] }));
    res.json(result);
  } catch (err) {
    console.error("GET /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/creations/event-types
router.get("/event-types", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT event_type FROM creations ORDER BY event_type ASC");
    res.json(rows.map((r) => r.event_type));
  } catch (err) {
    console.error("GET /api/creations/event-types error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Image management (must be BEFORE /:id) ──

// PUT /api/creations/images/:imageId — update sort_order
router.put("/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    const { sort_order } = req.body;
    const { rows } = await pool.query(
      "UPDATE creation_images SET sort_order = $1 WHERE id = $2 RETURNING *",
      [sort_order, imageId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Image introuvable" });
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/creations/images error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/creations/images/:imageId
router.delete("/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;
    const { rowCount } = await pool.query("DELETE FROM creation_images WHERE id = $1", [imageId]);
    if (rowCount === 0) return res.status(404).json({ error: "Image introuvable" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/creations/images error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/creations/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM creations WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Creation not found" });
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

// POST /api/creations
router.post("/", async (req, res) => {
  try {
    const { title, description, event_type, main_image, sort_order, additional_images } = req.body;
    if (!title || !description || !event_type || !main_image) {
      return res.status(400).json({ error: "Titre, description, événement et image principale obligatoires" });
    }
    const { rows } = await pool.query(
      "INSERT INTO creations (title, description, event_type, main_image, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, description, event_type, main_image, sort_order || 0]
    );
    const creation = rows[0];
    // Insert additional images if provided
    if (additional_images && additional_images.length > 0) {
      for (const img of additional_images) {
        await pool.query(
          "INSERT INTO creation_images (creation_id, image_url, sort_order) VALUES ($1,$2,$3)",
          [creation.id, img.image_url, img.sort_order || 0]
        );
      }
    }
    // Re-fetch with images
    const { rows: imgs } = await pool.query(
      "SELECT * FROM creation_images WHERE creation_id = $1 ORDER BY sort_order", [creation.id]
    );
    res.status(201).json({ ...creation, additional_images: imgs });
  } catch (err) {
    console.error("POST /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/creations/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_type, main_image, sort_order } = req.body;
    const { rows } = await pool.query(
      `UPDATE creations SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        event_type = COALESCE($3, event_type),
        main_image = COALESCE($4, main_image),
        sort_order = COALESCE($5, sort_order)
       WHERE id = $6 RETURNING *`,
      [title, description, event_type, main_image, sort_order, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Création introuvable" });
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/creations/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query("DELETE FROM creations WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Création introuvable" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/creations/:id/images — add images to existing creation
router.post("/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, sort_order } = req.body;
    if (!image_url) return res.status(400).json({ error: "image_url obligatoire" });
    const { rows } = await pool.query(
      "INSERT INTO creation_images (creation_id, image_url, sort_order) VALUES ($1,$2,$3) RETURNING *",
      [id, image_url, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/creations/:id/images error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
