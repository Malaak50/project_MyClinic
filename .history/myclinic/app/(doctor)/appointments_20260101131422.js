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

        // Enrich with patient details
        const enrichedDocs = await Promise.all(docs.map(async (a) => {
          let patientName = "Patient";
          if (a.patientId) {
             try {
               // Schema: patients collection has userId. But appointments.patientId is usually uid.
               // Let's assume patientId is uid.
               const userRef = doc(db, "users", a.patientId);
               const userSnap = await getDoc(userRef);
               if (userSnap.exists()) {
                 const u = userSnap.data();
                 patientName = u.displayName || u.name || "Patient";
               }
             } catch (err) {
               console.log("Error fetching patient details", err);
             }
          }
          return { ...a, patientName };
        }));

        setItems(enrichedDocs);
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
           const dateStr = a.scheduledAt?.toDate ? a.scheduledAt.toDate().toLocaleString() : "Date inconnue";
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
