import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { colors } from "../../theme/colors";
import { addDoc, collection, serverTimestamp, getDocs, query, limit, doc, getDoc, where } from "firebase/firestore";
import { db, auth } from "../../services/firebase";

function CreatePrescriptionForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    medications: [] // { name, dosage, duration }
  });
  const [currentMed, setCurrentMed] = useState({ name: "", dosage: "", duration: "" });
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [selectedPatientAllergies, setSelectedPatientAllergies] = useState([]);

  useEffect(() => {
    async function fetchPatients() {
      const appsQ = query(collection(db, "appointments"));
      const appsSnap = await getDocs(appsQ);
      const docs = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const linked = docs.filter(a => a.doctorId === auth.currentUser?.uid && a.patientId);
      const map = new Map();
      for (const a of linked) {
        const pid = a.patientId;
        const name = a.patientName || "";
        if (!map.has(pid)) {
          map.set(pid, { id: pid, displayName: name });
        }
      }
      setPatients(Array.from(map.values()));
    }
    fetchPatients();
  }, []);

  const addMedication = () => {
    if (!currentMed.name || !currentMed.dosage || !currentMed.duration) {
      Alert.alert("Erreur", "Remplir tous les champs du médicament");
      return;
    }
    setForm({ ...form, medications: [...form.medications, currentMed] });
    setCurrentMed({ name: "", dosage: "", duration: "" });
  };

  const removeMedication = (index) => {
    const newMeds = [...form.medications];
    newMeds.splice(index, 1);
    setForm({ ...form, medications: newMeds });
  };

  const handleCreate = async () => {
    if (!form.patientId || form.medications.length === 0) {
      Alert.alert("Erreur", "Patient et au moins un médicament requis");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "prescriptions"), {
        patientId: form.patientId,
        patientName: form.patientName,
        doctorId: auth.currentUser.uid,
        doctorName: auth.currentUser.displayName || "Docteur",
        medications: form.medications,
        date: new Date().toISOString().split('T')[0],
        issuedAt: serverTimestamp(), // Added for consistency with schema
        status: "active",
        createdAt: serverTimestamp()
      });
      Alert.alert("Succès", "Prescription créée");
      onSuccess();
    } catch (e) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 16, backgroundColor: "#fff", borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nouvelle Prescription</Text>
      
      <Text style={{ marginBottom: 4 }}>Patient : {form.patientName || "Sélectionner..."}</Text>
      <TouchableOpacity onPress={() => setShowPatientPicker(true)} style={styles.input}>
         <Text>{form.patientName || "Choisir un patient"}</Text>
      </TouchableOpacity>

      {/* Allergies Alert */}
      {form.patientId && (
        <View style={{ padding: 12, backgroundColor: "#fff0f0", borderRadius: 8, borderWidth: 1, borderColor: "#ffcccc" }}>
          <Text style={{ color: "#d32f2f", fontWeight: "bold" }}>⚠️ Allergies :</Text>
          <Text style={{ color: "#d32f2f" }}>
            {selectedPatientAllergies && selectedPatientAllergies.length > 0 
              ? selectedPatientAllergies.join(", ") 
              : "Aucune allergie connue"}
          </Text>
        </View>
      )}

      <Modal visible={showPatientPicker} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Sélectionner un patient</Text>
          <FlatList 
            data={patients}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                setForm({ ...form, patientId: item.id, patientName: item.displayName || item.email || "Patient" });
                setSelectedPatientAllergies(item.allergies || []);
                setShowPatientPicker(false);
              }} style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                <Text style={{ fontWeight: "bold" }}>{item.displayName || "Sans nom"}</Text>
                <Text style={{ fontSize: 12, color: "#666" }}>{item.email}</Text>
                {item.allergies && item.allergies.length > 0 && (
                   <Text style={{ fontSize: 12, color: "red" }}>Allergies: {item.allergies.join(", ")}</Text>
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setShowPatientPicker(false)} style={{ marginTop: 20, padding: 15, backgroundColor: "#eee", alignItems: "center" }}>
            <Text>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Text style={{ fontWeight: "600", marginTop: 10 }}>Médicaments</Text>
      <View style={{ gap: 8 }}>
        {form.medications.map((m, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f3f4f6", padding: 8, borderRadius: 8 }}>
            <Text style={{ flex: 1 }}>{m.name} - {m.dosage} ({m.duration})</Text>
            <TouchableOpacity onPress={() => removeMedication(i)}>
              <Text style={{ color: "red" }}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ gap: 8, borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 8 }}>
        <TextInput 
          placeholder="Nom du médicament" 
          value={currentMed.name} 
          onChangeText={t => setCurrentMed({...currentMed, name: t})} 
          style={styles.input} 
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput 
            placeholder="Dosage" 
            value={currentMed.dosage} 
            onChangeText={t => setCurrentMed({...currentMed, dosage: t})} 
            style={[styles.input, { flex: 1 }]} 
          />
          <TextInput 
            placeholder="Durée" 
            value={currentMed.duration} 
            onChangeText={t => setCurrentMed({...currentMed, duration: t})} 
            style={[styles.input, { flex: 1 }]} 
          />
        </View>
        <TouchableOpacity onPress={addMedication} style={{ alignSelf: "flex-end", padding: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: "bold" }}>+ Ajouter médicament</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: "#9ca3af" }]}>
          <Text style={{ color: "#fff" }}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreate} style={[styles.button, { backgroundColor: colors.primary }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Créer</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function DoctorPrescriptions() {
  const [showCreate, setShowCreate] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const pageSize = 10;

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const baseQ = query(
        collection(db, "prescriptions"),
        where("doctorId", "==", auth.currentUser?.uid)
      );
      const snap = await getDocs(baseQ);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = patientName ? docs.filter(d => String(d.patientName || "").toLowerCase().includes(String(patientName).toLowerCase())) : docs;
      const sorted = filtered.sort((a, b) => {
        const av = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bv = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return bv - av;
      });
      setLoadedCount(Math.min(pageSize, sorted.length));
      setHasMore(sorted.length > pageSize);
      setItems(sorted.slice(0, pageSize));
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des données.");
      setItems([]);
      setHasMore(false);
    }
    setLoading(false);
  }

  async function loadNextPage() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const baseQ = query(
        collection(db, "prescriptions"),
        where("doctorId", "==", auth.currentUser?.uid)
      );
      const snap = await getDocs(baseQ);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = patientName ? docs.filter(d => String(d.patientName || "").toLowerCase().includes(String(patientName).toLowerCase())) : docs;
      const sorted = filtered.sort((a, b) => {
        const av = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const bv = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return bv - av;
      });
      const nextCount = Math.min(sorted.length, loadedCount + pageSize);
      setItems(sorted.slice(0, nextCount));
      setLoadedCount(nextCount);
      setHasMore(nextCount < sorted.length);
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des données.");
      setHasMore(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientName]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Prescriptions</Text>
        <TouchableOpacity 
          onPress={() => setShowCreate(!showCreate)} 
          style={{ backgroundColor: colors.secondary, padding: 8, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>{showCreate ? "Fermer" : "+ Nouvelle"}</Text>
        </TouchableOpacity>
      </View>

      {showCreate ? (
        <CreatePrescriptionForm 
          onCancel={() => setShowCreate(false)} 
          onSuccess={() => { setShowCreate(false); reload(); }} 
        />
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput 
              placeholder="Rechercher par nom patient..." 
              value={patientName} 
              onChangeText={setPatientName} 
              style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }} 
            />
            <TouchableOpacity onPress={reload} style={{ backgroundColor: colors.secondary, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" }}>
              <Text style={{ color: "#fff" }}>Chercher</Text>
            </TouchableOpacity>
          </View>

          {loading && items.length === 0 ? <ActivityIndicator /> : null}
          
          <ScrollView contentContainerStyle={{ gap: 10 }}>
            {items.map(p => (
              <View key={p.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700" }}>Patient: {p.patientName}</Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>{p.date}</Text>
                </View>
                <View style={{ marginTop: 8 }}>
                  {p.medications?.map((m, i) => (
                    <Text key={i} style={{ color: "#4b5563" }}>• {m.name} ({m.dosage}, {m.duration})</Text>
                  ))}
                </View>
              </View>
            ))}
            {hasMore && (
              <TouchableOpacity onPress={loadNextPage} style={{ alignSelf: "center", padding: 10 }}>
                <Text style={{ color: colors.secondary }}>Charger plus</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9fafb"
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  }
};
