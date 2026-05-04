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

// ─── CORS ──────────────────────────────────────────────────────────────────────
// Allow your Netlify website, CRM URL, and localhost dev
const ALLOWED_ORIGINS = [
  process.env.WEBSITE_URL,      // e.g. https://voyage-ed.netlify.app
  process.env.CRM_URL,          // e.g. https://voyage-ed-crm.netlify.app
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
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
