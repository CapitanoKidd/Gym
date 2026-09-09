import Fuse from "fuse.js";
import { Exercise } from "@/types";

/**
 * Ricerca "intelligente" sugli esercizi: cerca prima per corrispondenza esatta/parziale
 * su nome e alias, poi ricade su una ricerca fuzzy (tollerante a errori di battitura e
 * a nomi alternativi non censiti) grazie a Fuse.js.
 *
 * Esempio: cercando "flessioni" trova l'esercizio "Flessioni"; cercando "push up" trova
 * comunque lo stesso esercizio grazie all'alias registrato.
 */
export function searchExercises(exercises: Exercise[], query: string): Exercise[] {
  const trimmed = query.trim();
  if (!trimmed) return exercises;

  const fuse = new Fuse(exercises, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "aliases", weight: 0.4 },
      { name: "muscleGroup", weight: 0.1 },
    ],
    threshold: 0.4, // più basso = più severo; 0.4 tollera qualche errore di battitura
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return fuse.search(trimmed).map((result) => result.item);
}
