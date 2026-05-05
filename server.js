/**
 * Voyage-Ed CRM Backend — server.js
 * Express + MongoDB Atlas + JWT Auth
 * Deploy on Railway / Render (free tier)
 */
const express      = require("express");
const mongoose     = require("mongoose");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
require("dotenv").config();
const leadsRouter  = require("./routes/leads");
const authRouter   = require("./routes/auth");
const app  = express();
const PORT = process.env.PORT || 5000;

// ––– CORS –––––––––––––––––––––––––––––––––––––––––––––––––––––––––
app.use(cors({
  origin: '*',  // Allow ALL origins temporarily
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get("/",           (_req, res) => res.json({ status: "Voyage-Ed API running ✅", version: "1.0.0" }));
app.get("/health",     (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use("/api/leads",  leadsRouter);
app.use("/api/auth",   authRouter);

// ─── 404 + GLOBAL ERROR ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ─── MONGODB + START ──────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
