// Real TMDB poster and backdrop paths for the films the /app page shows.
export const tmdb = (path: string, size = "w342") => `https://image.tmdb.org/t/p/${size}${path}`;

export const POSTERS = {
  interstellar: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
  inception: "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
  darkKnight: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  coco: "/6Ryitt95xrO8KXuqRGm1fUuNwqF.jpg",
  whiplash: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
  up: "/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg",
  budapest: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
  bladeRunner: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
  matrix: "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
  insideOut: "/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg",
  toyStory: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
  joker: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  lifeboat: "/2QXpzBMJJtmH7JvVf0ZzENvgc1o.jpg",
  steps39: "/oC81jK6aAug4MA0xzYVngHmjsZS.jpg",
} as const;

export type Film = keyof typeof POSTERS;

export const BACKDROPS = {
  interstellar: "/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
} as const;
