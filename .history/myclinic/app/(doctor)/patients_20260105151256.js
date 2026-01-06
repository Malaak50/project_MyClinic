import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";

export default function DoctorPatients() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const q = query(collection(db, "appointments"), where("doctorId", "==", uid));
        const snap = await getDocs(q);
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const byPatient = new Map();
        for (const a of apps) {
          if (!a.patientId) continue;
          const prev = byPatient.get(a.patientId) || [];
          byPatient.set(a.patientId, [...prev, a]);
        }
        const patients = [];
        for (const [pid, list] of byPatient.entries()) {
          let name = "";
          let email = "";
          try {
            const uSnap = await getDoc(doc(db, "users", pid));
            if (uSnap.exists()) {
              const u = uSnap.data();
              name = u.displayName || u.name || "";
              email = u.email || "";
            }
          } catch {}
          const last = list.sort((a, b) => (b.scheduledAt?.seconds || 0) - (a.scheduledAt?.seconds || 0))[0];
          const lastStr = last?.scheduledAt?.toDate ? last.scheduledAt.toDate().toLocaleString() : "";
          patients.push({ id: pid, name: name || email || "Patient", email, lastAppointment: lastStr, count: list.length });
        }
        patients.sort((a, b) => a.name.localeCompare(b.name));
        setItems(patients);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Patients liés</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 10 }}>
        {items.map(p => (
          <Card key={p.id} title={p.name} subtitle={p.email}>
            <Text style={{ color: colors.primary }}>{p.count} rendez-vous</Text>
            {p.lastAppointment ? <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Dernier: {p.lastAppointment}</Text> : null}
            <TouchableOpacity style={{ marginTop: 8, alignSelf: "flex-start", backgroundColor: colors.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
              <Text style={{ color: "#fff" }}>Créer prescription / dossier</Text>
            </TouchableOpacity>
          </Card>
        ))}
        {items.length === 0 && !loading ? <Text>Aucun patient lié</Text> : null}
      </View>
    </ScrollView>
  );
}
