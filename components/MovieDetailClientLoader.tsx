"use client";

import { useState, useEffect } from "react";
import MovieDetail from "@/components/MovieDetail";
import WatchPageClient from "@/components/WatchPageClient";
import type { MovieDetail as MovieDetailType } from "@/types/api";

interface Props {
  slug: string;
  type: "phim" | "xem-phim";
}

export default function MovieDetailClientLoader({ slug, type }: Props) {
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNguonC = async () => {
      try {
        const res = await fetch(`https://phim.nguonc.com/api/film/${slug}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        if (!data || !data.movie) {
          setError(true);
          setLoading(false);
          return;
        }

        const m = data.movie;
        const mappedMovie: MovieDetailType = {
          _id: m.id || m.slug,
          name: m.name,
          slug: m.slug,
          origin_name: m.original_name,
          poster_url: m.poster_url,
          thumb_url: m.thumb_url,
          year: m.year || (m.category && m.category['3'] ? m.category['3'].list[0]?.name : new Date().getFullYear()),
          quality: m.quality,
          lang: m.language,
          time: m.duration,
          episode_current: m.current_episode,
          episode_total: m.total_episodes?.toString(),
          content: m.description,
          episodes: m.episodes?.map((epServer: any) => ({
            server_name: `MOCA MAX - ${epServer.server_name || "NguonC"}`,
            server_data: epServer.items?.map((ep: any) => ({
              name: ep.name,
              slug: ep.slug,
              filename: ep.name,
              link: "",
              link_embed: ep.embed,
              link_m3u8: "",
            })) || []
          })) || []
        };

        setMovie(mappedMovie);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNguonC();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-zinc-400">Đang quét tìm dữ liệu dự phòng từ MOCA MAX...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-zinc-400 mb-8">Rất tiếc, bộ phim này hiện không tồn tại hoặc đã bị xóa khỏi mọi nguồn cung cấp.</p>
        <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Quay lại Trang Chủ
        </a>
      </div>
    );
  }

  if (type === "phim") {
    // TMDB images missing fallback gracefully
    return <MovieDetail movie={movie} images={{ images: [] }} peoples={{ peoples: [] }} />;
  }

  return <WatchPageClient movie={movie} posterUrl={movie.poster_url} />;
}
