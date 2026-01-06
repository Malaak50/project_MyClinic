import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";

export default function PatientNotifications() {
  const { items, loading, hasMore, loadNextPage, error } = usePaginatedQuery({
    collectionName: "notifications",
    filters: [
      // Since "in" query is limited to 10 items and we have multiple target groups, 
      // we'll fetch all relevant ones and filter client-side or use separate queries if needed.
      // For simplicity, let's fetch 'all' and 'patients' target groups.
      // Firestore doesn't support logical OR directly in where clauses efficiently without multiple queries.
      // We will query for 'all' first, or rethink data structure. 
      // Better approach: query where targetGroup in ['all', 'patients']
      { field: "targetGroup", op: "in", value: ["all", "patients"] }
    ],
    orderByField: "createdAt",
    order: "desc",
    pageSize: 20
  });

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
