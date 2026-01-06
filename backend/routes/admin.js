const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = Router();

router.get("/users", requireAuth, requireRole(["admin"]), async (req, res) => {
  res.json({ users: [] });
});

router.get("/appointments", requireAuth, requireRole(["admin"]), async (req, res) => {
  res.json({ appointments: [] });
});

module.exports = router;

