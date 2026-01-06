import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DoctorNotifications() {
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
      <Text style={{ fontSize: 20, fontWeight: "800", marginBottom: 12, color: colors.primary }}>Centre des notifications</Text>
      
      {loading && items.length === 0 ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card title={item.title} subtitle="">
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: "#666" }}>
                {formatDateTime(item.createdAt)}
              </Text>
              <Badge label="Médecins" type="doctor" />
            </View>
            <Text style={{ marginTop: 8, color: "#111827" }}>{item.body}</Text>
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
