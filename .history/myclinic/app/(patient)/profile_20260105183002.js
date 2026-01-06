import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PatientProfile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function run() {
      const u = auth.currentUser;
      if (!u) return;
      
      try {
        // Fetch from both collections to get complete profile
        const userSnap = await getDoc(doc(db, "users", u.uid));
        const patientSnap = await getDoc(doc(db, "patients", u.uid));
        
        const userData = userSnap.exists() ? userSnap.data() : {};
        const patientData = patientSnap.exists() ? patientSnap.data() : {};
        
        setData({ ...userData, ...patientData });
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    }
    run();
  }, []);

  if (!data) return <View style={{ padding: 16 }}><Text>Chargement...</Text></View>;

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8 }}>
          <Text style={{ fontSize: 36, color: "#fff", fontWeight: "800" }}>
            {(data.displayName || "P").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 10 }}>{data.displayName || "-"}</Text>
        <Badge label="Patient" type="patient" />
      </View>

      <Card title="Informations Personnelles">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialCommunityIcons name="account-outline" size={18} color={colors.secondary} />
          <Text>Nom: {data.displayName || "-"}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialCommunityIcons name="email-outline" size={18} color={colors.secondary} />
          <Text>Email: {data.email}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialCommunityIcons name="phone-outline" size={18} color={colors.secondary} />
          <Text>Téléphone: {data.phone || "-"}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialCommunityIcons name="calendar-outline" size={18} color={colors.secondary} />
          <Text>Date de naissance: {data.birthDate || "-"}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MaterialCommunityIcons name="id-card" size={18} color={colors.secondary} />
          <Text>Numéro d'assurance: {data.insuranceNumber || "-"}</Text>
        </View>
      </Card>

      <Card title="Informations Médicales">
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "600", color: colors.primary }}>Allergies</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            {Array.isArray(data.allergies) && data.allergies.length > 0 ? (
              data.allergies.map((a, i) => (
                <View key={i} style={{ backgroundColor: "#f3f4f6", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: "#374151" }}>{a}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#6b7280" }}>Aucune</Text>
            )}
          </View>
        </View>
        <View>
          <Text style={{ fontWeight: "600", color: colors.primary }}>Maladies chroniques</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            {Array.isArray(data.chronicConditions) && data.chronicConditions.length > 0 ? (
              data.chronicConditions.map((c, i) => (
                <View key={i} style={{ backgroundColor: "#f3f4f6", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: "#374151" }}>{c}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#6b7280" }}>Aucune</Text>
            )}
          </View>
        </View>
      </Card>

      /*<Text style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 12 }}>
        Rôle: {data.role || "Patient"}
      </Text>
    </View>
  );
}
