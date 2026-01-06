import { Drawer } from "expo-router/drawer";
import { colors } from "../../theme/colors";
import { LogoCircle } from "../../components/LogoCircle";

export default function DoctorLayout() {
  return (
    <Drawer
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#E2E8F0",
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
      <Drawer.Screen name="appointments" options={{ title: "Liste Rendez-vous" }} />
      <Drawer.Screen name="appointmentDetails" options={{ title: "Détails Rendez-vous" }} />
      <Drawer.Screen name="availability" options={{ title: "Disponibilités" }} />
      <Drawer.Screen name="patients" options={{ title: "Patients" }} />
      <Drawer.Screen name="patientDetails" options={{ title: "Détails Patient" }} />
      <Drawer.Screen name="medicalRecords" options={{ title: "Dossier Médical" }} />
      <Drawer.Screen name="prescriptions" options={{ title: "Prescriptions" }} />
      <Drawer.Screen name="prescriptionDetails" options={{ title: "Détails Prescription" }} />
      <Drawer.Screen name="notes" options={{ title: "Notes Médicales" }} />
      <Drawer.Screen name="notifications" options={{ title: "Notifications" }} />
      <Drawer.Screen name="profile" options={{ title: "Profil" }} />
      <Drawer.Screen name="logout" options={{ title: "Se déconnecter" }} />
    </Drawer>
  );
}
