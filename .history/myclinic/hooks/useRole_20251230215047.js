import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

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
        let backendRole = data.role || null;
        if (!backendRole) {
          const snap = await getDoc(doc(db, "users", u.uid));
          backendRole = snap.exists() ? snap.data().role || null : null;
        }
        if (!backendRole && u.email === "adminmyclin@gmail.com") backendRole = "admin";
        setRole(backendRole);
      } else {
        let fallback = null;
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) fallback = snap.data().role || null;
        if (!fallback && u.email === "adminmyclin@gmail.com") fallback = "admin";
        setRole(fallback);
      }
      setLoading(false);
    }
    run();
  }, []);

  return { role, loading };
}
