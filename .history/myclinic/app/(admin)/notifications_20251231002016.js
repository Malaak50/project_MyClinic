import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";

export default function AdminNotifications() {
  const [userId, setUserId] = useState("");
  const [type, setType] = useState("");
  const filters = [
    ...(userId ? [{ field: "userId", op: "==", value: userId }] : []),
    ...(type ? [{ field: "type", op: "==", value: type }] : [])
  ];
  const { items, loading, hasMore, loadNextPage, reload, error } = usePaginatedQuery({
    collectionName: "notifications",
    filters,
    orderByField: "createdAt",
    order: "desc",
    pageSize: 10
  });

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Centre des notifications</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput placeholder="Filtrer par userId" value={userId} onChangeText={setUserId} style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TextInput placeholder="Type" value={type} onChangeText={setType} style={{ width: 200, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TouchableOpacity onPress={reload} style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>Filtrer</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <View style={{ gap: 8 }}>
        {items.map(n => (
          <View key={n.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }}>
            <Text style={{ fontWeight: "700" }}>{n.title}</Text>
            <Text>{n.body}</Text>
            <Text>Type: {n.type}</Text>
            <Text>Lu: {n.read ? "Oui" : "Non"}</Text>
          </View>
        ))}
      </View>
      {hasMore ? (
        <TouchableOpacity onPress={loadNextPage} style={{ alignSelf: "center", paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.secondary, borderRadius: 8 }}>
          <Text style={{ color: colors.secondary }}>Charger plus</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
