/**
 * generate-password-hashes.js
 *
 * Run this script ONCE on your local machine to create password hashes.
 * Then paste the output into USERS_JSON in Railway's environment variables.
 *
 * Usage:
 *   node generate-password-hashes.js
 *
 * Requirements: npm install bcryptjs  (or run from inside voyage-ed-backend folder)
 */

const bcrypt = require("bcryptjs");

// ── SET YOUR USERS HERE ──────────────────────────────────────────────────────
const USERS = [
  { username: "vishal",  password: "Success@123", role: "admin" },
  { username: "sahitya", password: "Chandigarh@123", role: "staff" },
];
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const result = [];
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    result.push({ username: u.username, passwordHash: hash, role: u.role });
    console.log(`✅ ${u.username} (${u.role}) — hash generated`);
  }
  console.log("\n── Paste this entire line as USERS_JSON in Railway ──────────────\n");
  console.log(JSON.stringify(result));
  console.log("\n─────────────────────────────────────────────────────────────────\n");
}

main();
