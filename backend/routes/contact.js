const router = require("express").Router();
const pool = require("../db");

// POST /api/contact — submit a quote request
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, event_type, event_date, guests, message } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({ error: "Le prénom et l'email sont obligatoires." });
    }

    const { rows } = await pool.query(
      `INSERT INTO contact_requests
        (first_name, last_name, email, phone, event_type, event_date, guests, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [
        first_name,
        last_name || null,
        email,
        phone || null,
        event_type || null,
        event_date || null,
        guests ? parseInt(guests, 10) : null,
        message || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Votre demande a été envoyée avec succès !",
      id: rows[0].id,
    });
  } catch (err) {
    console.error("POST /api/contact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/contact — list all requests (for future admin)
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM contact_requests ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/contact error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
