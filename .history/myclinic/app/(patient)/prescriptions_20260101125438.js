import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";

export default function PatientPrescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "prescriptions"),
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
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Mes Prescriptions</Text>
      
      {loading ? <ActivityIndicator /> : null}

      {items.length === 0 && !loading ? (
        <Text style={{ color: "#666", fontStyle: "italic" }}>Aucune prescription trouvée.</Text>
      ) : null}

      <View style={{ gap: 10 }}>
        {items.map(p => (
          <View key={p.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700" }}>Docteur: {p.doctorName}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>{p.date}</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              {p.medications?.map((m, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600", color: "#374151" }}>{m.name}</Text>
                  <Text style={{ color: "#666" }}>{m.dosage} - {m.duration}</Text>
                </View>
              ))}
            </View>
            {p.notes ? <Text style={{ marginTop: 8, fontStyle: "italic", color: "#666" }}>Note: {p.notes}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
