const router = require("express").Router();
const pool = require("../db");

// Place targetId at targetRank, resequence everything else around it
async function resequenceServices(targetId, targetRank) {
  const { rows } = await pool.query("SELECT id FROM services ORDER BY sort_order ASC, id ASC");

  if (targetId && targetRank) {
    // Remove target from list, insert at desired position
    const others = rows.filter((r) => r.id !== targetId);
    const pos = Math.max(0, Math.min(targetRank - 1, others.length));
    others.splice(pos, 0, { id: targetId });
    for (let i = 0; i < others.length; i++) {
      await pool.query("UPDATE services SET sort_order = $1 WHERE id = $2", [i + 1, others[i].id]);
    }
  } else {
    // Simple resequence (after delete)
    for (let i = 0; i < rows.length; i++) {
      await pool.query("UPDATE services SET sort_order = $1 WHERE id = $2", [i + 1, rows[i].id]);
    }
  }
}

// GET /api/services
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM services ORDER BY sort_order ASC");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/services error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/services
router.post("/", async (req, res) => {
  try {
    const { title, description, sort_order } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Titre et description obligatoires" });
    }
    const { rows } = await pool.query(
      "INSERT INTO services (title, description, sort_order) VALUES ($1, $2, $3) RETURNING *",
      [title, description, sort_order || 9999]
    );
    await resequenceServices(rows[0].id, sort_order || rows[0].id);
    const { rows: updated } = await pool.query("SELECT * FROM services WHERE id = $1", [rows[0].id]);
    res.status(201).json(updated[0]);
  } catch (err) {
    console.error("POST /api/services error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/services/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, sort_order } = req.body;
    // Update fields (except sort_order which is handled by resequence)
    const { rows } = await pool.query(
      "UPDATE services SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 RETURNING *",
      [title, description, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Service introuvable" });
    // If sort_order was provided, resequence to place it correctly
    if (sort_order !== undefined && sort_order !== null) {
      await resequenceServices(parseInt(id), parseInt(sort_order));
    }
    const { rows: updated } = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("PUT /api/services error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/services/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query("DELETE FROM services WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Service introuvable" });
    await resequenceServices();
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/services error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
