export type Word = { text: string; start: number; end: number };

// Everything that differs between videos edited in this style.
export type EditSource = {
  // Footage in public/.
  video: string;
  // Loudness-normalised voice track in public/; when set, it replaces the
  // footage's own audio.
  audio?: string;
  // Length of the footage, in seconds.
  duration: number;
  words: Word[];
  // Words set in the condensed serif (indexes into words).
  emphasis: number[];
  // Hard cuts (or crossfades) already present in the footage.
  cuts: number[];
  // Short cutaway that should be left without zoom or whoosh.
  cutaway?: { start: number; end: number };
  // "Método Viva Melhor" closing screen, starting at this time. The footage
  // is held on its last frame until the video ends.
  endCard?: { start: number; totalDuration: number };
};
