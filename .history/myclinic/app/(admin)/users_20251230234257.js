import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

export default function AdminUsers() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const filters = [
    ...(role ? [{ field: "role", op: "==", value: role }] : []),
    ...(email ? [{ field: "email", op: "==", value: email }] : [])
  ];
  const { items, loading, hasMore, loadNextPage, reload } = usePaginatedQuery({
    collectionName: "users",
    filters,
    orderByField: "createdAt",
    order: "desc",
    pageSize: 10
  });

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Liste des utilisateurs</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput placeholder="Filtrer par email" value={email} onChangeText={setEmail} style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TextInput placeholder="Rôle (admin/doctor/patient)" value={role} onChangeText={setRole} style={{ width: 200, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TouchableOpacity onPress={reload} style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>Appliquer</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(u => (
          <Card key={u.uid || u.id} title={u.displayName || "-"} subtitle={u.email}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Badge label={u.role} type={u.role} />
              <Text>Phone: {u.phone || "-"}</Text>
            </View>
          </Card>
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
