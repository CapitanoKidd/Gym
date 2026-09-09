import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { ExercisesStackParamList, HistoryStackParamList, PlansStackParamList, RootTabParamList } from "./types";
import { colors } from "@/theme";

import ExercisesScreen from "@/screens/ExercisesScreen";
import ExerciseDetailScreen from "@/screens/ExerciseDetailScreen";
import AddExerciseScreen from "@/screens/AddExerciseScreen";
import PlansScreen from "@/screens/PlansScreen";
import PlanDetailScreen from "@/screens/PlanDetailScreen";
import PlanEditorScreen from "@/screens/PlanEditorScreen";
import ExercisePickerScreen from "@/screens/ExercisePickerScreen";
import WorkoutSessionScreen from "@/screens/WorkoutSessionScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import HistoryDetailScreen from "@/screens/HistoryDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";

const ExercisesStack = createNativeStackNavigator<ExercisesStackParamList>();
const PlansStack = createNativeStackNavigator<PlansStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

function ExercisesStackNavigator() {
  return (
    <ExercisesStack.Navigator screenOptions={screenOptions}>
      <ExercisesStack.Screen name="ExercisesList" component={ExercisesScreen} options={{ title: "Esercizi" }} />
      <ExercisesStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: "Dettaglio" }} />
      <ExercisesStack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: "Esercizio" }} />
    </ExercisesStack.Navigator>
  );
}

function PlansStackNavigator() {
  return (
    <PlansStack.Navigator screenOptions={screenOptions}>
      <PlansStack.Screen name="PlansList" component={PlansScreen} options={{ title: "Schede" }} />
      <PlansStack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: "Scheda" }} />
      <PlansStack.Screen name="PlanEditor" component={PlanEditorScreen} options={{ title: "Editor scheda" }} />
      <PlansStack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={{ title: "Aggiungi esercizi" }} />
      <PlansStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: "Dettaglio" }} />
      <PlansStack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ title: "Allenamento", headerBackVisible: false }}
      />
    </PlansStack.Navigator>
  );
}

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={screenOptions}>
      <HistoryStack.Screen name="HistoryList" component={HistoryScreen} options={{ title: "Storico" }} />
      <HistoryStack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: "Sessione" }} />
      <HistoryStack.Screen name="Settings" component={SettingsScreen} options={{ title: "Impostazioni" }} />
    </HistoryStack.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen
          name="Esercizi"
          component={ExercisesStackNavigator}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏋️</Text> }}
        />
        <Tab.Screen
          name="Schede"
          component={PlansStackNavigator}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text> }}
        />
        <Tab.Screen
          name="Storico"
          component={HistoryStackNavigator}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
