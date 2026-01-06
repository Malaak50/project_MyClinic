import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "../../services/firebase";
import { colors } from "../../theme/colors";
import Card from "../../components/Card";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDoctors: 0,
    inactiveDoctors: 0,
    totalPatients: 0,
    appointmentsPending: 0,
    appointmentsConfirmed: 0,
    appointmentsCancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Users
      const usersSnap = await getCountFromServer(collection(db, "users"));
      
      // Doctors
      const activeDocsSnap = await getCountFromServer(query(collection(db, "doctors"), where("status", "==", "active")));
      const inactiveDocsSnap = await getCountFromServer(query(collection(db, "doctors"), where("status", "==", "inactive")));
      
      // Patients
      const patientsSnap = await getCountFromServer(collection(db, "patients"));
      
      // Appointments
      const pendingSnap = await getCountFromServer(query(collection(db, "appointments"), where("status", "==", "pending")));
      const confirmedSnap = await getCountFromServer(query(collection(db, "appointments"), where("status", "==", "confirmed")));
      const cancelledSnap = await getCountFromServer(query(collection(db, "appointments"), where("status", "==", "cancelled")));

      setStats({
        totalUsers: usersSnap.data().count,
        activeDoctors: activeDocsSnap.data().count,
        inactiveDoctors: inactiveDocsSnap.data().count,
        totalPatients: patientsSnap.data().count,
        appointmentsPending: pendingSnap.data().count,
        appointmentsConfirmed: confirmedSnap.data().count,
        appointmentsCancelled: cancelledSnap.data().count
      });
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView 
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.primary }}>Tableau de bord</Text>
      
      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Utilisateurs</Text>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <Card style={{ flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.primary }}>{stats.totalUsers}</Text>
          <Text style={{ color: "#666" }}>Total Utilisateurs</Text>
        </Card>
        <Card style={{ flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.secondary }}>{stats.totalPatients}</Text>
          <Text style={{ color: "#666" }}>Patients</Text>
        </Card>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Médecins</Text>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <Card style={{ flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "green" }}>{stats.activeDoctors}</Text>
          <Text style={{ color: "#666" }}>Actifs</Text>
        </Card>
        <Card style={{ flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "gray" }}>{stats.inactiveDoctors}</Text>
          <Text style={{ color: "#666" }}>Inactifs</Text>
        </Card>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Rendez-vous</Text>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <Card style={{ flex: 1, minWidth: "30%", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "orange" }}>{stats.appointmentsPending}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>En attente</Text>
        </Card>
        <Card style={{ flex: 1, minWidth: "30%", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "green" }}>{stats.appointmentsConfirmed}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>Confirmés</Text>
        </Card>
        <Card style={{ flex: 1, minWidth: "30%", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "red" }}>{stats.appointmentsCancelled}</Text>
          <Text style={{ fontSize: 12, color: "#666" }}>Annulés</Text>
        </Card>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Accès rapide</Text>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <TouchableOpacity onPress={() => router.push("/(admin)/doctors")} style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 8, flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Gérer Médecins</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(admin)/users")} style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 8, flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Gérer Utilisateurs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(admin)/notifications")} style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 8, flex: 1, minWidth: "45%", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
