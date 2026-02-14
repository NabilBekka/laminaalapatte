const router = require("express").Router();
const pool = require("../db");

// GET /api/social-links
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM social_links ORDER BY sort_order ASC");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/social-links error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/social-links/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;
    const { rows } = await pool.query(
      "UPDATE social_links SET url = $1 WHERE id = $2 RETURNING *",
      [url, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Lien introuvable" });
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/social-links error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
