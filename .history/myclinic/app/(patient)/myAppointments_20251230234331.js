import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { auth } from "../../services/firebase";
import { usePaginatedQuery } from "../../hooks/usePaginatedQuery";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

export default function MyAppointments() {
  const uid = auth.currentUser?.uid || "";
  const { items, loading, hasMore, loadNextPage } = usePaginatedQuery({
    collectionName: "appointments",
    filters: [{ field: "patientId", op: "==", value: uid }],
    orderByField: "scheduledAt",
    order: "desc",
    pageSize: 10
  });
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Mes rendez-vous</Text>
      {loading ? <ActivityIndicator /> : null}
      <View style={{ gap: 8 }}>
        {items.map(a => (
          <Card key={a.id} title={a.reason || "Consultation"} subtitle={`Médecin: ${a.doctorId}`}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Badge label={a.status} type={a.status} />
              <Text>Date: {a.scheduledAt?.toDate?.().toLocaleString?.() || "-"}</Text>
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
