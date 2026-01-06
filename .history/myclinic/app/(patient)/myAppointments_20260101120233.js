import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // Fetch all appointments for patient (uses simple index on patientId)
        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => {
          const data = d.data();
          return { id: d.id, ...data };
        });

        // Client-side sort by scheduledAt (desc)
        docs.sort((a, b) => {
          const tA = a.scheduledAt?.seconds || 0;
          const tB = b.scheduledAt?.seconds || 0;
          return tB - tA; // Descending
        });

        setItems(docs);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger les rendez-vous");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Mes rendez-vous</Text>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      
      <View style={{ gap: 8 }}>
        {items.length === 0 && !loading ? <Text>Aucun rendez-vous.</Text> : null}
        {items.map(a => (
          <Card key={a.id} title={a.doctorName || "Médecin"} subtitle={`Le ${a.date} à ${a.time}`}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Badge label={a.status} type={a.status} />
              <Text>{a.clinicName}</Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
