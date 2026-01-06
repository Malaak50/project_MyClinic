import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";

export default function AdminAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "appointments"));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.scheduledAt?.seconds || 0;
        const tb = b.scheduledAt?.seconds || 0;
        return tb - ta;
      });
      const enriched = await Promise.all(docs.map(async (a) => {
        let doctorName = a.doctorName || "";
        let clinicName = a.clinicName || "";
        let patientName = a.patientName || "";
        if (a.doctorId) {
          try {
            const dSnap = await getDoc(doc(db, "doctors", a.doctorId));
            if (dSnap.exists()) {
              const d = dSnap.data();
              clinicName = clinicName || d.clinicName || "MyClinic";
              doctorName = doctorName || d.name || doctorName;
            }
            const uSnap = await getDoc(doc(db, "users", a.doctorId));
            if (uSnap.exists()) {
              const u = uSnap.data();
              doctorName = doctorName || u.displayName || u.name || doctorName;
            }
          } catch {}
        }
        if (a.patientId) {
          try {
            const uSnap = await getDoc(doc(db, "users", a.patientId));
            if (uSnap.exists()) {
              const u = uSnap.data();
              patientName = patientName || u.displayName || u.name || u.email || patientName;
            }
          } catch {}
        }
        const dateStr = a.scheduledAt?.toDate ? a.scheduledAt.toDate().toLocaleDateString() : "";
        const timeStr = a.scheduledAt?.toDate ? a.scheduledAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
        return { ...a, doctorName, clinicName, patientName, dateStr, timeStr };
      }));
      setItems(enriched);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Gestion des rendez-vous</Text>
        <TouchableOpacity onPress={reload} style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Rafraîchir</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 10 }}>
        {items.map(a => (
          <Card key={a.id} title={`${a.patientName || "Patient"} → ${a.doctorName || "Docteur"}`} subtitle={`${a.dateStr} à ${a.timeStr}`}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Text style={{ color: colors.primary }}>{a.clinicName || "MyClinic"}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>{a.status}</Text>
            </View>
            {a.reason ? <Text style={{ marginTop: 4 }}>Raison: {a.reason}</Text> : null}
            {a.notes ? <Text style={{ marginTop: 4, color: "#4b5563" }}>Notes: {a.notes}</Text> : null}
          </Card>
        ))}
        {items.length === 0 && !loading ? <Text>Aucun rendez-vous.</Text> : null}
      </View>
    </ScrollView>
  );
}
