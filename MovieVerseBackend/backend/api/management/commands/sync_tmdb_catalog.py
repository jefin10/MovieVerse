import os
import time
from datetime import datetime

import requests
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction, OperationalError, close_old_connections

from api.models import Country, Genre, Language, Movie

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original"
ALLOWED_LANGUAGE_CODES = {"en", "hi", "ml", "ta", "te"}


class TMDBClient:
    def __init__(self, bearer_token=None, api_key=None, timeout=30, sleep_seconds=0.2):
        self.timeout = timeout
        self.sleep_seconds = sleep_seconds
        self.session = requests.Session()
        self.api_key = api_key
        if bearer_token:
            self.session.headers.update({"Authorization": f"Bearer {bearer_token}"})

    def get(self, path, params=None):
        params = params or {}
        if self.api_key and "api_key" not in params and "Authorization" not in self.session.headers:
            params["api_key"] = self.api_key

        url = f"{TMDB_BASE_URL}{path}"
        last_error = None

        for attempt in range(5):
            try:
                response = self.session.get(url, params=params, timeout=self.timeout)
                if response.status_code in (429, 500, 502, 503, 504):
                    wait = min(10, (attempt + 1) * 1.5)
                    time.sleep(wait)
                    continue
                response.raise_for_status()
                if self.sleep_seconds:
                    time.sleep(self.sleep_seconds)
                return response.json()
            except requests.RequestException as exc:
                last_error = exc
                time.sleep(min(10, (attempt + 1) * 1.5))

        raise CommandError(f"TMDB request failed for {path}: {last_error}")


class Command(BaseCommand):
    help = "Sync movies and metadata from TMDB into local database"

    @staticmethod
    def _fit(value, limit):
        text = "" if value is None else str(value)
        return text[:limit]

    def add_arguments(self, parser):
        parser.add_argument("--start-year", type=int, default=1950)
        parser.add_argument("--end-year", type=int, default=datetime.utcnow().year)
        parser.add_argument("--max-pages-per-year", type=int, default=500)
        parser.add_argument("--max-movies", type=int, default=0)
        parser.add_argument("--skip-details", action="store_true")
        parser.add_argument("--sleep", type=float, default=0.2)
        parser.add_argument("--db-retries", type=int, default=3)

    def handle(self, *args, **options):
        bearer = os.getenv("TMDB_BEARER_TOKEN") or os.getenv("TMDB_ACCESS")
        api_key = os.getenv("TMDB_API_KEY") or os.getenv("TMDB_KEY")

        if not bearer and not api_key:
            raise CommandError("Set TMDB_BEARER_TOKEN or TMDB_API_KEY in environment before running sync")

        client = TMDBClient(bearer_token=bearer, api_key=api_key, sleep_seconds=options["sleep"])

        self.stdout.write(self.style.NOTICE("Syncing TMDB reference data (genres, languages, countries)..."))
        self.sync_genres(client)
        self.sync_languages(client)
        self.sync_countries(client)

        total_synced = 0
        max_movies = options["max_movies"]
        skip_details = options["skip_details"]
        db_retries = max(1, options["db_retries"])

        for year in range(options["start_year"], options["end_year"] + 1):
            pages = self.discover_pages_for_year(client, year, options["max_pages_per_year"])
            self.stdout.write(self.style.NOTICE(f"Year {year}: {pages} pages"))

            for page in range(1, pages + 1):
                discover = client.get(
                    "/discover/movie",
                    params={
                        "language": "en-US",
                        "include_adult": "false",
                        "include_video": "false",
                        "sort_by": "primary_release_date.asc",
                        "primary_release_year": year,
                        "page": page,
                    },
                )

                for item in discover.get("results", []):
                    original_language = (item.get("original_language") or "").strip().lower()
                    if original_language not in ALLOWED_LANGUAGE_CODES:
                        continue

                    completed = False
                    for retry in range(db_retries):
                        try:
                            if total_synced and total_synced % 200 == 0:
                                close_old_connections()

                            movie = self.upsert_movie_from_summary(item)
                            if not skip_details:
                                details = client.get(
                                    f"/movie/{item['id']}",
                                    params={"append_to_response": "credits,release_dates,videos"},
                                )

                                details_original_language = (details.get("original_language") or "").strip().lower()
                                if details_original_language not in ALLOWED_LANGUAGE_CODES:
                                    completed = True
                                    break

                                self.apply_movie_details(movie, details)

                            completed = True
                            break
                        except OperationalError as db_error:
                            close_old_connections()
                            wait = min(10, 2 * (retry + 1))
                            self.stdout.write(self.style.WARNING(
                                f"DB connection issue for TMDB id {item.get('id')} (retry {retry + 1}/{db_retries}): {db_error}. Waiting {wait}s..."
                            ))
                            time.sleep(wait)

                    if not completed:
                        self.stdout.write(self.style.WARNING(
                            f"Skipping TMDB id {item.get('id')} after {db_retries} DB retries"
                        ))
                        continue

                    total_synced += 1
                    if total_synced % 100 == 0:
                        self.stdout.write(self.style.SUCCESS(f"Synced {total_synced} movies"))

                    if max_movies and total_synced >= max_movies:
                        self.stdout.write(self.style.SUCCESS(f"Reached max movie limit: {max_movies}"))
                        self.stdout.write(self.style.SUCCESS("TMDB sync completed"))
                        return

        self.stdout.write(self.style.SUCCESS(f"TMDB sync completed. Total movies processed: {total_synced}"))

    def discover_pages_for_year(self, client, year, max_pages):
        data = client.get(
            "/discover/movie",
            params={
                "language": "en-US",
                "include_adult": "false",
                "include_video": "false",
                "sort_by": "primary_release_date.asc",
                "primary_release_year": year,
                "page": 1,
            },
        )
        return min(max_pages, data.get("total_pages", 1))

    def sync_genres(self, client):
        payload = client.get("/genre/movie/list", params={"language": "en-US"})
        for genre in payload.get("genres", []):
            Genre.objects.update_or_create(id=genre["id"], defaults={"name": genre.get("name", "")})

    def sync_languages(self, client):
        payload = client.get("/configuration/languages")
        for lang in payload:
            iso = (lang.get("iso_639_1") or "").strip()
            if not iso:
                continue
            Language.objects.update_or_create(
                iso_639_1=iso,
                defaults={
                    "english_name": lang.get("english_name", "") or "",
                    "name": lang.get("name", "") or "",
                },
            )

    def sync_countries(self, client):
        payload = client.get("/configuration/countries")
        for country in payload:
            iso = (country.get("iso_3166_1") or "").strip()
            if not iso:
                continue
            Country.objects.update_or_create(
                iso_3166_1=iso,
                defaults={"name": country.get("english_name", "") or country.get("native_name", "") or iso},
            )

    @transaction.atomic
    def upsert_movie_from_summary(self, item):
        poster_path = item.get("poster_path")
        backdrop_path = item.get("backdrop_path")

        defaults = {
            "title": self._fit(item.get("title") or item.get("name") or "", 255),
            "original_title": self._fit(item.get("original_title") or item.get("title") or "", 255),
            "description": item.get("overview") or "",
            "poster_url": f"{TMDB_IMAGE_BASE}{poster_path}" if poster_path else "",
            "backdrop_url": f"{TMDB_IMAGE_BASE}{backdrop_path}" if backdrop_path else "",
            "release_date": item.get("release_date") or None,
            "adult": bool(item.get("adult", False)),
            "popularity": float(item.get("popularity") or 0),
            "vote_count": int(item.get("vote_count") or 0),
            "tmdb_vote_average": float(item.get("vote_average") or 0),
        }

        movie, _ = Movie.objects.update_or_create(tmdb_id=item["id"], defaults=defaults)

        genre_ids = item.get("genre_ids", [])
        if genre_ids:
            genres = Genre.objects.filter(id__in=genre_ids)
            movie.genres.set(genres)

        original_lang = (item.get("original_language") or "").strip()
        if original_lang:
            lang_obj = Language.objects.filter(iso_639_1=original_lang).first()
            movie.original_language = lang_obj
            movie.save(update_fields=["original_language"])

        return movie

    @transaction.atomic
    def apply_movie_details(self, movie, details):
        production_country_codes = [c.get("iso_3166_1") for c in details.get("production_countries", []) if c.get("iso_3166_1")]
        origin_country_codes = details.get("origin_country", []) or []
        spoken_language_codes = [l.get("iso_639_1") for l in details.get("spoken_languages", []) if l.get("iso_639_1")]

        if production_country_codes:
            movie.production_countries.set(Country.objects.filter(iso_3166_1__in=production_country_codes))
        if origin_country_codes:
            movie.origin_countries.set(Country.objects.filter(iso_3166_1__in=origin_country_codes))
        if spoken_language_codes:
            movie.spoken_languages.set(Language.objects.filter(iso_639_1__in=spoken_language_codes))

        crew = details.get("credits", {}).get("crew", [])
        cast = details.get("credits", {}).get("cast", [])

        director_name = ""
        for person in crew:
            if person.get("job") == "Director":
                director_name = self._fit(person.get("name") or "", 255)
                break

        star1 = self._fit(cast[0].get("name", ""), 255) if len(cast) > 0 else ""
        star2 = self._fit(cast[1].get("name", ""), 255) if len(cast) > 1 else ""

        poster_path = details.get("poster_path")
        backdrop_path = details.get("backdrop_path")

        movie.title = self._fit(details.get("title") or movie.title, 255)
        movie.original_title = self._fit(details.get("original_title") or movie.original_title, 255)
        movie.description = details.get("overview") or movie.description
        movie.release_date = details.get("release_date") or movie.release_date
        movie.poster_url = f"{TMDB_IMAGE_BASE}{poster_path}" if poster_path else movie.poster_url
        movie.backdrop_url = f"{TMDB_IMAGE_BASE}{backdrop_path}" if backdrop_path else movie.backdrop_url
        movie.popularity = float(details.get("popularity") or movie.popularity or 0)
        movie.vote_count = int(details.get("vote_count") or movie.vote_count or 0)
        movie.tmdb_vote_average = float(details.get("vote_average") or movie.tmdb_vote_average or 0)
        movie.runtime = details.get("runtime")
        movie.status = self._fit(details.get("status") or "", 100)
        movie.tagline = details.get("tagline") or ""
        movie.homepage = details.get("homepage") or ""
        movie.imdb_id = self._fit(details.get("imdb_id") or "", 30)
        trailer = self.pick_best_trailer(details.get("videos", {}).get("results", []))
        movie.trailer_key = self._fit(trailer.get("key", ""), 100)
        movie.trailer_name = self._fit(trailer.get("name", ""), 255)
        movie.trailer_url = f"https://www.youtube.com/watch?v={trailer['key']}" if trailer.get("key") else ""
        movie.budget = int(details.get("budget") or 0)
        movie.revenue = int(details.get("revenue") or 0)
        movie.adult = bool(details.get("adult", movie.adult))
        movie.director = director_name
        movie.star1 = star1
        movie.star2 = star2
        movie.tmdb_payload = details

        original_lang = (details.get("original_language") or "").strip()
        if original_lang:
            movie.original_language = Language.objects.filter(iso_639_1=original_lang).first()

        genre_ids = [g.get("id") for g in details.get("genres", []) if g.get("id") is not None]
        if genre_ids:
            movie.genres.set(Genre.objects.filter(id__in=genre_ids))

        movie.save()

    def pick_best_trailer(self, videos):
        youtube = [
            v for v in videos
            if (v.get("site") or "").lower() == "youtube" and (v.get("type") or "") in {"Trailer", "Teaser"}
        ]
        if not youtube:
            return {}

        official = [v for v in youtube if bool(v.get("official"))]
        trailer = [v for v in official if v.get("type") == "Trailer"]
        teaser = [v for v in official if v.get("type") == "Teaser"]

        if trailer:
            return trailer[0]
        if teaser:
            return teaser[0]

        trailer = [v for v in youtube if v.get("type") == "Trailer"]
        if trailer:
            return trailer[0]

        return youtube[0]
