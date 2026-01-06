import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";
import { useRouter } from "expo-router";

export default function PatientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextApp, setNextApp] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const q = query(
        collection(db, "appointments"),
        where("patientId", "==", auth.currentUser.uid),
        where("date", ">=", today),
        orderBy("date", "asc")
        // Removed status filter and time sort to avoid complex index requirement
      );
      const snap = await getDocs(q);
      
      // Client-side filtering and sorting
      const upcoming = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.status === "confirmed")
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        });

      if (upcoming.length > 0) {
        setNextApp(upcoming[0]);
      } else {
        setNextApp(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.secondary }}>Bonjour !</Text>
      
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Prochain rendez-vous</Text>
      {loading ? <ActivityIndicator /> : null}
      
      {nextApp ? (
        <TouchableOpacity onPress={() => router.push({ pathname: "/(patient)/appointmentDetails", params: { id: nextApp.id } })}>
          <Card title={`Dr. ${nextApp.doctorName}`} subtitle={`${nextApp.date} à ${nextApp.time}`}>
            <Text style={{ color: colors.primary, marginTop: 4 }}>{nextApp.clinicName}</Text>
          </Card>
        </TouchableOpacity>
      ) : (
        <View style={{ padding: 20, backgroundColor: "#f3f4f6", borderRadius: 10, alignItems: "center" }}>
          <Text style={{ color: "#666", marginBottom: 10 }}>Aucun rendez-vous prévu</Text>
          <TouchableOpacity onPress={() => router.push("/(patient)/searchDoctors")} style={{ backgroundColor: colors.secondary, padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "#fff" }}>Trouver un médecin</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>Accès rapide</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity onPress={() => router.push("/(patient)/searchDoctors")} style={{ flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#eee" }}>
          <Text style={{ fontWeight: "bold", color: colors.primary }}>Prendre RDV</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(patient)/myAppointments")} style={{ flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#eee" }}>
          <Text style={{ fontWeight: "bold", color: colors.primary }}>Mes RDV</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
