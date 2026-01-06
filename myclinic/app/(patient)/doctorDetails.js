import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp, Timestamp, runTransaction, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { colors } from "../../theme/colors";
import { Card } from "../../components/Card";

export default function DoctorDetailsPatient() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState(null); // { date: "YYYY-MM-DD", day: "Lundi" }
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [reservedSlots, setReservedSlots] = useState(new Set());

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        // Fetch Doctor
        const docSnap = await getDoc(doc(db, "doctors", id));
        if (docSnap.exists()) {
          setDoctor({ id: docSnap.id, ...docSnap.data() });
        }
        
        // Fetch Current Patient
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userSnap.exists()) {
          setPatient(userSnap.data());
        }
        
        // Init dates
        const days = getNextDays();
        setSelectedDate(days[0]);
      } catch (e) {
        console.error(e);
        Alert.alert("Erreur", "Impossible de charger les détails");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getNextDays = () => {
    const days = [];
    const frenchDays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = frenchDays[d.getDay()];
      if (dayName === "Dimanche") continue; // Skip Sunday if clinic closed
      days.push({
        date: d.toISOString().split('T')[0],
        day: dayName,
        display: `${dayName} ${d.getDate()}`
      });
    }
    return days;
  };

  const getSlotsForDay = (dayName) => {
    if (!doctor || !doctor.availability) return [];
    const dayAvail = doctor.availability.find(a => a.day === dayName);
    return dayAvail ? dayAvail.slots : [];
  };

  useEffect(() => {
    async function fetchReservedSlots() {
      try {
        if (!doctor || !selectedDate) return;
        const slotsSnap = await getDocs(
          query(
            collection(db, "appointments"),
            where("doctorId", "==", doctor.id)
          )
        );
        const docs = slotsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const set = new Set();
        for (const s of docs) {
          if (!s?.scheduledAt || s?.status === "cancelled") continue;
          let d;
          if (typeof s.scheduledAt?.toDate === "function") d = s.scheduledAt.toDate();
          else if (typeof s.scheduledAt === "object" && s.scheduledAt?.seconds != null) d = new Date(s.scheduledAt.seconds * 1000);
          else continue;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const dateStr = `${y}-${m}-${day}`;
          if (dateStr === selectedDate.date) {
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            set.add(`${hh}:${mm}`);
          }
        }
        setReservedSlots(set);
      } catch (e) {
        console.log("Failed to load reserved slots", e);
        setReservedSlots(new Set());
      }
    }
    fetchReservedSlots();
  }, [doctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert("Attention", "Veuillez sélectionner une date et une heure");
      return;
    }
    if (reservedSlots.has(selectedSlot)) {
      Alert.alert("Créneau indisponible", "Ce créneau est déjà réservé. Choisissez un autre moment.");
      return;
    }
    
    setBooking(true);
    try {
      // Construct scheduledAt Timestamp
      const [year, month, day] = selectedDate.date.split("-").map(Number);
      const [hour, minute] = selectedSlot.split(":").map(Number);
      const scheduledDate = new Date(year, month - 1, day, hour, minute);
      const slotKey = `${doctor.id}_${selectedDate.date}_${selectedSlot}`;
      
      const appointmentData = {
        doctorId: doctor.id,
        patientId: auth.currentUser.uid,
        doctorName: doctor.name || "Docteur",
        clinicName: doctor.clinicName || "MyClinic",
        patientName: patient?.displayName || patient?.name || patient?.email || "Patient",
        scheduledAt: Timestamp.fromDate(scheduledDate),
        status: "pending", 
        reason: reason || "Consultation",
        notes,
        slotKey,
        createdAt: serverTimestamp()
      };

      await runTransaction(db, async (transaction) => {
        const apptRef = doc(db, "appointments", slotKey);
        const apptSnap = await transaction.get(apptRef);
        if (apptSnap.exists()) {
          const data = apptSnap.data();
          if (data?.status && data.status !== "cancelled") {
            throw new Error("Ce créneau est déjà réservé.");
          }
        }
        transaction.set(apptRef, appointmentData);
      });
      
      Alert.alert("Succès", "Rendez-vous confirmé");
      router.push("/(patient)/myAppointments");
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "La réservation a échoué: " + e.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
  if (!doctor) return <View style={{ padding: 20 }}><Text>Médecin introuvable</Text></View>;
  if (doctor.status !== "active") {
    return (
      <View style={{ padding: 20, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Médecin indisponible</Text>
        <Text style={{ color: "#666" }}>Ce médecin est actuellement inactif et ne peut pas recevoir de rendez-vous.</Text>
      </View>
    );
  }

  const nextDays = getNextDays();
  const slots = selectedDate ? getSlotsForDay(selectedDate.day) : [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
      {/* Doctor Info */}
      <Card title={doctor.name} subtitle={doctor.clinicName}>
        <Text style={{ color: colors.primary, fontWeight: "600", marginTop: 4 }}>
          {(doctor.specialties || []).join(", ")}
        </Text>
        <Text style={{ color: "#666", marginTop: 4 }}>{doctor.phone}</Text>
      </Card>

      {/* Date Selector */}
      <View>
        <Text style={styles.sectionTitle}>Choisir une date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {nextDays.map((d) => (
            <TouchableOpacity
              key={d.date}
              onPress={() => { setSelectedDate(d); setSelectedSlot(null); }}
              style={[
                styles.dateButton,
                selectedDate?.date === d.date && styles.selectedDate
              ]}
            >
              <Text style={[styles.dateText, selectedDate?.date === d.date && styles.selectedDateText]}>
                {d.day}
              </Text>
              <Text style={[styles.dateText, selectedDate?.date === d.date && styles.selectedDateText]}>
                {d.date.split('-')[2]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Slots Grid */}
      <View>
        <Text style={styles.sectionTitle}>Choisir une heure</Text>
        {slots.length > 0 ? (
          <View style={styles.slotsGrid}>
            {slots.map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  styles.slotButton,
                  selectedSlot === slot && styles.selectedSlot
                ]}
              >
                <Text style={[
                  styles.slotText,
                  selectedSlot === slot && styles.selectedSlotText,
                  reservedSlots.has(slot) ? { color: "#9ca3af" } : null
                ]}>
                  {reservedSlots.has(slot) ? `${slot} (indisponible)` : slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={{ color: "#666", fontStyle: "italic" }}>Aucun créneau disponible ce jour-là.</Text>
        )}
      </View>

      <View>
        <Text style={styles.sectionTitle}>Raison du rendez-vous</Text>
        <TextInput value={reason} onChangeText={setReason} placeholder="Ex: Consultation générale" style={styles.input} />
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} placeholder="Informations supplémentaires" style={[styles.input, { height: 80 }]} multiline />
      </View>

      {/* Confirm Button */}
      <TouchableOpacity 
        onPress={handleBook}
        disabled={booking || !selectedSlot}
        style={[styles.bookButton, (!selectedSlot || booking) && styles.disabledButton]}
      >
        {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookButtonText}>Confirmer le rendez-vous</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: colors.secondary
  },
  dateButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    minWidth: 80
  },
  selectedDate: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dateText: {
    color: "#374151",
    fontWeight: "600"
  },
  selectedDateText: {
    color: "#fff"
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  slotButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  selectedSlot: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary
  },
  slotText: {
    color: "#374151"
  },
  selectedSlotText: {
    color: "#fff"
  },
  bookButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },
  disabledButton: {
    backgroundColor: "#9ca3af"
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
