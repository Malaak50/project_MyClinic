import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PatientProfile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function run() {
      const u = auth.currentUser;
      if (!u) return;
      
      try {
        // Fetch from both collections to get complete profile
        const userSnap = await getDoc(doc(db, "users", u.uid));
        const patientSnap = await getDoc(doc(db, "patients", u.uid));
        
        const userData = userSnap.exists() ? userSnap.data() : {};
        const patientData = patientSnap.exists() ? patientSnap.data() : {};
        
        setData({ ...userData, ...patientData });
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    }
    run();
  }, []);

  if (!data) return <View style={{ padding: 16 }}><Text>Chargement...</Text></View>;

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Mon Profil</Text>
      
      <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, gap: 8 }}>
        <Text style={{ fontWeight: "600", color: "#666" }}>Informations Personnelles</Text>
        <Text>Nom: {data.displayName || "-"}</Text>
        <Text>Email: {data.email}</Text>
        <Text>Téléphone: {data.phone || "-"}</Text>
        <Text>Date de naissance: {data.birthDate || "-"}</Text>
        <Text>Numéro d'assurance: {data.insuranceNumber || "-"}</Text>
      </View>

      <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8, gap: 8 }}>
        <Text style={{ fontWeight: "600", color: "#666" }}>Informations Médicales</Text>
        <Text>Allergies: {data.allergies && data.allergies.length > 0 ? data.allergies.join(", ") : "Aucune"}</Text>
        <Text>Maladies chroniques: {data.chronicConditions && data.chronicConditions.length > 0 ? data.chronicConditions.join(", ") : "Aucune"}</Text>
      </View>

      <Text style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 20 }}>
        Rôle: {data.role || "Patient"}
      </Text>
    </View>
  );
}

