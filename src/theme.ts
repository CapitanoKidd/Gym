// Palette allineata all'icona dell'app (manubrio rosso su riquadro nero): il rosso qui
// sotto è preso a campione direttamente dall'icona, non inventato a caso, così l'app e
// l'icona sul telefono sembrano la stessa cosa invece di due pezzi assemblati insieme.
export const colors = {
  bg: "#0f1114",
  card: "#1a1c21",
  cardAlt: "#232630",
  border: "#2b2e36",
  text: "#f5f6f8",
  textMuted: "#9096a3",

  primary: "#eb3b31",
  primaryDark: "#b52a23",
  // Sfondo tenue per badge/evidenziazioni che usano il colore principale senza essere
  // un bottone pieno (es. suggerimenti, tab attiva, elementi selezionati).
  primarySoft: "rgba(235, 59, 49, 0.14)",

  success: "#33c17e",
  successSoft: "rgba(51, 193, 126, 0.12)",
  danger: "#ff5c5c",
  warning: "#ffb74f",
  warningSoft: "rgba(255, 183, 79, 0.14)",
};

/** Scala di raggi degli angoli, per coerenza tra le card/i bottoni di tutta l'app. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

/**
 * Ombre riutilizzabili da spargere (spread) dentro gli stili delle card, per dare un
 * minimo di profondità invece del solo bordo sottile piatto usato ovunque prima. "sm" per
 * elementi piccoli/di lista, "md" per elementi più prominenti (card principali, bottoni
 * primari, il FAB).
 */
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
