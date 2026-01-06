import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

export default function DoctorAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  function formatDateTime(v) {
    try {
      let d;
      if (!v) return "";
      if (typeof v?.toDate === "function") d = v.toDate();
      else if (typeof v === "object" && v?.seconds != null) d = new Date(v.seconds * 1000);
      else if (v instanceof Date) d = v;
      else if (typeof v === "string") {
        const parsed = new Date(v);
        if (!isNaN(parsed.getTime())) d = parsed;
        else return v;
      } else return "";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return "";
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // Fetch all appointments for doctor
        const q = query(
          collection(db, "appointments"),
          where("doctorId", "==", uid)
        );
        const snap = await getDocs(q);
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Client-side sort by scheduledAt (desc)
        docs.sort((a, b) => {
          const tA = a.scheduledAt?.seconds || 0;
          const tB = b.scheduledAt?.seconds || 0;
          return tB - tA; // Descending
        });

        // Use patientName from appointment when available, avoid reading users (permissions)
        const enriched = docs.map(a => ({ ...a, patientName: a.patientName || "Patient" }));
        setItems(enriched);
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
        {items.map(a => {
           const dateStr = a.scheduledAt ? formatDateTime(a.scheduledAt) : "Date inconnue";
           return (
             <Card key={a.id} title={a.reason || "Consultation"} subtitle={`Patient: ${a.patientName}`}>
               <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                 <Badge label={a.status} type={a.status} />
                 <Text>{dateStr}</Text>
               </View>
             </Card>
           );
        })}
      </View>
    </ScrollView>
  );
}
