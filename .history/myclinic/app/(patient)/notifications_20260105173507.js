import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
4→import { db, auth } from "../../services/firebase";
5→import { colors } from "../../theme/colors";
6→import { Badge } from "../../components/Badge";

export default function PatientNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const personalQ = query(collection(db, "notifications"), where("userId", "==", auth.currentUser.uid));
        const groupQ = query(collection(db, "notifications"), where("targetGroup", "in", ["all", "patients"]));
        const [personalSnap, groupSnap] = await Promise.all([getDocs(personalQ), getDocs(groupQ)]);
        const docs = [
          ...personalSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          ...groupSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        ];
        const dedup = [];
        const seen = new Set();
        for (const n of docs) {
          if (!seen.has(n.id)) {
            dedup.push(n);
            seen.add(n.id);
          }
        }
        dedup.sort((a, b) => {
          const av = a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const bv = b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return bv - av;
        });
        setItems(dedup);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.primary }}>Centre des notifications</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 10 }}>
        {items.map(n => {
          const tg = n.targetGroup || "user";
          const badgeType = tg === "patients" ? "patient" : tg === "doctors" ? "doctor" : "admin";
          const badgeLabel = tg === "patients" ? "Patients" : tg === "doctors" ? "Médecins" : "Tous";
          return (
            <View key={n.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, backgroundColor: "#fff" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>{n.title}</Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ""}
                </Text>
              </View>
              <Text style={{ marginVertical: 8, color: "#111827" }}>{n.body}</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Badge label={`Cible: ${badgeLabel}`} type={badgeType} />
              </View>
            </View>
          );
        })}
        {items.length === 0 && !loading ? <Text style={{ color: "#666" }}>Aucune notification</Text> : null}
      </View>
    </ScrollView>
  );
}
