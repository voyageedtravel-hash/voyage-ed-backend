const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  id:     { type: String },
  amount: { type: Number, default: 0 },
  mode:   { type: String, default: "" },
  date:   { type: String, default: "" },
  note:   { type: String, default: "" },
}, { _id: false });

const LeadSchema = new mongoose.Schema(
  {
    // ── Client Info ────────────────────────────────────────────
    clientName:     { type: String, default: "" },
    contactNo:      { type: String, default: "" },
    email:          { type: String, default: "" },
    destination:    { type: String, default: "" },
    modeOfQuery:    { type: String, default: "Website" },
    enquiryType:    { type: String, default: "General Enquiry" },
    pageSource:     { type: String, default: "" },
    pax:            { type: mongoose.Schema.Types.Mixed, default: "" },
    travelDates:    { type: String, default: "" },
    notes:          { type: String, default: "" },
    packageVariant: { type: String, default: "" },

    // ── Deal Status ────────────────────────────────────────────
    leadStatus: {
      type: String,
      enum: [
        "Not Actioned",
        "In Progress",
        "Booked",
        "Cancelled Before Payment",
        "Cancelled After Payment",
        "Cancelled Due to Visa Rejection",
      ],
      default: "Not Actioned",
    },
    assignedTo: { type: String, default: "" },

    // ── Financial Overview ─────────────────────────────────────
    currency:      { type: String, default: "INR" },
    exchangeRate:  { type: Number, default: 1 },
    totalSelling:  { type: Number, default: 0 },
    totalCost:     { type: Number, default: 0 },
    totalProfit:   { type: Number, default: 0 },
    clientPayments: { type: [PaymentSchema], default: [] },

    // ── Cancellation / Refund ──────────────────────────────────
    cancellationReason: { type: String, default: "" },
    refundStatus:       { type: String, default: "" },
    refundPayments:     { type: [PaymentSchema], default: [] },

    // ── Full Deal Data (flexible nested object) ─────────────────
    // Stores the complete deal blob from the CRM (flights, hotels, visas, etc.)
    dealData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── Meta ──────────────────────────────────────────────────
    source:    { type: String, default: "manual" },  // "website" | "manual"
    createdBy: { type: String, default: "" },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt
    versionKey: false,
  }
);

// Text index for quick search in CRM
LeadSchema.index({ clientName: "text", email: "text", destination: "text" });

module.exports = mongoose.model("Lead", LeadSchema);
