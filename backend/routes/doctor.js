const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = Router();

router.get("/me", requireAuth, requireRole(["doctor"]), async (req, res) => {
  res.json({ profile: {}, availability: [] });
});

router.get("/appointments", requireAuth, requireRole(["doctor"]), async (req, res) => {
  res.json({ items: [] });
});

router.post("/prescriptions", requireAuth, requireRole(["doctor"]), async (req, res) => {
  res.json({ ok: true });
});

module.exports = router;

