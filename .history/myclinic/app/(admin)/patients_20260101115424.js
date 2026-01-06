import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";

function PatientCard({ patient }) {
  return (
    <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }}>
      <Text style={{ fontWeight: "700" }}>{patient.displayName || "-"}</Text>
      <Text>Email: {patient.email || "-"}</Text>
      <Text>Tel: {patient.phone || "-"}</Text>
    </View>
  );
}

export default function AdminPatients() {
  const [insuranceNumber, setInsuranceNumber] = useState("");
  
  const { items, loading, hasMore, loadNextPage, reload } = usePaginatedQuery({
    collectionName: "users", // Query users instead of patients for basic info
    filters: [
      { field: "role", op: "==", value: "patient" }
      // Removed insurance filter for now as it requires complex join or denormalization
    ],
    orderByField: "createdAt",
    order: "desc",
    pageSize: 10
  });
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Liste des patients</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput placeholder="Numéro d’assurance" value={insuranceNumber} onChangeText={setInsuranceNumber} style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} />
        <TouchableOpacity onPress={reload} style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" }}>
          <Text style={{ color: "#fff" }}>Filtrer</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(p => (
          <PatientCard key={p.id} patient={p} />
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
