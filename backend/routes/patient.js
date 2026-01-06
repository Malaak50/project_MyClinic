const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = Router();

router.get("/me", requireAuth, requireRole(["patient"]), async (req, res) => {
  res.json({ profile: {}, appointments: [] });
});

router.post("/appointments", requireAuth, requireRole(["patient"]), async (req, res) => {
  res.json({ ok: true });
});

router.get("/appointments", requireAuth, requireRole(["patient"]), async (req, res) => {
  res.json({ items: [] });
});

router.get("/medical-records", requireAuth, requireRole(["patient"]), async (req, res) => {
  res.json({ items: [] });
});

router.get("/prescriptions", requireAuth, requireRole(["patient"]), async (req, res) => {
  res.json({ items: [] });
});

module.exports = router;

