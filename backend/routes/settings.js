const router = require("express").Router();
const pool = require("../db");

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT key, value FROM site_settings ORDER BY id");
    const settings = {};
    rows.forEach((r) => (settings[r.key] = r.value));
    res.json(settings);
  } catch (err) {
    console.error("GET /api/settings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/settings/:key
router.put("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const { rowCount } = await pool.query(
      "UPDATE site_settings SET value = $1, updated_at = NOW() WHERE key = $2",
      [value, key]
    );
    if (rowCount === 0) {
      await pool.query("INSERT INTO site_settings (key, value) VALUES ($1, $2)", [key, value]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("PUT /api/settings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
