/**
 * Voyage-Ed CRM Backend — server.js
 * Express + MongoDB Atlas + JWT Auth
 */

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const compression = require("compression");
require("dotenv").config();

const leadsRouter = require("./routes/leads");
const authRouter  = require("./routes/auth");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── CORS (FIXED + FLEXIBLE) ─────────────────────────────────────
const allowedOrigins = [
  'https://remarkable-horse-c2fed5.netlify.app', // 🔥 YOUR LIVE SITE (IMPORTANT)
  'https://capable-naiad-cfa4af.netlify.app',
  'https://splendid-cactus-c8b150.netlify.app',
  'https://resonant-blancmange-4d3a03.netlify.app',
  'https://animated-donut-eb7622.netlify.app',
  'https://ephemeral-axolotl-371be0.netlify.app',
  'https://ornate-bubblegum-d3ee91.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(null, true); // 👈 TEMP: allow all (no blocking)
    }
  },
  credentials: true
}));

// ─── MIDDLEWARE ──────────────────────────────────────────────────
app.use(compression());          // gzip JSON responses — large bandwidth saving
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ──────────────────────────────────────────────────────
app.get("/", (_req, res) =>
  res.json({ status: "Voyage-Ed API running ✅", version: "1.0.0" })
);

app.get("/health", (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

app.use("/api/leads", leadsRouter);
app.use("/api/auth", authRouter);

// ─── ERROR HANDLING ──────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ error: "Route not found" })
);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── DATABASE + SERVER START ─────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
