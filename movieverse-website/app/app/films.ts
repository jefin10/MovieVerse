// Real TMDB poster and backdrop paths for the films the /app page shows.
export const tmdb = (path: string, size = "w342") => `https://image.tmdb.org/t/p/${size}${path}`;

export const POSTERS = {
  interstellar: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
  inception: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
  darkKnight: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  spiritedAway: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
  whiplash: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
  up: "/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg",
  budapest: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
  bladeRunner: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
  matrix: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
  wallE: "/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg",
  toyStory: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
  joker: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  titanic: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
  forrestGump: "/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
} as const;

export type Film = keyof typeof POSTERS;

export const BACKDROPS = {
  interstellar: "/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
} as const;
