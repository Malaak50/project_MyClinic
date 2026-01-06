import { Drawer } from "expo-router/drawer";
import { LogoCircle } from "../../components/LogoCircle";
import { colors } from "../../theme/colors";

export default function AdminLayout() {
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
      <Drawer.Screen name="index" options={{ title: "Dashboard Admin" }} />
      <Drawer.Screen name="profile" options={{ title: "Profil" }} />
      <Drawer.Screen name="logout" options={{ title: "Se déconnecter" }} />
    </Drawer>
  );
}
