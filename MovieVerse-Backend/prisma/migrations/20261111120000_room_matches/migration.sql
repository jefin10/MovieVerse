-- CreateTable
CREATE TABLE "room_matches" (
    "room_id" INTEGER NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_matches_pkey" PRIMARY KEY ("room_id","movie_id")
);

-- AddForeignKey
ALTER TABLE "room_matches" ADD CONSTRAINT "room_matches_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_matches" ADD CONSTRAINT "room_matches_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
