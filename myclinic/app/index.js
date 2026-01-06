import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useRole } from "../hooks/useRole";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Chargement...</Text>
      </View>
    );
  }
  if (!user) return <Redirect href="/(auth)/login" />;
  if (role === "admin") return <Redirect href="/(admin)" />;
  if (role === "doctor") return <Redirect href="/(doctor)" />;
  return <Redirect href="/(patient)" />;
}

