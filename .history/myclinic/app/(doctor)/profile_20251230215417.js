import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DoctorProfile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function run() {
      const u = auth.currentUser;
      if (!u) return;
      const snap = await getDoc(doc(db, "users", u.uid));
      setData(snap.exists() ? snap.data() : null);
    }
    run();
  }, []);

  if (!data) return <View style={{ padding: 16 }}><Text>Chargement...</Text></View>;

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Profil</Text>
      <Text>Nom: {data.displayName || "-"}</Text>
      <Text>Email: {data.email}</Text>
      <Text>Téléphone: {data.phone || "-"}</Text>
      <Text>Rôle: {data.role}</Text>
    </View>
  );
}

