const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { auth } = require("./firebase/admin");
const { requireAuth } = require("./middleware/auth");
const { requireRole } = require("./middleware/role");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/auth/verify", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = await auth.verifyIdToken(token);
    const role = decoded.role || decoded.claims?.role || decoded.customClaims?.role || null;
    res.json({ uid: decoded.uid, role });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/auth/assign-role", requireAuth, requireRole(["admin"]), async (req, res) => {
  const { uid, role } = req.body || {};
  if (!uid || !role) return res.status(400).json({ error: "uid and role required" });
  if (!["admin", "doctor", "patient"].includes(role)) return res.status(400).json({ error: "invalid role" });
  try {
    await auth.setCustomUserClaims(uid, { role });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "failed to assign role" });
  }
});

app.use("/admin", require("./routes/admin"));
app.use("/doctor", require("./routes/doctor"));
app.use("/patient", require("./routes/patient"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MyClinic backend running on http://localhost:${port}`);
});

