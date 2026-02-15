const router = require("express").Router();
const pool = require("../db");

// Place targetId at targetRank, resequence everything else around it
async function resequenceCreations(targetId, targetRank) {
  const { rows } = await pool.query("SELECT id FROM creations ORDER BY sort_order ASC, id ASC");

  if (targetId && targetRank) {
    const others = rows.filter((r) => r.id !== targetId);
    const pos = Math.max(0, Math.min(targetRank - 1, others.length));
    others.splice(pos, 0, { id: targetId });
    for (let i = 0; i < others.length; i++) {
      await pool.query("UPDATE creations SET sort_order = $1 WHERE id = $2", [i + 1, others[i].id]);
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      await pool.query("UPDATE creations SET sort_order = $1 WHERE id = $2", [i + 1, rows[i].id]);
    }
  }
}

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

// ── Image management (BEFORE /:id) ──

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
      [title, description, event_type, main_image, sort_order || 9999]
    );
    const creation = rows[0];
    if (additional_images && additional_images.length > 0) {
      for (const img of additional_images) {
        await pool.query(
          "INSERT INTO creation_images (creation_id, image_url, sort_order) VALUES ($1,$2,$3)",
          [creation.id, img.image_url, img.sort_order || 0]
        );
      }
    }
    await resequenceCreations(creation.id, sort_order || creation.id);
    const { rows: imgs } = await pool.query(
      "SELECT * FROM creation_images WHERE creation_id = $1 ORDER BY sort_order", [creation.id]
    );
    const { rows: updated } = await pool.query("SELECT * FROM creations WHERE id = $1", [creation.id]);
    res.status(201).json({ ...updated[0], additional_images: imgs });
  } catch (err) {
    console.error("POST /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/creations/:id — update fields + optionally reorder + batch image ops
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_type, main_image, sort_order, images_to_delete, images_to_add } = req.body;

    const { rows } = await pool.query(
      `UPDATE creations SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        event_type = COALESCE($3, event_type),
        main_image = COALESCE($4, main_image)
       WHERE id = $5 RETURNING *`,
      [title, description, event_type, main_image, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Création introuvable" });

    // Rank
    if (sort_order !== undefined && sort_order !== null) {
      await resequenceCreations(parseInt(id), parseInt(sort_order));
    }

    // Batch delete images
    if (images_to_delete && images_to_delete.length > 0) {
      for (const imgId of images_to_delete) {
        await pool.query("DELETE FROM creation_images WHERE id = $1 AND creation_id = $2", [imgId, id]);
      }
    }

    // Batch add images
    if (images_to_add && images_to_add.length > 0) {
      const { rows: existingImgs } = await pool.query(
        "SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM creation_images WHERE creation_id = $1", [id]
      );
      let nextOrder = (existingImgs[0]?.max_order || 0) + 1;
      for (const url of images_to_add) {
        await pool.query(
          "INSERT INTO creation_images (creation_id, image_url, sort_order) VALUES ($1,$2,$3)",
          [id, url, nextOrder++]
        );
      }
    }

    // Return updated creation with images
    const { rows: updated } = await pool.query("SELECT * FROM creations WHERE id = $1", [id]);
    const { rows: imgs } = await pool.query(
      "SELECT * FROM creation_images WHERE creation_id = $1 ORDER BY sort_order", [id]
    );
    res.json({ ...updated[0], additional_images: imgs });
  } catch (err) {
    console.error("PUT /api/creations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/creations/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM creation_images WHERE creation_id = $1", [id]);
    const { rowCount } = await pool.query("DELETE FROM creations WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Création introuvable" });
    await resequenceCreations();
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
