import MovieCard from "./MovieCard";
import type { Movie } from "@/types/api";

interface MovieCardWrapperProps {
  movie: Movie;
}

export default function MovieCardWrapper({ movie }: MovieCardWrapperProps) {
  return <MovieCard movie={movie} />;
}
