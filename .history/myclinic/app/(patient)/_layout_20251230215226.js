import { Drawer } from "expo-router/drawer";
import { colors } from "../../theme/colors";
import { LogoCircle } from "../../components/LogoCircle";

export default function PatientLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerType: "front",
        drawerPosition: "left",
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#E2E8F0",
        drawerContentStyle: { backgroundColor: colors.secondary },
        headerRight: () => <LogoCircle size={32} />,
        headerTitleStyle: { color: colors.secondary, fontWeight: "800" }
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="book" options={{ title: "Prise RDV" }} />
      <Drawer.Screen name="medical" options={{ title: "Dossier" }} />
      <Drawer.Screen name="prescriptions" options={{ title: "Prescriptions" }} />
      <Drawer.Screen name="profile" options={{ title: "Profil" }} />
      <Drawer.Screen name="logout" options={{ title: "Se déconnecter" }} />
    </Drawer>
  );
}
