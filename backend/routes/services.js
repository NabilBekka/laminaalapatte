const router = require("express").Router();
const pool = require("../db");

// Re-sequence all sort_orders to be 1, 2, 3...
async function resequenceServices(client) {
  const conn = client || pool;
  const { rows } = await conn.query("SELECT id FROM services ORDER BY sort_order ASC, id ASC");
  for (let i = 0; i < rows.length; i++) {
    await conn.query("UPDATE services SET sort_order = $1 WHERE id = $2", [i + 1, rows[i].id]);
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
      [title, description, sort_order || 0]
    );
    await resequenceServices();
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
    const { rows } = await pool.query(
      "UPDATE services SET title = COALESCE($1, title), description = COALESCE($2, description), sort_order = COALESCE($3, sort_order) WHERE id = $4 RETURNING *",
      [title, description, sort_order, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Service introuvable" });
    await resequenceServices();
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
