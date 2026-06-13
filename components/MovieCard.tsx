import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types/api";
import { getPosterUrl } from "@/lib/api";

interface MovieCardProps {
  movie: Movie;
  posterUrl?: string;
}

export default function MovieCard({ movie, posterUrl }: MovieCardProps) {
  if (!movie.slug) {
    return null;
  }

  const finalPosterUrl = getPosterUrl(movie);

  return (
    <Link href={`/phim/${encodeURIComponent(movie.slug)}`} className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-900 shadow-lg">
        <Image
          src={finalPosterUrl}
          alt={movie.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <p className="text-xs text-zinc-300 line-clamp-2">{movie.name}</p>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-medium text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
          {movie.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500">{movie.year}</span>
          {movie.country && movie.country.length > 0 && (
            <>
              <span className="text-zinc-700">•</span>
              <span className="text-xs text-zinc-500">{movie.country[0].name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
