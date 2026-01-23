import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { User } from "firebase/auth";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import ReminderList from "../screens/ReminderList";
import ScanPrescriptionScreen from "../screens/ScanPrescriptionScreen";
import React from "react";

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  RemindersList: undefined;
  ScanPrescriptionScreen: undefined;
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
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Dashboard"
            options={{
              title: "",
              headerTitle: "",
              headerTitleAlign: "center",
              headerRight: () => (
                <Pressable
                  style={styles.headerAction}
                  onPress={onSignOut}
                  disabled={submitting}
                >
                  <FontAwesome name="sign-out" size={20} color="#fff" />
                </Pressable>
              ),
              headerLeft: () => (
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>💊</Text>
                  </View>
                  <Text style={styles.appName}>Scan Care</Text>
                </View>
              ),
            }}
          >
            {({ navigation }) => (
              <DashboardScreen
                userEmail={user?.email ?? undefined}
                onOpenReminders={() => navigation.navigate("RemindersList")}
                onOpenScanPrescription={() =>
                  navigation.navigate("ScanPrescriptionScreen")
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="RemindersList"
            component={ReminderList}
            options={({ navigation }) => ({
              title: "",
              headerTitle: "",
              headerTitleAlign: "center",
              headerRight: () => (
                <Pressable
                  style={styles.headerAction}
                  onPress={onSignOut}
                  disabled={submitting}
                >
                  <FontAwesome name="sign-out" size={20} color="#fff" />
                </Pressable>
              ),
              headerLeft: () => (
                <Pressable
                  style={styles.header}
                  onPress={() => navigation.navigate("Dashboard")}
                >
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>💊</Text>
                  </View>
                  <Text style={styles.appName}>Scan Care</Text>
                </Pressable>
              ),
            })}
          />
          <Stack.Screen
            name="ScanPrescriptionScreen"
            component={ScanPrescriptionScreen}
            options={({ navigation }) => ({
              title: "",
              headerTitle: "",
              headerTitleAlign: "center",
              headerRight: () => (
                <Pressable
                  style={styles.headerAction}
                  onPress={onSignOut}
                  disabled={submitting}
                >
                  <FontAwesome name="sign-out" size={20} color="#fff" />
                </Pressable>
              ),
              headerLeft: () => (
                <Pressable
                  style={styles.header}
                  onPress={() => navigation.navigate("Dashboard")}
                >
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>💊</Text>
                  </View>
                  <Text style={styles.appName}>Scan Care</Text>
                </Pressable>
              ),
            })}
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
    paddingHorizontal: Platform.OS === 'web' ? 8 : 12,
    paddingVertical: Platform.OS === 'web' ? 4 : 6,
    backgroundColor: "#CA0B00",
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Platform.OS === 'web' ? 16 : 12,
  },
  headerActionText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 100,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 0,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Platform.OS === 'web' ? 8 : 12,
  },
  logoIcon: {
    fontSize: 24,
  },
  appName: {
    fontSize: Platform.OS === 'web' ? 18 : 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerScreen: {},
});
