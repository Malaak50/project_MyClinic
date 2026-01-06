import { View, Text } from "react-native";
import { colors } from "../../theme/colors";

export default function AdminDashboard() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.secondary }}>Dashboard Admin</Text>
      <Text>Utilisateurs, rendez-vous, statistiques</Text>
    </View>
  );
}

