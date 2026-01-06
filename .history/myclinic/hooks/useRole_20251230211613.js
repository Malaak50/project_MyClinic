import { useEffect, useState } from "react";
import { auth } from "../services/firebase";

export function useRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const u = auth.currentUser;
      if (!u) {
        setRole(null);
        setLoading(false);
        return;
      }
      const token = await u.getIdToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const backendRole = data.role || null;
        if (!backendRole && u.email === "adminmyclin@gmail.com") {
          setRole("admin");
        } else {
          setRole(backendRole);
        }
      } else {
        if (u.email === "adminmyclin@gmail.com") setRole("admin");
        else setRole(null);
      }
      setLoading(false);
    }
    run();
  }, []);

  return { role, loading };
}
