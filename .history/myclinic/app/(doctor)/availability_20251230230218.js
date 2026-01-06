import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";

export default function DoctorAvailability() {
  const uid = auth.currentUser?.uid || "";
  const [slots, setSlots] = useState({});

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const morning = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"];
  const afternoon = ["14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
  const evening = ["18:30","19:00","19:30","20:00"];

  function toggleSlot(day, time) {
    setSlots(prev => {
      const current = prev[day] || [];
      const exists = current.includes(time);
      const next = exists ? current.filter(t => t !== time) : [...current, time];
      return { ...prev, [day]: next };
    });
  }

  async function load() {
    const snap = await getDoc(doc(db, "doctors", uid));
    const data = snap.exists() ? snap.data() : null;
    const availability = data?.availability || [];
    const map = {};
    availability.forEach(entry => {
      map[entry.day] = entry.slots || [];
    });
    setSlots(map);
  }

  async function save() {
    const availability = days.map(d => ({
      day: d,
      slots: (slots[d] || []).filter(t => !(t >= "12:00" && t < "14:00"))
    }));
    await setDoc(doc(db, "doctors", uid), { availability }, { merge: true });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Disponibilités (Lun–Sam)</Text>
      {days.map(day => (
        <View key={day} style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>{day}</Text>
          <Text>Matin</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {morning.map(time => (
              <TouchableOpacity key={time} onPress={() => toggleSlot(day, time)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: slots[day]?.includes(time) ? colors.secondary : "#e5e7eb", backgroundColor: slots[day]?.includes(time) ? "#f0f9ff" : "#fff" }}>
                <Text style={{ color: slots[day]?.includes(time) ? colors.secondary : "#111827" }}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text>Après-midi</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {afternoon.map(time => (
              <TouchableOpacity key={time} onPress={() => toggleSlot(day, time)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: slots[day]?.includes(time) ? colors.secondary : "#e5e7eb", backgroundColor: slots[day]?.includes(time) ? "#f0f9ff" : "#fff" }}>
                <Text style={{ color: slots[day]?.includes(time) ? colors.secondary : "#111827" }}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text>Soir</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {evening.map(time => (
              <TouchableOpacity key={time} onPress={() => toggleSlot(day, time)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: slots[day]?.includes(time) ? colors.secondary : "#e5e7eb", backgroundColor: slots[day]?.includes(time) ? "#f0f9ff" : "#fff" }}>
                <Text style={{ color: slots[day]?.includes(time) ? colors.secondary : "#111827" }}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={save} style={{ alignSelf: "flex-start", backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
        <Text style={{ color: "#fff" }}>Enregistrer</Text>
      </TouchableOpacity>
      <Text style={{ color: "#6b7280" }}>Pause déjeuner bloquée automatiquement 12:00–14:00</Text>
    </ScrollView>
  );
}
