import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { colors } from "../../theme/colors";

export default function DoctorAvailability() {
  const uid = auth.currentUser?.uid || "";
  const [slots, setSlots] = useState({});

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  
  // Lun-Ven: 09h-18h (Pause 12-14)
  // Sam: 09h-13h

  const weekMorning = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const weekAfternoon = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
  
  const satSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

  function toggleSlot(day, time) {
    setSlots(prev => {
      const current = prev[day] || [];
      const exists = current.includes(time);
      const next = exists ? current.filter(t => t !== time) : [...current, time];
      return { ...prev, [day]: next };
    });
  }

  async function load() {
    try {
      const snap = await getDoc(doc(db, "doctors", uid));
      const data = snap.exists() ? snap.data() : null;
      const availability = data?.availability || [];
      const map = {};
      availability.forEach(entry => {
        map[entry.day] = entry.slots || [];
      });
      setSlots(map);
    } catch (e) {
      console.error(e);
    }
  }

  async function save() {
    try {
      const availability = days.map(d => ({
        day: d,
        slots: (slots[d] || []).sort()
      }));
      await setDoc(doc(db, "doctors", uid), { availability }, { merge: true });
      Alert.alert("Succès", "Disponibilités enregistrées");
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer");
    }
  }

  useEffect(() => {
    if (uid) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const renderSlots = (day, availableSlots) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {availableSlots.map(time => (
        <TouchableOpacity 
          key={time} 
          onPress={() => toggleSlot(day, time)} 
          style={{ 
            paddingHorizontal: 10, 
            paddingVertical: 6, 
            borderRadius: 8, 
            borderWidth: 1, 
            borderColor: slots[day]?.includes(time) ? colors.secondary : "#e5e7eb", 
            backgroundColor: slots[day]?.includes(time) ? "#f0f9ff" : "#fff" 
          }}
        >
          <Text style={{ color: slots[day]?.includes(time) ? colors.secondary : "#111827" }}>{time}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Disponibilités</Text>
      <Text style={{ color: "#666" }}>Lun–Ven : 09h–18h | Sam : 09h–13h</Text>
      
      {days.map(day => {
        const isSat = day === "Samedi";
        return (
          <View key={day} style={{ gap: 8, marginTop: 8 }}>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>{day}</Text>
            
            {isSat ? (
              renderSlots(day, satSlots)
            ) : (
              <>
                <Text style={{ fontSize: 12, color: "#666" }}>Matin</Text>
                {renderSlots(day, weekMorning)}
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Après-midi</Text>
                {renderSlots(day, weekAfternoon)}
              </>
            )}
          </View>
        );
      })}

      <TouchableOpacity onPress={save} style={{ alignSelf: "flex-start", backgroundColor: colors.secondary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 12 }}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Enregistrer</Text>
      </TouchableOpacity>
      <Text style={{ color: "#6b7280", fontSize: 12 }}>Les créneaux sélectionnés seront visibles par les patients.</Text>
    </ScrollView>
  );
}
