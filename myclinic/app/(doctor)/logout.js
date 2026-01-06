import { useEffect } from "react";
import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import { Redirect } from "expo-router";

export default function LogoutDoctor() {
  useEffect(() => {
    signOut(auth);
  }, []);
  return <Redirect href="/(auth)/login" />;
}

