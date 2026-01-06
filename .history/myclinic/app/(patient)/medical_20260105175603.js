import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PatientMedicalRecords() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const q = query(
          collection(db, "medical_records"),
          where("patientId", "==", auth.currentUser?.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Client sort by lastUpdated
        docs.sort((a, b) => (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0));
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
        <MaterialCommunityIcons name="file-document-outline" size={26} color={colors.secondary} />
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.secondary }}>Dossier Médical</Text>
      </View>
      
      {loading ? <ActivityIndicator /> : null}

      {items.length === 0 && !loading ? (
        <Text style={{ color: "#666", fontStyle: "italic" }}>Aucun dossier trouvé.</Text>
      ) : null}

      <View style={{ gap: 12 }}>
        {items.map(m => (
          <Card
            key={m.id}
            title={m.type ? String(m.type) : "Entrée médicale"}
            subtitle={`Docteur: ${(m.doctorName || m.docteur || m.doctor || "Docteur")} • Clinique: ${m.clinicName || "MyClinic"}`}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <Badge label={m.type || "Dossier"} type="doctor" />
              <Text style={{ fontSize: 12, color: "#666" }}>
                {m.createdAt?.toDate
                  ? m.createdAt.toDate().toLocaleDateString()
                  : m.lastUpdated?.toDate
                  ? m.lastUpdated.toDate().toLocaleDateString()
                  : ""}
              </Text>
            </View>
            <View style={{ marginTop: 10, gap: 6 }}>
              {Array.isArray(m.entries) && m.entries.length > 0 ? (
                m.entries.map((entry, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialCommunityIcons name="stethoscope" size={18} color={colors.primary} />
                    <Text style={{ color: "#374151", flex: 1 }}>
                      {typeof entry === "string" ? entry : JSON.stringify(entry)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#6b7280" }}>Aucune note détaillée.</Text>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
