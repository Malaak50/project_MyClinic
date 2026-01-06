import { View, Text, ActivityIndicator, Button, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { colors } from "../../theme/colors";

export default function DoctorAppointmentDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchApp = async () => {
      try {
        const snap = await getDoc(doc(db, "appointments", id));
        if (snap.exists()) {
          const base = { id: snap.id, ...snap.data() };
          let patientName = base.patientName || "";
          let date = base.date || "";
          let time = base.time || "";
          if (!patientName && base.patientId) {
            const uSnap = await getDoc(doc(db, "users", base.patientId));
            if (uSnap.exists()) {
              const u = uSnap.data();
              patientName = u.displayName || u.name || u.email || "Patient";
            }
          }
          if (base.scheduledAt?.toDate && (!date || !time)) {
            const dt = base.scheduledAt.toDate();
            date = dt.toLocaleDateString();
            time = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          }
          setAppointment({ ...base, patientName, date, time });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: newStatus });
      setAppointment(prev => ({ ...prev, status: newStatus }));
      Alert.alert("Succès", `Rendez-vous ${newStatus}`);
      router.back();
    } catch (e) {
      Alert.alert("Erreur", e.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (!appointment) return <View style={{ padding: 20 }}><Text>Rendez-vous introuvable</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.secondary, marginBottom: 12 }}>Détails du rendez-vous</Text>
      
      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Patient : <Text style={{ fontWeight: "bold" }}>{appointment.patientName}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Date : <Text style={{ fontWeight: "bold" }}>{appointment.date}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Heure : <Text style={{ fontWeight: "bold" }}>{appointment.time}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Statut : <Text style={{ fontWeight: "bold", color: appointment.status === "confirmed" ? "green" : appointment.status === "cancelled" ? "red" : "orange" }}>{appointment.status}</Text></Text>
        {appointment.notes ? <Text style={{ fontSize: 16, marginTop: 8 }}>Notes : {appointment.notes}</Text> : null}
      </View>

      {appointment.status === "pending" && (
        <View style={{ gap: 10 }}>
          <Button title="Confirmer le rendez-vous" color={colors.primary} onPress={() => updateStatus("confirmed")} />
          <Button title="Annuler le rendez-vous" color="red" onPress={() => updateStatus("cancelled")} />
        </View>
      )}
      {appointment.status === "confirmed" && (
        <View style={{ gap: 10 }}>
          <Button title="Annuler le rendez-vous" color="red" onPress={() => updateStatus("cancelled")} />
        </View>
      )}
    </ScrollView>
  );
}
