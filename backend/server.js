const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files (images etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/settings", require("./routes/settings"));
app.use("/api/creations", require("./routes/creations"));
app.use("/api/services", require("./routes/services"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/social-links", require("./routes/socialLinks"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🎀 La Mina API running on http://localhost:${PORT}`);
  console.log(`   Routes:`);
  console.log(`   GET  /api/settings`);
  console.log(`   GET  /api/creations`);
  console.log(`   GET  /api/creations/:id`);
  console.log(`   GET  /api/services`);
  console.log(`   POST /api/contact\n`);
});
