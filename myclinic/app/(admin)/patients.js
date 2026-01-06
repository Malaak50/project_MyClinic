import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

export default function AdminPatients() {
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    const qRef = query(collection(db, "users"), where("role", "==", "patient"));
    const unsub = onSnapshot(qRef, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setItems(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.primary }}>Patients</Text>
      <Text style={{ color: "#666" }}>Gestion des profils patients</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 10 }}>
        {items.map(p => (
          <Card key={p.id} title={p.displayName || "-"} subtitle={p.email || "-"}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 6 }}>
              <Badge label="patient" type="patient" />
              <Text style={{ color: "#666" }}>{p.phone || "-"}</Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
