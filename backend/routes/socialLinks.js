const router = require("express").Router();
const pool = require("../db");

// GET /api/social-links
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM social_links ORDER BY sort_order ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/social-links error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
