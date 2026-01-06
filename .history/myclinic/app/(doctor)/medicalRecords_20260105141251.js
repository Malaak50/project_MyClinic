import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { colors } from "../../theme/colors";
import { addDoc, collection, serverTimestamp, getDocs, query, limit, where } from "firebase/firestore";
import { db, auth } from "../../services/firebase";

function CreateRecordForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    type: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);

  useEffect(() => {
    // Fetch some patients for selection
    // In a real app, this should be a search
    async function fetchPatients() {
      const q = query(collection(db, "patients"), limit(20));
      const snap = await getDocs(q);
      setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchPatients();
  }, []);

  const handleCreate = async () => {
    if (!form.patientId || !form.type || !form.notes) {
      Alert.alert("Erreur", "Tous les champs sont requis");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "medical_records"), {
        patientId: form.patientId,
        patientName: form.patientName,
        doctorId: auth.currentUser.uid,
        doctorName: auth.currentUser.displayName || "Docteur",
        type: form.type,
        notes: form.notes,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      Alert.alert("Succès", "Dossier mis à jour");
      onSuccess();
    } catch (e) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ gap: 12, padding: 16, backgroundColor: "#fff", borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nouvelle Entrée Médicale</Text>
      
      <Text style={{ marginBottom: 4 }}>Patient : {form.patientName || "Sélectionner..."}</Text>
      <TouchableOpacity onPress={() => setShowPatientPicker(true)} style={styles.input}>
         <Text>{form.patientName || "Choisir un patient"}</Text>
      </TouchableOpacity>

      <Modal visible={showPatientPicker} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Sélectionner un patient</Text>
          <FlatList 
            data={patients}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                setForm({ ...form, patientId: item.id, patientName: item.displayName || item.email || "Patient" });
                setShowPatientPicker(false);
              }} style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                <Text>{item.displayName || "Sans nom"} ({item.email})</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setShowPatientPicker(false)} style={{ marginTop: 20, padding: 15, backgroundColor: "#eee", alignItems: "center" }}>
            <Text>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TextInput 
        placeholder="Type (ex: Consultation, Urgence)" 
        value={form.type} 
        onChangeText={t => setForm({...form, type: t})} 
        style={styles.input} 
      />
      
      <TextInput 
        placeholder="Notes / Observations" 
        value={form.notes} 
        onChangeText={t => setForm({...form, notes: t})} 
        style={[styles.input, { height: 100 }]} 
        multiline 
      />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: "#9ca3af" }]}>
          <Text style={{ color: "#fff" }}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreate} style={[styles.button, { backgroundColor: colors.primary }]}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Enregistrer</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function DoctorMedicalRecords() {
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
        collection(db, "medical_records"),
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
        collection(db, "medical_records"),
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
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Dossiers Médicaux</Text>
        <TouchableOpacity 
          onPress={() => setShowCreate(!showCreate)} 
          style={{ backgroundColor: colors.secondary, padding: 8, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>{showCreate ? "Fermer" : "+ Ajouter"}</Text>
        </TouchableOpacity>
      </View>

      {showCreate ? (
        <CreateRecordForm 
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
            {items.map(r => (
              <View key={r.id} style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, backgroundColor: "#fff" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700" }}>Patient: {r.patientName}</Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>{r.date}</Text>
                </View>
                <Text style={{ fontWeight: "600", color: colors.primary, marginTop: 4 }}>{r.type}</Text>
                <Text style={{ marginTop: 4, color: "#4b5563" }}>{r.notes}</Text>
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
