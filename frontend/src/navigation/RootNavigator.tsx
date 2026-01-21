import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { User } from "firebase/auth";
import { Pressable, StyleSheet, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import ReminderList from "../screens/ReminderList";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  RemindersList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type RootNavigatorProps = {
  user: User | null;
  submitting: boolean;
  onSignOut: () => void;
  onAuthStateChange: (user: User | null) => void;
};

export const RootNavigator = ({
  user,
  submitting,
  onSignOut,
  onAuthStateChange,
}: RootNavigatorProps) => {
  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="Dashboard"
            options={{
              title: "Tableau de bord",
              headerRight: () => (
                <Pressable
                  style={styles.headerAction}
                  onPress={onSignOut}
                  disabled={submitting}
                >
                  <FontAwesome name="sign-out" size={20} color="#fff" />
                </Pressable>
              ),
            }}
          >
            {({ navigation }) => (
              <DashboardScreen
                userEmail={user?.email ?? undefined}
                onOpenReminders={() => navigation.navigate("RemindersList")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RemindersList"
            component={ReminderList}
            options={{ title: "Mes rappels" }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => (
            <LoginScreen
              onAuthStateChange={onAuthStateChange}
              onSignOut={() => console.log("Utilisateur déconnecté")}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  headerActionText: {
    color: "#fff",
    fontWeight: "600",
  },
});
