const router = require("express").Router();
const pool = require("../db");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// In-memory session tokens (simple approach, resets on server restart)
const validTokens = new Set();

// Generate a random 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a session token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Build styled HTML email for the auth code
function buildCodeEmail(code) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;background:#FFFAF8;border:1px solid #F5E1E8;border-radius:8px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#9E6B7B,#7A4F5D);padding:25px 30px;">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:400;">🔐 Connexion Administration</h1>
      </div>
      <div style="padding:30px;text-align:center;">
        <p style="color:#3A2E32;font-size:14px;margin-bottom:20px;">Votre code de connexion :</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#9E6B7B;padding:20px;background:#FDF5F7;border-radius:8px;border:2px dashed #E8C4CF;">
          ${code}
        </div>
        <p style="color:#9E9090;font-size:12px;margin-top:20px;">Ce code expire dans 10 minutes.</p>
      </div>
      <div style="padding:12px 20px;background:#FDF5F7;text-align:center;font-size:11px;color:#C9A0AE;">
        La Mina à La Pate — Administration
      </div>
    </div>
  `;
}

// POST /api/auth/send-code — generate and email a 6-digit code
router.post("/send-code", async (req, res) => {
  try {
    // 1. Get owner email from DB
    const { rows: settingsRows } = await pool.query(
      "SELECT value FROM site_settings WHERE key = 'email'"
    );
    const ownerEmail = settingsRows[0]?.value;

    if (!ownerEmail) {
      return res.status(500).json({ error: "Aucun email propriétaire configuré" });
    }

    // 2. Invalidate previous unused codes
    await pool.query("UPDATE auth_codes SET used = true WHERE used = false");

    // 3. Generate code, store with 10min expiry
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO auth_codes (code, expires_at) VALUES ($1, $2)",
      [code, expiresAt]
    );

    // 4. Send email via Resend
    if (resend) {
      const { error } = await resend.emails.send({
        from: "La Mina à La Pate <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `Code de connexion : ${code}`,
        html: buildCodeEmail(code),
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: "Erreur d'envoi de l'email" });
      }

      console.log(`✓ Auth code sent to ${ownerEmail}`);
    } else {
      // Dev mode: log code to console
      console.log(`⚠ RESEND not configured — Auth code: ${code}`);
    }

    // Return masked email for UI
    const masked = ownerEmail.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) =>
      a + "*".repeat(b.length) + c
    );

    res.json({ success: true, email: masked });
  } catch (err) {
    console.error("POST /api/auth/send-code error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/auth/verify-code — check the code, return a session token
router.post("/verify-code", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({ error: "Code invalide" });
    }

    const { rows } = await pool.query(
      "SELECT * FROM auth_codes WHERE code = $1 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [code]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Code invalide ou expiré" });
    }

    // Mark code as used
    await pool.query("UPDATE auth_codes SET used = true WHERE id = $1", [rows[0].id]);

    // Generate session token
    const token = generateToken();
    validTokens.add(token);

    // Auto-expire token after 24h
    setTimeout(() => validTokens.delete(token), 24 * 60 * 60 * 1000);

    console.log("✓ Admin authenticated");
    res.json({ success: true, token });
  } catch (err) {
    console.error("POST /api/auth/verify-code error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/auth/verify-token — check if a token is still valid
router.post("/verify-token", (req, res) => {
  const { token } = req.body;
  if (token && validTokens.has(token)) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const { token } = req.body;
  if (token) validTokens.delete(token);
  res.json({ success: true });
});

module.exports = router;
