# La Mia Palestra 🏋️

App mobile ad **uso personale** (non destinata alla pubblicazione sugli store) per gestire allenamenti in palestra, costruita con **Expo SDK 57 / React Native 0.86 / React 19**.

## Funzionalità

- **Esercizi**: libreria di oltre 50 esercizi predefiniti (gruppo muscolare, icona colorata — niente più foto casuali), con possibilità di aggiungerne di nuovi o modificarli. Tocca un esercizio per vedere come si esegue, il gruppo muscolare coinvolto e cosa fare/non fare. La **ricerca è "intelligente"**: cerca per nome, per alias (es. "push up" trova "Flessioni") e tollera errori di battitura grazie a una ricerca fuzzy.
- **Schede**: dal tasto **+** si apre l'editor della scheda **in modalità bozza**: dai un nome, aggiungi esercizi dalla libreria (ogni "+ Aggiungi" torna subito all'editor, pronto per aggiungerne un altro), riordinali trascinandoli (tasto ≡), imposta **serie, ripetizioni, peso suggerito e tempo di riposo** per ciascuno — nulla viene salvato finché non premi **💾 Salva scheda** in fondo (puoi annullare in ogni momento). La stessa schermata si riusa per modificare una scheda già esistente (tasto "Modifica" nel dettaglio scheda).
- **Allenamento**: tasto **▶ Inizia allenamento** avvia la sessione con un **cronometro** totale, alterna esercizio → riposo (con countdown, e vibrazione + un doppio beep quando il riposo finisce, udibile anche a telefono in silenzioso) → esercizio successivo. Lo schermo resta acceso per tutta la sessione (non si spegne durante il riposo). Durante ogni esercizio puoi aprire **📝 Nota / peso** per annotare il peso realmente usato o una nota libera (es. "provare 35kg la prossima volta") — il campo peso è **pre-compilato automaticamente con l'ultimo peso usato per quell'esercizio** nello storico, così non parti mai da zero. Il tasto **⏹ Termina allenamento** ferma tutto e salva la sessione nello Storico; su Android anche il tasto fisico "indietro" chiede conferma invece di uscire silenziosamente.
- **Storico e progressione**: ogni allenamento concluso viene registrato con data, durata, esercizi svolti, peso usato e note. Da ogni esercizio (tab Esercizi → dettaglio) si può aprire **📈 Vedi progressione peso**: un grafico a linee (asse tempo/peso) con i pesi registrati nel tempo per quell'esercizio, più un riepilogo primo/ultimo/variazione. Dallo Storico si accede anche a ⚙️ **Impostazioni** per esportare/importare un backup JSON di esercizi, schede e storico (utile perché tutto vive solo su questo telefono).
- **Notifiche**: se chiudi l'app o esci mentre l'allenamento è attivo, ricevi una notifica locale che ti ricorda che la sessione è ancora in corso.
- Eliminare un esercizio usato in qualche scheda non la rompe silenziosamente: viene mostrato un avviso "esercizio eliminato" al posto della riga, sia in fase di modifica sia durante un allenamento.

## Avvio in locale

Richiede Node.js e l'app **Expo Go** sul telefono (oppure un emulatore Android/iOS).

```bash
npm install
npm run start
```

Scansiona il QR code con Expo Go (Android) o con la fotocamera (iOS) per aprire l'app sul telefono, sulla stessa rete Wi-Fi del computer.

## Note

- I dati (esercizi, schede, storico) sono salvati **localmente sul dispositivo** con AsyncStorage: nessun account, nessun server. Usa "Esporta backup" in Impostazioni per avere una copia di sicurezza condivisibile (es. su Drive/email) in caso di reinstallazione o cambio telefono.
- Gli esercizi predefiniti mostrano un'**icona colorata per gruppo muscolare** invece di una foto: funziona offline e non dipende da nessun servizio esterno. Se aggiungi un esercizio custom puoi comunque impostare un URL immagine reale (opzionale) da **Aggiungi esercizio**.
- Per pubblicare l'app su un telefono senza passare da Expo Go puoi creare una build standalone con `eas build` (richiede un account Expo gratuito), oppure usare `expo run:android` / `expo run:ios` con un cavo USB — resta comunque un'app privata, non pubblicata sullo store.
- Testato con `tsc --noEmit`, `expo export` e un flusso end-to-end in browser headless (creazione scheda con più aggiunte consecutive di esercizi, ricerca smart, avvio allenamento, note/peso, suggerimento del peso tra una sessione e l'altra, grafico di progressione, salvataggio nello storico) — il drag & drop per riordinare gli esercizi, la vibrazione, il tasto back Android e l'export/import file vanno comunque verificati su un dispositivo reale, dato che non sono simulabili in modo affidabile in quell'ambiente di test.
