import { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { auth } from "../../services/firebase";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";

export default function DoctorAppointments() {
  const uid = auth.currentUser?.uid || "";
  const { items, loading, hasMore, loadNextPage, reload } = usePaginatedQuery({
    collectionName: "appointments",
    filters: [{ field: "doctorId", op: "==", value: uid }],
    orderByField: "scheduledAt",
    order: "desc",
    pageSize: 10
  });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Mes rendez-vous</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(a => (
          <View key={a.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }}>
            <Text style={{ fontWeight: "700" }}>{a.reason || "Consultation"}</Text>
            <Text>Patient: {a.patientId}</Text>
            <Text>Statut: {a.status}</Text>
            <Text>Date: {a.scheduledAt?.toDate?.().toLocaleString?.() || "-"}</Text>
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

