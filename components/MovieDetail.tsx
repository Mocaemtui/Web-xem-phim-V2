"use client";

import Image from "next/image";
import Link from "next/link";
import type { MovieDetail, MovieImages, MoviePeoples } from "@/types/api";

interface MovieDetailProps {
  movie: MovieDetail;
  images: MovieImages;
  peoples: MoviePeoples;
}

export default function MovieDetail({ movie, images, peoples }: MovieDetailProps) {
  // Calculate ophim poster URL
  const ophimPosterUrl = movie.poster_url.startsWith('http') ? movie.poster_url : `https://img.ophim.live/uploads/movies/${movie.poster_url}`;
  const ophimThumbUrl = movie.thumb_url.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;

  // Use ophim images
  const backdrop = ophimPosterUrl;
  const poster = ophimThumbUrl;



  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Backdrop */}
      <div className="relative w-full aspect-video">
        <Image
          key={backdrop}
          src={backdrop}
          alt={movie.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
              <Image
                key={poster}
                src={poster}
                alt={movie.name}
                fill
                className="object-cover"
                sizes="300px"
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {/* Mobile Poster */}
            <div className="md:hidden">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl max-w-[200px]">
                <Image
                  key={poster}
                  src={poster}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {movie.name}
              </h1>
              {movie.origin_name && (
                <p className="text-lg text-zinc-400">{movie.origin_name}</p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">
                {movie.year}
              </span>
              {movie.quality && (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">
                  {movie.quality}
                </span>
              )}
              {movie.lang && (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">
                  {movie.lang}
                </span>
              )}
              {movie.time && (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full">
                  {movie.time}
                </span>
              )}
            </div>

            {/* Categories */}
            {movie.category && movie.category.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.category.map((cat) => (
                  <span
                    key={cat.id}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Countries */}
            {movie.country && movie.country.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.country.map((country) => (
                  <span
                    key={country.id}
                    className="text-sm text-zinc-400"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {movie.content && (
              <div 
                className="text-zinc-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: movie.content }}
              />
            )}

            {/* Director */}
            {peoples.peoples && peoples.peoples.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Đạo diễn</h3>
                <div className="flex flex-wrap gap-2">
                  {peoples.peoples
                    .filter(p => p.known_for_department === 'Directing')
                    .map((person, index) => (
                      <span
                        key={index}
                        className="text-sm text-zinc-400"
                      >
                        {person.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Actors */}
            {peoples.peoples && peoples.peoples.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Diễn viên</h3>
                <div className="flex flex-wrap gap-2">
                  {peoples.peoples
                    .filter(p => p.known_for_department === 'Acting')
                    .slice(0, 10)
                    .map((person, index) => (
                      <span
                        key={index}
                        className="text-sm text-zinc-400"
                      >
                        {person.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Watch Buttons */}
            <div className="flex flex-wrap gap-4 mt-2">
              {movie.slug && (
                <Link
                  href={`/xem-phim/${movie.slug}`}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors w-fit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Xem phim
                </Link>
              )}
              {movie.slug && (
                <button
                  onClick={() => {
                    const roomId = Math.random().toString(36).substring(2, 9);
                    sessionStorage.setItem(`host_${roomId}`, 'true');
                    window.location.href = `/watch-together/${movie.slug}/${roomId}`;
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-6 py-3 rounded-lg transition-colors w-fit border border-zinc-700"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Xem chung cùng bạn bè
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
