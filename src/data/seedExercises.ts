import { Exercise } from "@/types";

// Immagini segnaposto (picsum, seed stabile per esercizio) — sostituibili in ogni momento
// dalla schermata "Aggiungi esercizio" > modifica, incollando un altro URL.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/300`;

export const SEED_EXERCISES: Exercise[] = [
  {
    id: "squat",
    name: "Squat con bilanciere",
    muscleGroup: "Gambe",
    imageUrl: img("squat"),
    description:
      "In piedi, bilanciere sulla parte alta della schiena. Scendi piegando anche e ginocchia mantenendo la schiena dritta, come se ti sedessi su una sedia, poi risali spingendo sui talloni.",
    doList: [
      "Tieni il petto alto e lo sguardo avanti",
      "Spingi le ginocchia nella direzione delle punte dei piedi",
      "Scendi fino a coscia parallela al pavimento (o oltre se mobilità lo permette)",
    ],
    dontList: [
      "Non far collassare le ginocchia verso l'interno",
      "Non inarcare eccessivamente la zona lombare",
      "Non sollevare i talloni da terra",
    ],
    isCustom: false,
    aliases: ["squat", "back squat", "piegamenti sulle gambe"],
  },
  {
    id: "stacco",
    name: "Stacco da terra",
    muscleGroup: "Schiena",
    imageUrl: img("deadlift"),
    description:
      "Bilanciere a terra, piedi larghezza bacino. Afferra il bilanciere, schiena dritta, e sollevalo estendendo anche e ginocchia contemporaneamente fino alla posizione eretta.",
    doList: [
      "Mantieni il bilanciere vicino alle gambe per tutto il movimento",
      "Attiva il core prima di sollevare",
      "Spingi il pavimento con i piedi",
    ],
    dontList: [
      "Non arrotondare la schiena",
      "Non usare solo la schiena: spingi con le gambe",
      "Non estendere di scatto ad inizio movimento",
    ],
    isCustom: false,
    aliases: ["stacco da terra", "deadlift", "stacco"],
  },
  {
    id: "panca",
    name: "Panca piana con bilanciere",
    muscleGroup: "Petto",
    imageUrl: img("benchpress"),
    description:
      "Sdraiato su panca, bilanciere sopra il petto con presa poco più larga delle spalle. Scendi controllando fino a sfiorare il petto, poi spingi verso l'alto.",
    doList: [
      "Scapole retratte e stabili contro la panca",
      "Piedi ben piantati a terra",
      "Traiettoria leggermente arcuata (verso il basso-petto, su-alto)",
    ],
    dontList: [
      "Non far rimbalzare il bilanciere sul petto",
      "Non sollevare i glutei dalla panca",
      "Non bloccare completamente i gomiti con violenza",
    ],
    isCustom: false,
    aliases: ["panca piana", "bench press", "distensioni su panca"],
  },
  {
    id: "trazioni",
    name: "Trazioni alla sbarra",
    muscleGroup: "Schiena",
    imageUrl: img("pullup"),
    description:
      "Appeso alla sbarra con presa prona più larga delle spalle, tira il corpo verso l'alto fino a portare il mento sopra la sbarra, poi scendi controllando.",
    doList: [
      "Parti da un dead hang completo",
      "Porta i gomiti verso il basso e indietro",
      "Controlla la fase di discesa",
    ],
    dontList: [
      "Non usare slancio eccessivo (kipping) se l'obiettivo è forza/ipertrofia",
      "Non fermarti a metà range di movimento",
    ],
    isCustom: false,
    aliases: ["pull up", "pullup", "trazioni"],
  },
  {
    id: "military-press",
    name: "Military Press",
    muscleGroup: "Spalle",
    imageUrl: img("ohp"),
    description:
      "In piedi, bilanciere all'altezza delle clavicole. Spingi verticalmente sopra la testa fino a estensione completa delle braccia, poi torna alla posizione di partenza.",
    doList: [
      "Contrai glutei e addome per stabilizzare il bacino",
      "Fai passare la testa leggermente in avanti quando il bilanciere supera il viso",
    ],
    dontList: [
      "Non inarcare troppo la schiena",
      "Non usare le gambe per spingere (a meno di push press voluto)",
    ],
    isCustom: false,
    aliases: ["overhead press", "ohp", "lento avanti", "shoulder press"],
  },
  {
    id: "curl-bicipiti",
    name: "Curl bicipiti con bilanciere",
    muscleGroup: "Bicipiti",
    imageUrl: img("curl"),
    description:
      "In piedi, bilanciere con presa supina larghezza spalle. Piega i gomiti sollevando il bilanciere verso il petto mantenendo i gomiti fermi lungo il busto.",
    doList: ["Mantieni i gomiti fissi ai fianchi", "Controlla la fase eccentrica"],
    dontList: [
      "Non dondolare il busto per aiutarti (cheating)",
      "Non estendere completamente di scatto ad inizio ripetizione",
    ],
    isCustom: false,
    aliases: ["curl", "biceps curl", "curl bilanciere"],
  },
  {
    id: "french-press",
    name: "French Press",
    muscleGroup: "Tricipiti",
    imageUrl: img("skullcrusher"),
    description:
      "Sdraiato su panca, bilanciere/manubri sopra il petto con braccia estese. Piega solo i gomiti abbassando il peso verso la fronte, poi estendi.",
    doList: ["Mantieni i gomiti puntati verso il soffitto e fermi", "Movimento controllato"],
    dontList: ["Non allargare i gomiti durante la discesa", "Non usare carichi eccessivi"],
    isCustom: false,
    aliases: ["skull crusher", "tricipiti bilanciere", "estensioni tricipiti"],
  },
  {
    id: "plank",
    name: "Plank",
    muscleGroup: "Addominali",
    imageUrl: img("plank"),
    description:
      "Appoggio su avambracci e punte dei piedi, corpo allineato dalla testa ai talloni. Mantieni la posizione contraendo addome e glutei.",
    doList: ["Mantieni la linea testa-bacino-talloni dritta", "Respira normalmente"],
    dontList: ["Non far cadere il bacino verso il basso", "Non alzare troppo i glutei"],
    isCustom: false,
    aliases: ["plank", "tavola", "planking"],
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    muscleGroup: "Glutei",
    imageUrl: img("hipthrust"),
    description:
      "Schiena appoggiata su panca, bilanciere sui fianchi. Spingi i fianchi verso l'alto contraendo i glutei fino a estensione completa dell'anca.",
    doList: ["Mento leggermente al petto", "Spingi sui talloni", "Contrai forte i glutei in alto"],
    dontList: ["Non iperestendere la zona lombare in alto", "Non usare solo le gambe"],
    isCustom: false,
    aliases: ["hip thrust", "spinta anche", "ponte glutei"],
  },
  {
    id: "affondi",
    name: "Affondi con manubri",
    muscleGroup: "Gambe",
    imageUrl: img("lunges"),
    description:
      "In piedi con manubri ai lati, fai un passo avanti e scendi piegando entrambe le ginocchia a 90°, poi torna in piedi spingendo sul tallone anteriore.",
    doList: ["Busto eretto", "Ginocchio anteriore sopra la caviglia"],
    dontList: ["Non far toccare il ginocchio posteriore violentemente a terra", "Non sbilanciarti in avanti"],
    isCustom: false,
    aliases: ["lunges", "affondi", "walking lunges"],
  },
  {
    id: "rematore",
    name: "Rematore con bilanciere",
    muscleGroup: "Schiena",
    imageUrl: img("row"),
    description:
      "Busto inclinato in avanti circa 45°, bilanciere in mano con presa prona. Tira il bilanciere verso l'addome contraendo le scapole, poi ridiscendi controllato.",
    doList: ["Schiena piatta per tutto il movimento", "Tira con i gomiti, non con le mani"],
    dontList: ["Non usare slancio con la schiena", "Non arrotondare la parte alta della schiena"],
    isCustom: false,
    aliases: ["bent over row", "row", "rematore bilanciere"],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    muscleGroup: "Gambe",
    imageUrl: img("legpress"),
    description:
      "Seduto sulla macchina, piedi larghezza spalle sulla pedana. Piega le ginocchia portando la pedana verso il petto, poi spingi in estensione senza bloccare le ginocchia.",
    doList: ["Mantieni la zona lombare aderente allo schienale", "Range di movimento controllato"],
    dontList: ["Non bloccare le ginocchia in estensione completa con forza", "Non staccare il bacino dallo schienale"],
    isCustom: false,
    aliases: ["leg press", "pressa gambe"],
  },
  {
    id: "alzate-laterali",
    name: "Alzate laterali",
    muscleGroup: "Spalle",
    imageUrl: img("lateralraise"),
    description:
      "In piedi con manubri ai lati, solleva le braccia lateralmente fino all'altezza delle spalle mantenendo un leggero angolo ai gomiti.",
    doList: ["Movimento lento e controllato", "Gomiti leggermente più alti dei polsi"],
    dontList: ["Non usare slancio del busto", "Non salire oltre l'altezza delle spalle con carichi eccessivi"],
    isCustom: false,
    aliases: ["lateral raise", "alzate laterali manubri"],
  },
  {
    id: "crunch",
    name: "Crunch",
    muscleGroup: "Addominali",
    imageUrl: img("crunch"),
    description:
      "Sdraiato supino, ginocchia piegate. Solleva le scapole da terra contraendo gli addominali, senza tirare il collo con le mani.",
    doList: ["Concentrati sulla contrazione addominale", "Espira durante la salita"],
    dontList: ["Non tirare la testa con le mani", "Non usare slancio con le gambe"],
    isCustom: false,
    aliases: ["crunch", "addominali crunch", "sit up"],
  },
  {
    id: "corsa",
    name: "Corsa (tapis roulant / esterno)",
    muscleGroup: "Cardio",
    imageUrl: img("running"),
    description:
      "Corsa a ritmo costante o ad intervalli per allenamento cardiovascolare.",
    doList: ["Mantieni una postura eretta", "Atterra con il piede sotto al bacino"],
    dontList: ["Non aumentare il ritmo troppo bruscamente", "Non trascurare il riscaldamento"],
    isCustom: false,
    aliases: ["corsa", "running", "tapis roulant", "jogging"],
  },
  {
    id: "burpees",
    name: "Burpees",
    muscleGroup: "Full Body",
    imageUrl: img("burpees"),
    description:
      "Da in piedi, accovacciati, porta le gambe indietro in plank, esegui un piegamento, riporta le gambe avanti e salta con le braccia sopra la testa.",
    doList: ["Mantieni il core attivo durante il plank", "Atterra morbido dal salto"],
    dontList: ["Non far cadere il bacino durante il plank", "Non saltare qualità per velocità"],
    isCustom: false,
    aliases: ["burpee", "burpees"],
  },
  {
    id: "dips",
    name: "Dips alle parallele",
    muscleGroup: "Tricipiti",
    imageUrl: img("dips"),
    description:
      "Sospeso sulle parallele con braccia estese, scendi piegando i gomiti fino a circa 90°, poi risali estendendo le braccia.",
    doList: ["Busto leggermente inclinato in avanti per più petto, verticale per più tricipiti", "Scendi controllato"],
    dontList: ["Non scendere troppo se hai problemi alle spalle", "Non bloccare i gomiti con forza in alto"],
    isCustom: false,
    aliases: ["dips", "parallele", "tricipiti alle parallele"],
  },
  {
    id: "leg-curl",
    name: "Leg Curl (femorali)",
    muscleGroup: "Gambe",
    imageUrl: img("legcurl"),
    description:
      "Sdraiato prono sulla macchina, piega le ginocchia portando il rullo verso i glutei, poi ridistendi controllato.",
    doList: ["Bacino ben aderente al supporto", "Movimento lento in fase eccentrica"],
    dontList: ["Non sollevare il bacino dal supporto", "Non usare slancio"],
    isCustom: false,
    aliases: ["leg curl", "femorali", "hamstring curl"],
  },
  {
    id: "pulley",
    name: "Lat Machine (Pulldown)",
    muscleGroup: "Schiena",
    imageUrl: img("latpulldown"),
    description:
      "Seduto alla macchina, presa larga sulla barra. Tira la barra verso l'alto del petto contraendo le scapole, poi risali controllato.",
    doList: ["Petto in fuori, leggera inclinazione indietro del busto", "Tira con la schiena, non solo con le braccia"],
    dontList: ["Non tirare la barra dietro la nuca", "Non usare slancio eccessivo del busto"],
    isCustom: false,
    aliases: ["lat machine", "pulldown", "lat pulldown", "pulley"],
  },
  {
    id: "calf-raise",
    name: "Calf Raise (polpacci)",
    muscleGroup: "Gambe",
    imageUrl: img("calfraise"),
    description:
      "In piedi, solleva i talloni da terra contraendo i polpacci il più possibile, poi scendi lentamente sotto il livello di partenza.",
    doList: ["Range di movimento completo", "Pausa in contrazione massima"],
    dontList: ["Non rimbalzare velocemente tra le ripetizioni", "Non piegare le ginocchia per aiutarti"],
    isCustom: false,
    aliases: ["calf raise", "polpacci", "alzate sui polpacci"],
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    muscleGroup: "Full Body",
    imageUrl: img("mountainclimber"),
    description:
      "In posizione di plank alto, porta alternativamente le ginocchia al petto in modo rapido e controllato.",
    doList: ["Mantieni il bacino stabile", "Core sempre attivo"],
    dontList: ["Non far ondeggiare i fianchi", "Non perdere l'allineamento del busto"],
    isCustom: false,
    aliases: ["mountain climber", "scalatore"],
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    muscleGroup: "Addominali",
    imageUrl: img("russiantwist"),
    description:
      "Seduto con busto inclinato indietro e piedi sollevati o a terra, ruota il busto portando le mani (o un peso) da un lato all'altro.",
    doList: ["Mantieni la schiena dritta, non curva", "Movimento controllato"],
    dontList: ["Non curvare eccessivamente la parte bassa della schiena", "Non usare solo le braccia per il movimento"],
    isCustom: false,
    aliases: ["russian twist", "torsioni russe"],
  },
  {
    id: "spinta-manubri-inclinata",
    name: "Panca inclinata con manubri",
    muscleGroup: "Petto",
    imageUrl: img("inclinedumbbell"),
    description:
      "Sdraiato su panca inclinata 30-45°, manubri all'altezza del petto. Spingi verso l'alto estendendo le braccia, poi scendi controllato.",
    doList: ["Scapole retratte", "Traiettoria leggermente convergente in alto"],
    dontList: ["Non far scontrare i manubri con forza in alto", "Non inarcare eccessivamente la schiena"],
    isCustom: false,
    aliases: ["incline dumbbell press", "panca inclinata manubri"],
  },
  {
    id: "flessioni",
    name: "Flessioni",
    muscleGroup: "Petto",
    imageUrl: img("pushup"),
    description:
      "A terra in posizione di plank, mani leggermente più larghe delle spalle. Piega i gomiti abbassando il petto verso il pavimento, poi spingi per risalire.",
    doList: [
      "Mantieni il corpo allineato dalla testa ai talloni",
      "Gomiti a circa 45° dal busto, non completamente aperti",
      "Scendi fino a sfiorare il pavimento col petto",
    ],
    dontList: [
      "Non far cadere il bacino verso il basso",
      "Non alzare i glutei per facilitare il movimento",
    ],
    isCustom: false,
    aliases: ["push up", "push-up", "pushup", "piegamenti sulle braccia", "piegamenti"],
  },
];
