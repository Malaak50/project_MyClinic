import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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

        // Fetch all appointments for patient
        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", uid)
        );
        const snap = await getDocs(q);
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Sort by scheduledAt (desc)
        docs.sort((a, b) => {
          const tA = a.scheduledAt?.seconds || 0;
          const tB = b.scheduledAt?.seconds || 0;
          return tB - tA;
        });

        // Enrich with doctor details
        const enrichedDocs = await Promise.all(docs.map(async (a) => {
          let doctorName = "Médecin";
          let clinicName = "";
          
          if (a.doctorId) {
             try {
               // 1. Get Doctor details (clinic)
               const docRef = doc(db, "doctors", a.doctorId);
               const docSnap = await getDoc(docRef);
               if (docSnap.exists()) {
                 clinicName = docSnap.data().clinicName || "";
               }

               // 2. Get User details (name)
               const userRef = doc(db, "users", a.doctorId);
               const userSnap = await getDoc(userRef);
               if (userSnap.exists()) {
                 const u = userSnap.data();
                 doctorName = u.displayName || u.name || "Médecin";
               }
             } catch (err) {
               console.log("Error fetching doctor details", err);
             }
          }
          return { ...a, doctorName, clinicName };
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
            <Card key={a.id} title={a.doctorName} subtitle={dateStr}>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Badge label={a.status} type={a.status} />
                {a.clinicName ? <Text style={{fontSize:12, color:"#666"}}>{a.clinicName}</Text> : null}
              </View>
              {a.reason ? <Text style={{marginTop:4, fontStyle:"italic"}}>{a.reason}</Text> : null}
            </Card>
           );
        })}
      </View>
    </ScrollView>
  );
}
