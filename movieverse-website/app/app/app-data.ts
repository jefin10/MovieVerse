// Real titles from the MovieVerse catalog (MovieVerse-Backend/prisma/data/movies.json).
export const TMDB = "https://image.tmdb.org/t/p";

export type CatalogMovie = {
  title: string;
  poster: string;
  imdb: number;
  genres: string[];
  director: string;
  description: string;
};

export const POSTER_ROWS: { title: string; poster: string }[][] = [
  [
    {
      "title": "Inception",
      "poster": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg"
    },
    {
      "title": "The Godfather",
      "poster": "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg"
    },
    {
      "title": "Toy Story",
      "poster": "/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg"
    },
    {
      "title": "Pulp Fiction",
      "poster": "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg"
    },
    {
      "title": "Whiplash",
      "poster": "/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg"
    },
    {
      "title": "The Matrix",
      "poster": "/icmmSD4vTTDKOq2vvdulafOGw93.jpg"
    },
    {
      "title": "Joker",
      "poster": "/rlay2M5QYvi6igbGcFjq8jxeusY.jpg"
    },
    {
      "title": "The Shining",
      "poster": "/mmd1HnuvAzFc4iuVJcnBrhDNEKr.jpg"
    },
    {
      "title": "Casablanca",
      "poster": "/rrsG3xYrWifoduZtsIZ4ntoDfBY.jpg"
    },
    {
      "title": "Up",
      "poster": "/hGGC9gKo7CFE3fW07RA587e5kol.jpg"
    },
    {
      "title": "Fight Club",
      "poster": "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg"
    },
    {
      "title": "Se7en",
      "poster": "/p1PLSI5Nw2krGxD7X4ulul1tDAk.jpg"
    }
  ],
  [
    {
      "title": "The Dark Knight",
      "poster": "/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg"
    },
    {
      "title": "Interstellar",
      "poster": "/l33oR0mnvf20avWyIMxW02EtQxn.jpg"
    },
    {
      "title": "Blade Runner 2049",
      "poster": "/bMdSmfI0qwpAkvhAL7sqpjmwgf4.jpg"
    },
    {
      "title": "Titanic",
      "poster": "/sCzcYW9h55WcesOqA12cgEr9Exw.jpg"
    },
    {
      "title": "The Grand Budapest Hotel",
      "poster": "/xHDynIimfsgj0ZOs0j5ma8v1vmM.jpg"
    },
    {
      "title": "Get Out",
      "poster": "/o8dPH0ZSIyyViP6rjRX1djwCUwI.jpg"
    },
    {
      "title": "Ex Machina",
      "poster": "/5jbIVp6dwGoVovMSXqJfCOGfryP.jpg"
    },
    {
      "title": "Coco",
      "poster": "/wSJHuSD7ojzoXifWjOAjxV7UpEL.jpg"
    },
    {
      "title": "Goodfellas",
      "poster": "/7TF4p86ZafnxFuNqWdhpHXFO244.jpg"
    },
    {
      "title": "The Truman Show",
      "poster": "/aCHn2TXYJfzPXQKA6r9mKPbMlUB.jpg"
    },
    {
      "title": "Die Hard",
      "poster": "/oIwfoUFfWfESn0Y8u8jv9lc8li1.jpg"
    },
    {
      "title": "Gladiator",
      "poster": "/CHTWwOdfHiFWJEBKShPRsqRYIP.jpg"
    }
  ]
];

export const DECK: CatalogMovie[] = [
  {
    "title": "Toy Story",
    "poster": "/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg",
    "imdb": 8.3,
    "genres": [
      "Animation",
      "Adventure",
      "Comedy"
    ],
    "director": "John Lasseter",
    "description": "Led by Woody, Andy's toys live happily in his room until Andy's birthday brings Buzz Lightyear onto the scene.…"
  },
  {
    "title": "Inception",
    "poster": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    "imdb": 8.8,
    "genres": [
      "Action",
      "Adventure",
      "Sci-Fi"
    ],
    "director": "Christopher Nolan",
    "description": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a…"
  },
  {
    "title": "The Truman Show",
    "poster": "/aCHn2TXYJfzPXQKA6r9mKPbMlUB.jpg",
    "imdb": 8.1,
    "genres": [
      "Comedy",
      "Drama"
    ],
    "director": "Peter Weir",
    "description": "Every second of every day, from the moment he was born, for the last thirty years, Truman Burbank has been the…"
  },
  {
    "title": "The Godfather",
    "poster": "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    "imdb": 9.2,
    "genres": [
      "Crime",
      "Drama"
    ],
    "director": "Francis Ford Coppola",
    "description": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When…"
  },
  {
    "title": "Interstellar",
    "poster": "/l33oR0mnvf20avWyIMxW02EtQxn.jpg",
    "imdb": 8.6,
    "genres": [
      "Adventure",
      "Drama",
      "Sci-Fi"
    ],
    "director": "Christopher Nolan",
    "description": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on…"
  },
  {
    "title": "Whiplash",
    "poster": "/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg",
    "imdb": 8.5,
    "genres": [
      "Drama",
      "Music"
    ],
    "director": "Damien Chazelle",
    "description": "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost,…"
  },
  {
    "title": "Up",
    "poster": "/hGGC9gKo7CFE3fW07RA587e5kol.jpg",
    "imdb": 8.2,
    "genres": [
      "Animation",
      "Adventure",
      "Comedy"
    ],
    "director": "Pete Docter",
    "description": "Carl Fredricksen spent his entire life dreaming of exploring the globe and experiencing life to its fullest. But…"
  },
  {
    "title": "The Dark Knight",
    "poster": "/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg",
    "imdb": 9.0,
    "genres": [
      "Action",
      "Crime",
      "Drama"
    ],
    "director": "Christopher Nolan",
    "description": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent,…"
  }
];

export const MOODS: {
  prompt: string;
  genre: string;
  count: number;
  picks: { title: string; poster: string; imdb: number }[];
}[] = [
  {
    "prompt": "Make me laugh",
    "genre": "Comedy",
    "count": 163,
    "picks": [
      {
        "title": "La vita è bella",
        "poster": "/6aNKD81RHR1DqUUa8kOZ1TBY1Lp.jpg",
        "imdb": 8.6
      },
      {
        "title": "Modern Times",
        "poster": "/kSlO1pHpwQfPQdgVPr7dJiJNtJ8.jpg",
        "imdb": 8.5
      },
      {
        "title": "City Lights",
        "poster": "/Ma7mQsldFCaQpsZbm8zolgLfmV.jpg",
        "imdb": 8.5
      },
      {
        "title": "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
        "poster": "/sTp8K0SfcC2RQef1Tu160z3niHO.jpg",
        "imdb": 8.4
      },
      {
        "title": "The Great Dictator",
        "poster": "/c8Pi8F1FzpNebtgXcSjC9nWCdSW.jpg",
        "imdb": 8.4
      },
      {
        "title": "Snatch",
        "poster": "/32V4uHVRU2fbDsQl1dsYsZm3uba.jpg",
        "imdb": 8.3
      }
    ]
  },
  {
    "prompt": "I want to be scared",
    "genre": "Horror",
    "count": 14,
    "picks": [
      {
        "title": "The Shining",
        "poster": "/mmd1HnuvAzFc4iuVJcnBrhDNEKr.jpg",
        "imdb": 8.4
      },
      {
        "title": "The Thing",
        "poster": "/r9leYNa8nTRCceZrZhP1DXkgKVb.jpg",
        "imdb": 8.1
      },
      {
        "title": "What Ever Happened to Baby Jane?",
        "poster": "/sCdpJ3iC0xknqRaBKNGsoPLk4YD.jpg",
        "imdb": 8.1
      },
      {
        "title": "Das Cabinet des Dr. Caligari",
        "poster": "/A291ofGZZMc1LdiIeOMDIWrU65g.jpg",
        "imdb": 8.1
      },
      {
        "title": "Les diaboliques",
        "poster": "/oMpX8thZFDVZNS4j240HYSMMvyg.jpg",
        "imdb": 8.0
      },
      {
        "title": "Shaun of the Dead",
        "poster": "/wb34q3VgzHgL8frVMywrN3wXmqx.jpg",
        "imdb": 7.9
      }
    ]
  },
  {
    "prompt": "I want a love story",
    "genre": "Romance",
    "count": 85,
    "picks": [
      {
        "title": "La vita è bella",
        "poster": "/6aNKD81RHR1DqUUa8kOZ1TBY1Lp.jpg",
        "imdb": 8.6
      },
      {
        "title": "Nuovo Cinema Paradiso",
        "poster": "/zoVeIgKzGJzpdG6Gwnr7iOYfIMU.jpg",
        "imdb": 8.5
      },
      {
        "title": "Casablanca",
        "poster": "/rrsG3xYrWifoduZtsIZ4ntoDfBY.jpg",
        "imdb": 8.5
      },
      {
        "title": "City Lights",
        "poster": "/Ma7mQsldFCaQpsZbm8zolgLfmV.jpg",
        "imdb": 8.5
      },
      {
        "title": "Good Will Hunting",
        "poster": "/oLsts7ct0NVkdYpx5rZg10MG6zh.jpg",
        "imdb": 8.3
      },
      {
        "title": "Singin' in the Rain",
        "poster": "/6qOyw4yfzbzTp5YsCX26C28Do0S.jpg",
        "imdb": 8.3
      }
    ]
  },
  {
    "prompt": "I want to see aliens and robots",
    "genre": "Sci-Fi",
    "count": 42,
    "picks": [
      {
        "title": "Inception",
        "poster": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "imdb": 8.8
      },
      {
        "title": "The Matrix",
        "poster": "/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
        "imdb": 8.7
      },
      {
        "title": "Interstellar",
        "poster": "/l33oR0mnvf20avWyIMxW02EtQxn.jpg",
        "imdb": 8.6
      },
      {
        "title": "The Prestige",
        "poster": "/yCnJT53HMXAK87xzPAdjdYhZ3JE.jpg",
        "imdb": 8.5
      },
      {
        "title": "Terminator 2: Judgment Day",
        "poster": "/8MksSPtPvqcSDruLdpibPmTP7LY.jpg",
        "imdb": 8.5
      },
      {
        "title": "Avengers: Infinity War",
        "poster": "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
        "imdb": 8.4
      }
    ]
  },
  {
    "prompt": "I want an adrenaline rush",
    "genre": "Action",
    "count": 139,
    "picks": [
      {
        "title": "The Dark Knight",
        "poster": "/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg",
        "imdb": 9.0
      },
      {
        "title": "The Lord of the Rings: The Return of the King",
        "poster": "/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
        "imdb": 8.9
      },
      {
        "title": "Inception",
        "poster": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "imdb": 8.8
      },
      {
        "title": "The Lord of the Rings: The Fellowship of the Ring",
        "poster": "/x2RS3uTcsJJ9IfjNPcgDmukoEcQ.jpg",
        "imdb": 8.8
      },
      {
        "title": "The Lord of the Rings: The Two Towers",
        "poster": "/jfEOzpsjc6JDlKhUHb4toWQPt.jpg",
        "imdb": 8.7
      },
      {
        "title": "The Matrix",
        "poster": "/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
        "imdb": 8.7
      }
    ]
  },
  {
    "prompt": "I feel emotional",
    "genre": "Drama",
    "count": 472,
    "picks": [
      {
        "title": "The Shawshank Redemption",
        "poster": "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
        "imdb": 9.3
      },
      {
        "title": "The Godfather",
        "poster": "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
        "imdb": 9.2
      },
      {
        "title": "The Dark Knight",
        "poster": "/oOv2oUXcAaNXakRqUPxYq5lJURz.jpg",
        "imdb": 9.0
      },
      {
        "title": "The Godfather: Part II",
        "poster": "/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        "imdb": 9.0
      },
      {
        "title": "12 Angry Men",
        "poster": "/bxgTSUenZDHNFerQ1whRKplrMKF.jpg",
        "imdb": 9.0
      },
      {
        "title": "The Lord of the Rings: The Return of the King",
        "poster": "/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
        "imdb": 8.9
      }
    ]
  }
];
