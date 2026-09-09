import "react-native-gesture-handler";
import React from "react";
import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "@/navigation/RootNavigator";

// Avviso innocuo generato internamente da react-native-draggable-flatlist (dipendenza
// esterna, non nostro codice): segnala l'uso di un'API deprecata di React Native, non
// rompe nulla. Lo silenziamo per non intasare la LogBox durante lo sviluppo.
LogBox.ignoreLogs(["InteractionManager has been deprecated"]);

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}
