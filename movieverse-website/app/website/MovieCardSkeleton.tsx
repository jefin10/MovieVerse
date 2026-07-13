// A skeleton placeholder that mirrors <MovieCard/> so it slots into the same
// grid/track and shows a shimmer while the catalog loads.
export default function MovieCardSkeleton() {
  return (
    <article className="web-movie-card" aria-hidden>
      <div className="web-movie-card-media web-skeleton-shimmer" />
    </article>
  );
}
