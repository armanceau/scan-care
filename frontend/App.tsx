import { LoginScreen } from "./src/screens/LoginScreen";
import type { User } from "firebase/auth";

export default function App() {
  const handleAuthStateChange = (user: User | null) => {
    if (user) {
      console.log("✅ Utilisateur connecté:", user.email);
    } else {
      console.log("❌ Utilisateur déconnecté");
    }
  };

  return (
    <LoginScreen
      onAuthStateChange={handleAuthStateChange}
      onSignOut={() => console.log("Utilisateur déconnecté")}
    />
  );
}
