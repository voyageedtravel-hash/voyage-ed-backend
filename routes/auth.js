/**
 * routes/auth.js
 *
 * POST /api/auth/login   – get JWT token
 * GET  /api/auth/me      – verify token + return user info
 *
 * Users are stored in .env as JSON for simplicity.
 * For production with many users, switch to a User MongoDB model.
 */

const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const auth    = require("../middleware/auth");

// ── Load users from ENV ────────────────────────────────────────────────────────
// USERS_JSON format in .env:
// [{"username":"vishal","passwordHash":"$2a$10$...","role":"admin"},{"username":"sahitya","passwordHash":"$2a$10$...","role":"staff"}]
function getUsers() {
  try {
    return JSON.parse(process.env.USERS_JSON || "[]");
  } catch {
    return [];
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  const users = getUsers();
  const user  = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match)  return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, username: user.username, role: user.role });
});

// ─── ME ───────────────────────────────────────────────────────────────────────
router.get("/me", auth, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
