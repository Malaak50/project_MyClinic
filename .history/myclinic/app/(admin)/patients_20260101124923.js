import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";

function PatientCard({ patient }) {
  return (
    <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }}>
      <Text style={{ fontWeight: "700" }}>{patient.displayName || "-"}</Text>
      <Text>Email: {patient.email || "-"}</Text>
      <Text>Tel: {patient.phone || "-"}</Text>
    </View>
  );
}

export default function AdminPatients() {
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "patient")
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Client-side sort by createdAt desc
        docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setItems(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Liste des patients</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(p => (
          <PatientCard key={p.id} patient={p} />
        ))}
      </View>
    </View>
  );
}
