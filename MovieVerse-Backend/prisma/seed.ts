import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 878, name: 'Science Fiction' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
];

const MOVIES = [
  {
    title: 'Inception', director: 'Christopher Nolan', star1: 'Leonardo DiCaprio', star2: 'Joseph Gordon-Levitt',
    description: 'A thief who steals corporate secrets through dream-sharing technology.',
    posterUrl: '/inception.jpg', imdbRating: 8.8, ourRating: 8.5, tmdbVoteAverage: 8.4, popularity: 120,
    voteCount: 34000, trailerKey: 'YoHD9XEInc0', trailerUrl: 'https://youtu.be/YoHD9XEInc0',
    genres: [28, 878], releaseDate: '2010-07-16',
  },
  {
    title: 'The Dark Knight', director: 'Christopher Nolan', star1: 'Christian Bale', star2: 'Heath Ledger',
    description: 'Batman faces the Joker, a criminal mastermind bent on chaos.',
    posterUrl: '/dark-knight.jpg', imdbRating: 9.0, ourRating: 9.0, tmdbVoteAverage: 8.5, popularity: 150,
    voteCount: 31000, trailerKey: 'EXeTwQWrcwY', trailerUrl: 'https://youtu.be/EXeTwQWrcwY',
    genres: [28, 18], releaseDate: '2008-07-18',
  },
  {
    title: 'Interstellar', director: 'Christopher Nolan', star1: 'Matthew McConaughey', star2: 'Anne Hathaway',
    description: 'Explorers travel through a wormhole in space to ensure humanity survives.',
    posterUrl: '/interstellar.jpg', imdbRating: 8.6, ourRating: 8.7, tmdbVoteAverage: 8.4, popularity: 140,
    voteCount: 32000, trailerKey: 'zSWdZVtXT7E', trailerUrl: 'https://youtu.be/zSWdZVtXT7E',
    genres: [18, 878], releaseDate: '2014-11-07',
  },
  {
    title: 'The Hangover', director: 'Todd Phillips', star1: 'Bradley Cooper', star2: 'Ed Helms',
    description: 'Three friends wake up from a bachelor party with no memory of the night.',
    posterUrl: '/hangover.jpg', imdbRating: 7.7, ourRating: 7.5, tmdbVoteAverage: 7.3, popularity: 90,
    voteCount: 18000, trailerKey: 'tcdUhdOlz9M', trailerUrl: 'https://youtu.be/tcdUhdOlz9M',
    genres: [35], releaseDate: '2009-06-05',
  },
  {
    title: 'The Notebook', director: 'Nick Cassavetes', star1: 'Ryan Gosling', star2: 'Rachel McAdams',
    description: 'A poor young man and a rich young woman fall in love in the 1940s.',
    posterUrl: '/notebook.jpg', imdbRating: 7.8, ourRating: 7.9, tmdbVoteAverage: 7.9, popularity: 80,
    voteCount: 15000, trailerKey: 'BsWf4o4z3iE', trailerUrl: 'https://youtu.be/BsWf4o4z3iE',
    genres: [10749, 18], releaseDate: '2004-06-25',
  },
];

async function main() {
  await prisma.genre.createMany({ data: GENRES, skipDuplicates: true });

  for (const m of MOVIES) {
    const { genres, releaseDate, ...rest } = m;
    const existing = await prisma.movie.findFirst({ where: { title: m.title } });
    if (existing) continue;
    await prisma.movie.create({
      data: {
        ...rest,
        releaseDate: new Date(releaseDate),
        genres: { connect: genres.map((id) => ({ id })) },
      },
    });
  }

  const count = await prisma.movie.count();
  console.log(`seed complete: ${count} movies, ${GENRES.length} genres`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
