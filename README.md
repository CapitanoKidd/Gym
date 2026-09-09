# La Mia Palestra 🏋️

App mobile ad **uso personale** (non destinata alla pubblicazione sugli store) per gestire allenamenti in palestra, costruita con **Expo / React Native**.

## Funzionalità

- **Esercizi**: libreria di esercizi predefiniti (gruppo muscolare, immagine di anteprima), con possibilità di aggiungerne di nuovi o modificarli. Tocca un esercizio per vedere come si esegue, il gruppo muscolare coinvolto e cosa fare/non fare.
- **Schede**: crea schede di allenamento con il tasto **+**, aggiungi esercizi dalla libreria, **trascina** per riordinarli (tasto ≡) e imposta il tempo di riposo per ciascun esercizio (default 60s, regolabile a step di 15s).
- **Allenamento**: tasto **▶ Inizia allenamento** avvia la sessione con un **cronometro** totale, alterna esercizio → riposo (con countdown) → esercizio successivo, e un tasto **⏹ Termina allenamento** per fermare tutto.
- **Notifiche**: se chiudi l'app o esci mentre l'allenamento è attivo, ricevi una notifica locale che ti ricorda che la sessione è ancora in corso.

## Avvio in locale

Richiede Node.js e l'app **Expo Go** sul telefono (oppure un emulatore Android/iOS).

```bash
npm install
npm run start
```

Scansiona il QR code con Expo Go (Android) o con la fotocamera (iOS) per aprire l'app sul telefono, sulla stessa rete Wi-Fi del computer.

## Note

- I dati (esercizi, schede) sono salvati **localmente sul dispositivo** con AsyncStorage: nessun account, nessun server.
- Le immagini degli esercizi predefiniti sono segnaposto (picsum.photos): puoi sostituirle in qualsiasi momento aprendo l'esercizio → **Modifica** → incolla l'URL di un'altra immagine (es. da Google Images, Wikimedia, ecc.).
- Per pubblicare l'app su un telefono senza passare da Expo Go puoi creare una build standalone con `eas build` (richiede un account Expo gratuito), oppure usare `expo run:android` / `expo run:ios` con un cavo USB — resta comunque un'app privata, non pubblicata sullo store.
