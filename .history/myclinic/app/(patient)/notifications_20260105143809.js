import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";

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
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Notifications</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(n => (
          <View key={n.id} style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8 }}>
            <Text style={{ fontWeight: "700" }}>{n.title}</Text>
            <Text>{n.body}</Text>
            <Text style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
              {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ""}
            </Text>
          </View>
        ))}
        {items.length === 0 && !loading ? <Text>Aucune notification</Text> : null}
      </View>
    </View>
  );
}
