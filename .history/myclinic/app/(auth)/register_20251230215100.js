import { useState } from "react";
import { View, TextInput, Text } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { Button } from "../../components/Button";
import { colors } from "../../theme/colors";
import { useRouter } from "expo-router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { LogoCircle } from "../../components/LogoCircle";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const role = "patient";
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit() {
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;
      await setDoc(doc(db, "users", uid), {
        uid,
        role,
        email: email.trim(),
        displayName,
        phone,
        createdAt: serverTimestamp()
      });
      await setDoc(doc(db, "patients", uid), {
        id: uid,
        userId: uid,
        birthDate: "",
        allergies: [],
        chronicConditions: [],
        insuranceNumber: ""
      });
      router.replace("/(auth)/login");
    } catch (e) {
      setError("Création échouée");
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <LogoCircle size={40} />
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.secondary }}>Créer un compte</Text>
      </View>
      <TextInput placeholder="Nom et prénom" value={displayName} onChangeText={setDisplayName} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="Téléphone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }} />
      <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 }} />
      <Text style={{ color: colors.secondary, fontWeight: "600" }}>Rôle: Patient</Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button title="S’inscrire" onPress={onSubmit} />
    </View>
  );
}
