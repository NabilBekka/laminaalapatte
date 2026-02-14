const router = require("express").Router();
const pool = require("../db");
const { Resend } = require("resend");

// Initialize Resend (fails gracefully if no key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Build a styled HTML email from form data
function buildEmailHtml(data) {
  const fields = [
    { label: "Prénom", value: data.first_name },
    { label: "Nom", value: data.last_name },
    { label: "Email", value: data.email },
    { label: "Téléphone", value: data.phone },
    { label: "Type d'événement", value: data.event_type },
    { label: "Date souhaitée", value: data.event_date },
    { label: "Message", value: data.message },
  ];

  const rows = fields
    .filter((f) => f.value)
    .map(
      (f) =>
        `<tr>
          <td style="padding:10px 15px;font-weight:600;color:#7A4F5D;vertical-align:top;white-space:nowrap;">${f.label}</td>
          <td style="padding:10px 15px;color:#3A2E32;">${f.value}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#FFFAF8;border:1px solid #F5E1E8;border-radius:8px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#9E6B7B,#7A4F5D);padding:25px 30px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:400;">🎀 Nouvelle demande de devis</h1>
      </div>
      <div style="padding:25px 20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${rows}
        </table>
      </div>
      <div style="padding:15px 20px;background:#FDF5F7;text-align:center;font-size:12px;color:#C9A0AE;">
        La Mina à La Pate — Pâtisserie Artisanale
      </div>
    </div>
  `;
}

// POST /api/contact — submit a quote request
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, event_type, event_date, message } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({ error: "Le prénom et l'email sont obligatoires." });
    }

    // 1. Save to database
    const { rows } = await pool.query(
      `INSERT INTO contact_requests
        (first_name, last_name, email, phone, event_type, event_date, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        first_name,
        last_name || null,
        email,
        phone || null,
        event_type || null,
        event_date || null,
        message || null,
      ]
    );

    // 2. Fetch owner email from database
    const { rows: settingsRows } = await pool.query(
      "SELECT value FROM site_settings WHERE key = 'email'"
    );
    const ownerEmail = settingsRows[0]?.value;

    // 3. Send email via Resend
    if (resend && ownerEmail) {
      try {
        const { data, error } = await resend.emails.send({
          from: "La Mina à La Pate <onboarding@resend.dev>",
          to: [ownerEmail],
          replyTo: email,
          subject: `Nouvelle demande de devis — ${first_name}${last_name ? " " + last_name : ""}`,
          html: buildEmailHtml({ first_name, last_name, email, phone, event_type, event_date, message }),
        });

        if (error) {
          console.error("Resend error:", error);
        } else {
          console.log(`✓ Email sent to ${ownerEmail} (id: ${data.id})`);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr.message);
        // Don't fail — data is already saved in DB
      }
    } else {
      console.log("⚠ Resend not configured — email skipped (data saved in DB)");
    }

    res.status(201).json({
      success: true,
      message: "Votre demande de devis a bien été envoyée !",
      id: rows[0].id,
    });
  } catch (err) {
    console.error("POST /api/contact error:", err);
    res.status(500).json({ error: "Nous avons un problème, veuillez réessayer ultérieurement." });
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
