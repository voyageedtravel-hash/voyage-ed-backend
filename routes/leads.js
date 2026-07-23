/**
 * routes/leads.js
 *
 * GET    /api/leads           – list all (with optional filters)
 * GET    /api/leads/:id       – single lead
 * POST   /api/leads           – create (from website OR CRM)
 * PUT    /api/leads/:id       – full update from CRM
 * DELETE /api/leads/:id       – delete (auth required)
 */

const router  = require("express").Router();
const Lead    = require("../models/Lead");
const auth    = require("../middleware/auth");

// ─── LIST ──────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { status, search, assignedTo, source, limit = 500, skip = 0 } = req.query;
    const filter = {};
    if (status)     filter.leadStatus = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (source)     filter.source     = source;
    if (search) {
      filter.$or = [
        { clientName:  { $regex: search, $options: "i" } },
        { email:       { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
        { contactNo:   { $regex: search, $options: "i" } },
      ];
    }
    // Attachments are base64 blobs living inside dealData. Returning them for
    // every lead on every app load was re-downloading the entire document
    // library each time and burning bandwidth. The list view never renders
    // them — full attachments are served by GET /api/leads/:id instead.
    const leads = await Lead.find(filter)
      .select("-dealData.attachments")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SINGLE ────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CREATE ────────────────────────────────────────────────────────────────────
// Public route — website can POST without auth
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // If website sends _id as string uid, ignore it (let MongoDB create ObjectId)
    delete body._id;

    const lead = new Lead(body);
    await lead.save();
    res.status(201).json(lead.toObject());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── UPDATE ────────────────────────────────────────────────────────────────────
// Auth required — only CRM users can update
router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    delete body._id;
    delete body.__v;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE ────────────────────────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.json({ ok: true, deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
