import { useAudioPlayer } from "expo-audio";

const REST_END_SOUND = require("../../assets/sounds/rest-end.wav");

/**
 * Suono breve (due beep) da riprodurre quando finisce il riposo tra un esercizio e
 * l'altro, oltre alla vibrazione — più facile da notare se il telefono non è in mano.
 */
export function useRestEndSound() {
  const player = useAudioPlayer(REST_END_SOUND);

  return () => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // Non bloccare l'allenamento se per qualche motivo l'audio non parte
      // (es. dispositivo in modalità silenziosa con riproduzione bloccata dal sistema).
    }
  };
}
