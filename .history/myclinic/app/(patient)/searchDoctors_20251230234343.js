import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";

export default function SearchDoctors() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const [specialty, setSpecialty] = useState("");
  const filters = [
    ...(status ? [{ field: "status", op: "==", value: status }] : []),
    ...(query ? [{ field: "clinicName", op: "==", value: query }] : []),
    ...(specialty ? [{ field: "specialties", op: "array-contains", value: specialty }] : [])
  ];
  const { items, loading, hasMore, loadNextPage, reload } = usePaginatedQuery({
    collectionName: "doctors",
    filters,
    orderByField: "clinicName",
    order: "asc",
    pageSize: 10
  });
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Recherche médecins</Text>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput placeholder="Clinique" value={query} onChangeText={setQuery} style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
          <TextInput placeholder="Statut (active/inactive)" value={status} onChangeText={setStatus} style={{ width: 200, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        </View>
        <TextInput placeholder="Spécialité (ex: cardiologie)" value={specialty} onChangeText={setSpecialty} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TouchableOpacity onPress={reload} style={{ alignSelf: "flex-start", backgroundColor: colors.secondary, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center", paddingVertical: 8 }}>
          <Text style={{ color: "#fff" }}>Rechercher</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(d => (
          <Card key={d.id} title={d.clinicName || "-"} subtitle={`Statut: ${d.status || "-"}`}>
            <Text>Spécialités: {(d.specialties || []).join(", ") || "-"}</Text>
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
