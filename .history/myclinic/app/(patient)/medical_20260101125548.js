import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";

export default function PatientMedicalRecords() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "medical_records"),
          where("patientId", "==", auth.currentUser?.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Client sort
        docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setItems(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (auth.currentUser?.uid) load();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Dossier Médical</Text>
      
      {loading ? <ActivityIndicator /> : null}

      {items.length === 0 && !loading ? (
        <Text style={{ color: "#666", fontStyle: "italic" }}>Aucun dossier trouvé.</Text>
      ) : null}

      <View style={{ gap: 10 }}>
        {items.map(m => (
          <View key={m.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700" }}>{m.diagnosis}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>{m.date}</Text>
            </View>
            <Text style={{ marginTop: 4 }}>Docteur: {m.doctorName}</Text>
            <Text style={{ marginTop: 4, color: "#4b5563" }}>{m.notes}</Text>
            {m.attachments?.length > 0 && (
               <Text style={{ marginTop: 4, color: colors.primary, fontSize: 12 }}>{m.attachments.length} pièces jointes</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
