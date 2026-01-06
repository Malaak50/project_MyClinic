import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { auth } from "../../services/firebase";

export default function MedicalRecords() {
  const filters = [
    { field: "patientId", op: "==", value: auth.currentUser?.uid }
  ];

  const { items, loading, hasMore, loadNextPage, reload, error } = usePaginatedQuery({
    collectionName: "medical_records",
    filters,
    orderByField: "createdAt",
    order: "desc",
    pageSize: 10
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Mon Dossier Médical</Text>
      
      {loading && items.length === 0 ? <ActivityIndicator /> : null}
      
      {items.length === 0 && !loading ? (
        <Text style={{ color: "#666", fontStyle: "italic" }}>Aucun dossier médical trouvé.</Text>
      ) : null}

      <View style={{ gap: 10 }}>
        {items.map(r => (
          <View key={r.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700" }}>{r.type}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>{r.date}</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.primary, marginTop: 2 }}>Docteur: {r.doctorName}</Text>
            <Text style={{ marginTop: 8, color: "#4b5563" }}>{r.notes}</Text>
          </View>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity onPress={loadNextPage} style={{ alignSelf: "center", padding: 10 }}>
          <Text style={{ color: colors.secondary }}>Charger plus</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
