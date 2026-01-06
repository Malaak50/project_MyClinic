import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

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

      try {
        const token = await u.getIdToken();
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        
        let backendRole = null;
        let fetchSuccess = false;

        if (apiUrl) {
          try {
            const res = await fetch(`${apiUrl}/auth/verify`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              backendRole = data.role || null;
              fetchSuccess = true;
            }
          } catch (err) {
            console.log("Backend unreachable, falling back to Firestore:", err);
          }
        }

        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (!backendRole) {
          backendRole = snap.exists() ? snap.data().role || null : null;
        }
        
        // Admin hardcoded fallback
        if (!backendRole && u.email === "adminmyclinic@gmail.com") backendRole = "admin";
        
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            role: backendRole || "patient",
            email: u.email || "",
            displayName: u.displayName || "",
            phone: u.phoneNumber || "",
            createdAt: serverTimestamp()
          });
        }
        setRole(backendRole);

      } catch (e) {
        console.error("Role check error:", e);
        // Emergency fallback if everything fails
        setRole("patient");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  return { role, loading };
}
