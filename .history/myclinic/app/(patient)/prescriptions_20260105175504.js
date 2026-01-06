import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PatientPrescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "prescriptions"),
          where("patientId", "==", auth.currentUser?.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Client sort by issuedAt
        docs.sort((a, b) => (b.issuedAt?.seconds || 0) - (a.issuedAt?.seconds || 0));
        setItems(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (auth.currentUser?.uid) load();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons name="pill" size={26} color={colors.secondary} />
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.secondary }}>Mes Prescriptions</Text>
      </View>
      
      {loading ? <ActivityIndicator /> : null}

      {items.length === 0 && !loading ? (
        <Text style={{ color: "#666", fontStyle: "italic" }}>Aucune prescription trouvée.</Text>
      ) : null}

      <View style={{ gap: 12 }}>
        {items.map(p => (
          <Card
            key={p.id}
            title="Prescription"
            subtitle={`Docteur: ${(p.doctorName || p.docteur || p.doctor || "Docteur")} • Clinique: ${p.clinicName || "MyClinic"}`}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <Badge label={p.status || "active"} type={p.status === "canceled" ? "canceled" : p.status === "completed" ? "completed" : "confirmed"} />
              <Text style={{ fontSize: 12, color: "#666" }}>
                {p.issuedAt?.toDate
                  ? p.issuedAt.toDate().toLocaleDateString()
                  : p.date || ""}
              </Text>
            </View>
            <View style={{ marginTop: 10, gap: 6 }}>
              {Array.isArray(p.medications) && p.medications.length > 0 ? (
                p.medications.map((m, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialCommunityIcons name="pill" size={18} color={colors.primary} />
                    <Text style={{ color: "#374151", flex: 1 }}>
                      {m.name} • {m.dosage} • {m.duration}
                    </Text>
                  </View>
                ))
              ) : Array.isArray(p.items) && p.items.length > 0 ? (
                p.items.map((item, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialCommunityIcons name="pill" size={18} color={colors.primary} />
                    <Text style={{ color: "#374151", flex: 1 }}>
                      {typeof item === "string" ? item : item.name || JSON.stringify(item)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#6b7280" }}>Aucun médicament listé.</Text>
              )}
            </View>
            {p.expiresAt ? (
              <Text style={{ marginTop: 8, fontStyle: "italic", color: "#ef4444", fontSize: 10 }}>
                Expire le: {p.expiresAt.toDate().toLocaleDateString()}
              </Text>
            ) : null}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
