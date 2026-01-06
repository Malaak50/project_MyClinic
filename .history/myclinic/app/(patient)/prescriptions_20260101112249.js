import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { auth } from "../../services/firebase";

export default function PatientPrescriptions() {
  const filters = [
    { field: "patientId", op: "==", value: auth.currentUser?.uid }
  ];

  const { items, loading, hasMore, loadNextPage, reload, error } = usePaginatedQuery({
    collectionName: "prescriptions",
    filters,
    orderByField: "createdAt",
    order: "desc",
    pageSize: 10
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Mes Prescriptions</Text>
      
      {loading && items.length === 0 ? <ActivityIndicator /> : null}

      {items.length === 0 && !loading ? (
        <Text style={{ color: "#666", fontStyle: "italic" }}>Aucune prescription trouvée.</Text>
      ) : null}

      <View style={{ gap: 10 }}>
        {items.map(p => (
          <View key={p.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "700" }}>Docteur: {p.doctorName}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>{p.date}</Text>
            </View>
            <View style={{ marginTop: 8 }}>
              {p.medications?.map((m, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600", color: "#374151" }}>{m.name}</Text>
                  <Text style={{ color: "#6b7280" }}>{m.dosage} - {m.duration}</Text>
                </View>
              ))}
            </View>
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
