import MovieCard from "./MovieCard";
import { getMoviePosterUrl } from "@/lib/api";
import type { Movie } from "@/types/api";

interface MovieCardWrapperProps {
  movie: Movie;
}

export default async function MovieCardWrapper({ movie }: MovieCardWrapperProps) {
  const tmdbPosterUrl = await getMoviePosterUrl(movie.slug);

  return <MovieCard movie={movie} posterUrl={tmdbPosterUrl || undefined} />;
}
