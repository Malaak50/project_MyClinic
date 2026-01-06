import { Tabs } from "expo-router";
import { colors } from "../../theme/colors";
import { LogoCircle } from "../../components/LogoCircle";

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#E2E8F0",
        tabBarStyle: { backgroundColor: colors.secondary },
        headerRight: () => <LogoCircle size={32} />,
        headerTitleStyle: { color: colors.secondary, fontWeight: "800" }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="book" options={{ title: "Prise RDV" }} />
      <Tabs.Screen name="medical" options={{ title: "Dossier" }} />
      <Tabs.Screen name="prescriptions" options={{ title: "Prescriptions" }} />
    </Tabs>
  );
}
