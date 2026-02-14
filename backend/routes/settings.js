const router = require("express").Router();
const pool = require("../db");

// GET /api/settings — all site settings as key-value object
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT key, value FROM site_settings ORDER BY id"
    );
    const settings = {};
    rows.forEach((r) => (settings[r.key] = r.value));
    res.json(settings);
  } catch (err) {
    console.error("GET /api/settings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
