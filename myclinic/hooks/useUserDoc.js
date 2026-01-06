import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useUserDoc(uid) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      if (mounted) setUser(snap.exists() ? snap.data() : null);
    }
    run();
    return () => {
      mounted = false;
    };
  }, [uid]);
  return user;
}

