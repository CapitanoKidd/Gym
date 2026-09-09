# La Mia Palestra 🏋️

App mobile ad **uso personale** (non destinata alla pubblicazione sugli store) per gestire allenamenti in palestra, costruita con **Expo / React Native**.

## Funzionalità

- **Esercizi**: libreria di esercizi predefiniti (gruppo muscolare, immagine di anteprima), con possibilità di aggiungerne di nuovi o modificarli. Tocca un esercizio per vedere come si esegue, il gruppo muscolare coinvolto e cosa fare/non fare. La **ricerca è "intelligente"**: cerca per nome, per alias (es. "push up" trova "Flessioni") e tollera errori di battitura grazie a una ricerca fuzzy.
- **Schede**: dal tasto **+** si apre l'editor della scheda **in modalità bozza**: dai un nome, aggiungi esercizi dalla libreria, riordinali trascinandoli (tasto ≡), imposta **serie, ripetizioni, peso suggerito e tempo di riposo** per ciascuno — nulla viene salvato finché non premi **💾 Salva scheda** in fondo (puoi annullare in ogni momento). La stessa schermata si riusa per modificare una scheda già esistente (tasto "Modifica" nel dettaglio scheda).
- **Allenamento**: tasto **▶ Inizia allenamento** avvia la sessione con un **cronometro** totale, alterna esercizio → riposo (con countdown, e una vibrazione quando il riposo finisce) → esercizio successivo. Durante ogni esercizio puoi aprire **📝 Nota / peso** per annotare il peso realmente usato o una nota libera (es. "provare 35kg la prossima volta"). Il tasto **⏹ Termina allenamento** ferma tutto e salva la sessione nello Storico; su Android anche il tasto fisico "indietro" chiede conferma invece di uscire silenziosamente.
- **Storico**: ogni allenamento concluso viene registrato con data, durata, esercizi svolti, peso usato e note. Da qui si accede anche a ⚙️ **Impostazioni** per esportare/importare un backup JSON di esercizi, schede e storico (utile perché tutto vive solo su questo telefono).
- **Notifiche**: se chiudi l'app o esci mentre l'allenamento è attivo, ricevi una notifica locale che ti ricorda che la sessione è ancora in corso.

## Avvio in locale

Richiede Node.js e l'app **Expo Go** sul telefono (oppure un emulatore Android/iOS).

```bash
npm install
npm run start
```

Scansiona il QR code con Expo Go (Android) o con la fotocamera (iOS) per aprire l'app sul telefono, sulla stessa rete Wi-Fi del computer.

## Note

- I dati (esercizi, schede, storico) sono salvati **localmente sul dispositivo** con AsyncStorage: nessun account, nessun server. Usa "Esporta backup" in Impostazioni per avere una copia di sicurezza condivisibile (es. su Drive/email) in caso di reinstallazione o cambio telefono.
- Le immagini degli esercizi predefiniti sono segnaposto (picsum.photos) e richiedono connessione internet per caricarsi: puoi sostituirle in qualsiasi momento aprendo l'esercizio → **Modifica** → incolla l'URL di un'altra immagine (es. da Google Images, Wikimedia, ecc.).
- Per pubblicare l'app su un telefono senza passare da Expo Go puoi creare una build standalone con `eas build` (richiede un account Expo gratuito), oppure usare `expo run:android` / `expo run:ios` con un cavo USB — resta comunque un'app privata, non pubblicata sullo store.
- Testato con `tsc --noEmit`, `expo export` e un flusso end-to-end in browser headless (creazione scheda, ricerca smart, avvio allenamento, note/peso, salvataggio nello storico) — il drag & drop per riordinare gli esercizi va comunque verificato su un dispositivo reale, dato che i gesti touch non sono simulabili in modo affidabile in quell'ambiente di test.
