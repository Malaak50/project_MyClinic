import { View, Text, ActivityIndicator, Button, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { colors } from "../../theme/colors";

export default function PatientAppointmentDetails() {
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
          let doctorName = base.doctorName || "";
          let clinicName = base.clinicName || "";
          let date = base.date || "";
          let time = base.time || "";
          if (!clinicName && base.doctorId) {
            const dSnap = await getDoc(doc(db, "doctors", base.doctorId));
            if (dSnap.exists()) {
              const d = dSnap.data();
              clinicName = d.clinicName || "MyClinic";
              doctorName = doctorName || d.name || "";
            }
          }
          if (!doctorName && base.doctorId) {
            const uSnap = await getDoc(doc(db, "users", base.doctorId));
            if (uSnap.exists()) {
              const u = uSnap.data();
              doctorName = u.displayName || u.name || doctorName || "Médecin";
            }
          }
          if (base.scheduledAt?.toDate && (!date || !time)) {
            const dt = base.scheduledAt.toDate();
            date = dt.toLocaleDateString();
            time = dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          }
          setAppointment({ ...base, doctorName, clinicName, date, time });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const cancelAppointment = async () => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
      setAppointment(prev => ({ ...prev, status: "cancelled" }));
      Alert.alert("Succès", "Rendez-vous annulé");
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
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Docteur : <Text style={{ fontWeight: "bold" }}>{appointment.doctorName}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Clinique : <Text style={{ fontWeight: "bold" }}>{appointment.clinicName}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Date : <Text style={{ fontWeight: "bold" }}>{appointment.date}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Heure : <Text style={{ fontWeight: "bold" }}>{appointment.time}</Text></Text>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Statut : <Text style={{ fontWeight: "bold", color: appointment.status === "confirmed" ? "green" : appointment.status === "cancelled" ? "red" : "orange" }}>{appointment.status}</Text></Text>
      </View>

      {(appointment.status === "pending" || appointment.status === "confirmed") && (
        <Button title="Annuler le rendez-vous" color="red" onPress={cancelAppointment} />
      )}
    </ScrollView>
  );
}
