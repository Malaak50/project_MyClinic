import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { useRouter } from "expo-router";

export default function MyAppointments() {
  const router = useRouter();
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

        // Use stored names in appointment to avoid permission issues
        const enrichedDocs = docs.map(a => ({
          ...a,
          doctorName: a.doctorName || "Médecin",
          clinicName: a.clinicName || "MyClinic"
        }));
        
        // Auto-complete past appointments (if not cancelled/completed)
        const nowMs = Date.now();
        for (const appt of enrichedDocs) {
          const tMs = appt.scheduledAt?.seconds ? appt.scheduledAt.seconds * 1000 : null;
          if (tMs && tMs < nowMs && appt.status !== "cancelled" && appt.status !== "completed") {
            try {
              await updateDoc(doc(db, "appointments", appt.id), { status: "completed" });
              appt.status = "completed";
            } catch {}
          }
        }
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
      <TouchableOpacity onPress={() => router.push("/(patient)/searchDoctors")} style={{ alignSelf: "flex-start", backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Prendre rendez-vous</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      
      <View style={{ gap: 8 }}>
        {items.length === 0 && !loading ? <Text>Aucun rendez-vous.</Text> : null}
        {items.map(a => {
           const dateStr = a.scheduledAt ? formatDateTime(a.scheduledAt) : "Date inconnue";
           const badgeType = a.status === "cancelled" ? "canceled" : (a.status === "pending" ? "requested" : a.status);
           return (
            <Card key={a.id} title={a.doctorName} subtitle={dateStr}>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Badge label={a.status} type={badgeType} />
                {a.clinicName ? <Text style={{fontSize:12, color:"#666"}}>{a.clinicName}</Text> : null}
              </View>
              {a.reason ? <Text style={{marginTop:4, fontStyle:"italic"}}>{a.reason}</Text> : null}
              {(a.status === "pending" || a.status === "confirmed") && (
                <TouchableOpacity 
                  onPress={async () => {
                    try {
                      await updateDoc(doc(db, "appointments", a.id), { status: "cancelled" });
                      if (a.slotKey) {
                        try { await deleteDoc(doc(db, "appointment_slots", a.slotKey)); } catch {}
                      }
                      setItems(prev => prev.map(it => it.id === a.id ? { ...it, status: "cancelled" } : it));
                    } catch (e) {
                      console.log("Cancel failed", e);
                    }
                  }} 
                  style={{ marginTop: 8, alignSelf: "flex-start", backgroundColor: "red", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ color: "#fff" }}>Annuler</Text>
                </TouchableOpacity>
              )}
            </Card>
           );
        })}
      </View>
    </ScrollView>
  );
}
