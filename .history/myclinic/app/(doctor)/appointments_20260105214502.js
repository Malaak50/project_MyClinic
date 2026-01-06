import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
        
        // Auto-complete past appointments if not cancelled/completed
        const nowMs = Date.now();
        for (const appt of enriched) {
          const tMs = appt.scheduledAt?.seconds ? appt.scheduledAt.seconds * 1000 : null;
          if (tMs && tMs < nowMs && appt.status !== "cancelled" && appt.status !== "completed") {
            try {
              await updateDoc(doc(db, "appointments", appt.id), { status: "completed" });
              appt.status = "completed";
            } catch {}
          }
        }
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
           const badgeType = a.status === "cancelled" ? "canceled" : (a.status === "pending" ? "requested" : a.status);
           return (
             <Card key={a.id} title={a.reason || "Consultation"} subtitle={`Patient: ${a.patientName}`}>
               <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
               <Badge label={a.status} type={badgeType} />
               <Text>{dateStr}</Text>
              </View>
              {(a.status === "pending") && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await updateDoc(doc(db, "appointments", a.id), { status: "confirmed" });
                        setItems(prev => prev.map(it => it.id === a.id ? { ...it, status: "confirmed" } : it));
                      } catch {}
                    }}
                    style={{ backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await updateDoc(doc(db, "appointments", a.id), { status: "cancelled" });
                        setItems(prev => prev.map(it => it.id === a.id ? { ...it, status: "cancelled" } : it));
                      } catch {}
                    }}
                    style={{ backgroundColor: "red", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                  >
                    <Text style={{ color: "#fff" }}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
             </Card>
           );
        })}
      </View>
    </ScrollView>
  );
}
