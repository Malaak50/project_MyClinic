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
        // Schema: userId, createdAt (desc)
        // Index exists: userId ASC, createdAt DESC
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
