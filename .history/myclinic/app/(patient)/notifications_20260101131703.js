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
        // We fetch by targetGroup + userId. 
        // Index issue: targetGroup + createdAt. We'll remove createdAt from query.
        const q = query(
          collection(db, "notifications"),
          where("targetGroup", "in", ["all", "patient", auth.currentUser.uid])
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Client sort
        docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setItems(docs);
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
            <Text>{n.message}</Text>
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
