import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AdminProfile() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function run() {
      const u = auth.currentUser;
      if (!u) return;
      const snap = await getDoc(doc(db, "users", u.uid));
      setData(snap.exists() ? snap.data() : null);
    }
    run();
  }, []);

  if (!data) return <View style={{ padding: 16 }}><Text>Chargement...</Text></View>;

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons name="account-cog-outline" size={26} color={colors.primary} />
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.primary }}>Profil Admin</Text>
      </View>
      
      <View style={{ alignItems: "center", marginVertical: 12 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 36, color: "#fff", fontWeight: "800" }}>
            {(data.displayName || "A").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 10 }}>{data.displayName || "-"}</Text>
        <Text style={{ color: "#666" }}>{data.role}</Text>
      </View>

      <Card title="Informations">
        <Text>Email: {data.email}</Text>
        <Text>Téléphone: {data.phone || "-"}</Text>
      </Card>
    </View>
  );
}
