function requireRole(roles) {
  return (req, res, next) => {
    const role = req.user?.role || req.user?.claims?.role || req.user?.customClaims?.role;
    if (!role || !roles.includes(role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { requireRole };

