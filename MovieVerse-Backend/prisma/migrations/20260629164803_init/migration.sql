-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "date_joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_otps" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "reset_token_hash" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "used_at" TIMESTAMP(3),
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "request_ip" TEXT,

    CONSTRAINT "password_reset_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "iso_639_1" TEXT NOT NULL,
    "english_name" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "languages_pkey" PRIMARY KEY ("iso_639_1")
);

-- CreateTable
CREATE TABLE "countries" (
    "iso_3166_1" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("iso_3166_1")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER,
    "title" TEXT NOT NULL,
    "original_title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "director" TEXT NOT NULL DEFAULT '',
    "star1" TEXT NOT NULL DEFAULT '',
    "star2" TEXT NOT NULL DEFAULT '',
    "poster_url" TEXT NOT NULL DEFAULT '',
    "backdrop_url" TEXT NOT NULL DEFAULT '',
    "release_date" TIMESTAMP(3),
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "tmdb_vote_average" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "runtime" INTEGER,
    "status" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "homepage" TEXT NOT NULL DEFAULT '',
    "imdb_id" TEXT NOT NULL DEFAULT '',
    "trailer_key" TEXT NOT NULL DEFAULT '',
    "trailer_url" TEXT NOT NULL DEFAULT '',
    "trailer_name" TEXT NOT NULL DEFAULT '',
    "budget" BIGINT NOT NULL DEFAULT 0,
    "revenue" BIGINT NOT NULL DEFAULT 0,
    "imdb_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "our_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tmdb_payload" JSONB NOT NULL DEFAULT '{}',
    "original_language_id" TEXT,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "id" SERIAL NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "added_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommended_movies" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "recommended_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommended_movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GenreToMovie" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SpokenLanguages" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_OriginCountries" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductionCountries" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "password_reset_otps_user_id_created_at_idx" ON "password_reset_otps"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "password_reset_otps_expires_at_idx" ON "password_reset_otps"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

-- CreateIndex
CREATE INDEX "movies_popularity_tmdb_vote_average_vote_count_idx" ON "movies"("popularity", "tmdb_vote_average", "vote_count");

-- CreateIndex
CREATE INDEX "watchlist_user_id_movie_id_idx" ON "watchlist"("user_id", "movie_id");

-- CreateIndex
CREATE INDEX "ratings_movie_id_idx" ON "ratings"("movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_user_id_movie_id_key" ON "ratings"("user_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "recommended_movies_user_id_movie_id_key" ON "recommended_movies"("user_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToMovie_AB_unique" ON "_GenreToMovie"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToMovie_B_index" ON "_GenreToMovie"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SpokenLanguages_AB_unique" ON "_SpokenLanguages"("A", "B");

-- CreateIndex
CREATE INDEX "_SpokenLanguages_B_index" ON "_SpokenLanguages"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OriginCountries_AB_unique" ON "_OriginCountries"("A", "B");

-- CreateIndex
CREATE INDEX "_OriginCountries_B_index" ON "_OriginCountries"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductionCountries_AB_unique" ON "_ProductionCountries"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductionCountries_B_index" ON "_ProductionCountries"("B");

-- AddForeignKey
ALTER TABLE "password_reset_otps" ADD CONSTRAINT "password_reset_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_original_language_id_fkey" FOREIGN KEY ("original_language_id") REFERENCES "languages"("iso_639_1") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_movies" ADD CONSTRAINT "recommended_movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommended_movies" ADD CONSTRAINT "recommended_movies_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpokenLanguages" ADD CONSTRAINT "_SpokenLanguages_A_fkey" FOREIGN KEY ("A") REFERENCES "languages"("iso_639_1") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpokenLanguages" ADD CONSTRAINT "_SpokenLanguages_B_fkey" FOREIGN KEY ("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OriginCountries" ADD CONSTRAINT "_OriginCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("iso_3166_1") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OriginCountries" ADD CONSTRAINT "_OriginCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionCountries" ADD CONSTRAINT "_ProductionCountries_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("iso_3166_1") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductionCountries" ADD CONSTRAINT "_ProductionCountries_B_fkey" FOREIGN KEY ("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
