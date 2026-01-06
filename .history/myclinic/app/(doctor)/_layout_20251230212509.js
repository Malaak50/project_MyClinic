import { Tabs } from "expo-router";
import { colors } from "../../theme/colors";
import { LogoCircle } from "../../components/LogoCircle";

export default function DoctorLayout() {
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
      <Tabs.Screen name="appointments" options={{ title: "Rendez-vous" }} />
      <Tabs.Screen name="patients" options={{ title: "Patients" }} />
      <Tabs.Screen name="prescriptions" options={{ title: "Prescriptions" }} />
    </Tabs>
  );
}
