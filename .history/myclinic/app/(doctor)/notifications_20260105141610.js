import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DoctorNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const pageSize = 20;

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const baseQ = query(
        collection(db, "notifications"),
        where("targetGroup", "in", ["all", "doctors"])
      );
      const snap = await getDocs(baseQ);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => {
        const av = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bv = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return bv - av;
      });
      setLoadedCount(Math.min(pageSize, sorted.length));
      setHasMore(sorted.length > pageSize);
      setItems(sorted.slice(0, pageSize));
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des données.");
      setItems([]);
      setHasMore(false);
    }
    setLoading(false);
  }

  async function loadNextPage() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const baseQ = query(
        collection(db, "notifications"),
        where("targetGroup", "in", ["all", "doctors"])
      );
      const snap = await getDocs(baseQ);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = docs.sort((a, b) => {
        const av = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bv = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return bv - av;
      });
      const nextCount = Math.min(sorted.length, loadedCount + pageSize);
      setItems(sorted.slice(0, nextCount));
      setLoadedCount(nextCount);
      setHasMore(nextCount < sorted.length);
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des données.");
      setHasMore(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Notifications</Text>
      
      {loading && items.length === 0 ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card title={item.title} subtitle={new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}>
            <Text style={{ marginTop: 4 }}>{item.body}</Text>
          </Card>
        )}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading && <Text>Aucune notification</Text>}
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
}
