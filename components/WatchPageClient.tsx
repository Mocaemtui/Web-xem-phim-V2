"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import EpisodeSelector from "@/components/EpisodeSelector";
import type { MovieDetail } from "@/types/api";
import { saveWatchHistory, getWatchHistory } from "@/lib/watchHistory";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
      <div className="text-zinc-500 animate-pulse">Đang khởi tạo trình phát video...</div>
    </div>
  )
});

interface WatchPageClientProps {
  movie: MovieDetail;
  posterUrl: string;
}

export default function WatchPageClient({ movie, posterUrl }: WatchPageClientProps) {
  const [episodes, setEpisodes] = useState(movie.episodes || []);
  
  const [currentServerIndex, setCurrentServerIndex] = useState(() => {
    if (typeof window !== "undefined" && movie.episodes) {
      const preferred = localStorage.getItem("preferred_server_name");
      if (preferred) {
        const idx = movie.episodes.findIndex(e => e.server_name === preferred);
        if (idx !== -1) return idx;
      }
    }
    return 0;
  });
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isRestored, setIsRestored] = useState(false);

  // Reset trạng thái khi chuyển phim mới
  useEffect(() => {
    setIsRestored(false);
    setCurrentEpisodeIndex(0);
    setEpisodes(movie.episodes || []);
    if (typeof window !== "undefined" && movie.episodes) {
      const preferred = localStorage.getItem("preferred_server_name");
      if (preferred) {
        const idx = (movie.episodes || []).findIndex(e => e.server_name === preferred);
        if (idx !== -1) {
          setCurrentServerIndex(idx);
          return;
        }
      }
    }
    setCurrentServerIndex(0);
  }, [movie.slug, movie.episodes]);

  // Client-side fetch for NguonC to bypass Vercel DataCenter Cloudflare blocks
  useEffect(() => {
    const fetchNguonC = async () => {
      try {
        let res = await fetch(`https://phim.nguonc.com/api/film/${movie.slug}`);
        let data = res.ok ? await res.json() : null;

        // --- SMART CROSS-API MATCHING (FALLBACK) ---
        // Nếu NguonC không có phim theo slug này, thử tìm theo tên tiếng Anh (origin_name)
        if (!data?.movie?.episodes) {
          const originName = movie.origin_name || movie.name;
          if (originName) {
            const searchRes = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(originName)}`);
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              const match = searchData?.items?.find((m: any) => 
                (m.original_name?.toLowerCase() === originName.toLowerCase() || m.name?.toLowerCase() === originName.toLowerCase())
              );
              if (match && match.slug !== movie.slug) {
                res = await fetch(`https://phim.nguonc.com/api/film/${match.slug}`);
                data = res.ok ? await res.json() : null;
              }
            }
          }
        }
        // -------------------------------------------
        
        if (data?.movie?.episodes) {
          const nguonCEps = data.movie.episodes.map((epServer: any) => ({
            server_name: `NguonC - ${epServer.server_name || "Vietsub"}`,
            server_data: epServer.items?.map((ep: any) => ({
              name: ep.name,
              slug: ep.slug,
              filename: ep.name,
              link: "",
              link_embed: ep.embed,
              link_m3u8: "", // NguonC blocks m3u8 CORS, force iframe embed fallback
            })) || []
          }));
          
          setEpisodes(prev => {
            if (prev.some(e => e.server_name.startsWith('NguonC'))) return prev;
            return [...prev, ...nguonCEps];
          });
        }
      } catch (error) {
        console.error("Lỗi tải NguonC (Client):", error);
      }
    };

    // Only fetch if NguonC hasn't already been provided by SSR
    if (!episodes.some(e => e.server_name.startsWith('NguonC'))) {
      fetchNguonC();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.slug]);

  useEffect(() => {
    if (!isRestored) {
      // Check query parameters first (e.g. ?tap=3)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tapParam = params.get("tap");
        if (tapParam) {
          const tapIdx = parseInt(tapParam, 10) - 1;
          if (episodes?.[0]?.server_data?.[tapIdx]) {
            setCurrentServerIndex(0);
            setCurrentEpisodeIndex(tapIdx);
            setIsRestored(true);
            return;
          }
        }
      }

      const history = getWatchHistory();
      const item = history.find(i => i.slug === movie.slug);
      if (item) {
        if (episodes?.[item.currentServerIndex]?.server_data?.[item.currentEpisodeIndex]) {
          setCurrentServerIndex(item.currentServerIndex);
          setCurrentEpisodeIndex(item.currentEpisodeIndex);
        }
      }
      setIsRestored(true);
    }
  }, [movie, isRestored, episodes]);

  const currentServer = episodes[currentServerIndex];
  const serverData = currentServer?.server_data || [];
  const currentEpisode = serverData[currentEpisodeIndex];

  // Save watch history whenever episode or server changes
  useEffect(() => {
    if (isRestored && currentEpisode) {
      saveWatchHistory(
        movie,
        currentEpisode.name || `Tập ${currentEpisodeIndex + 1}`,
        currentServerIndex,
        currentEpisodeIndex
      );
    }
  }, [movie, currentEpisode, currentServerIndex, currentEpisodeIndex, isRestored]);

  const handleEpisodeSelect = (episodeIndex: number) => {
    setCurrentEpisodeIndex(episodeIndex);
  };

  const handleServerChange = (serverIndex: number) => {
    setCurrentServerIndex(serverIndex);
    setCurrentEpisodeIndex(0);
    if (typeof window !== "undefined") {
      const preferred = episodes[serverIndex]?.server_name;
      if (preferred) {
        localStorage.setItem("preferred_server_name", preferred);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Video Player */}
        <div className="mb-8 relative z-10 w-full aspect-video">
          {currentEpisode ? (
            <VideoPlayer
              key={`${currentServerIndex}-${currentEpisodeIndex}`}
              poster={posterUrl}
              videoUrl={currentEpisode.link_m3u8}
              embedUrl={currentEpisode.link_embed}
              hasNextEpisode={currentEpisodeIndex < serverData.length - 1}
              nextVideoUrl={serverData[currentEpisodeIndex + 1]?.link_m3u8}
              onAutoNext={() => {
                if (currentEpisodeIndex < serverData.length - 1) {
                  setCurrentEpisodeIndex((prev) => prev + 1);
                }
              }}
            />
          ) : (
            <div className="relative w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-zinc-400 text-lg mb-2">Không tìm thấy link phim</p>
                <p className="text-zinc-500 text-sm">Phim này hiện không có sẵn để xem</p>
              </div>
            </div>
          )}
        </div>

        {/* Episode Selector */}
        <div className="relative z-30">
          {episodes.length > 0 && serverData.length > 0 ? (
            <EpisodeSelector
              episodes={episodes}
              currentServerIndex={currentServerIndex}
              currentEpisodeIndex={currentEpisodeIndex}
              onSelectEpisode={handleEpisodeSelect}
              onSelectServer={handleServerChange}
            />
          ) : (
            <div className="mb-8 p-4 bg-zinc-900 rounded-lg">
              <p className="text-zinc-400 text-sm">Không có tập phim nào</p>
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {movie.name} - {currentServer?.server_name} - {currentEpisode?.name.toLowerCase().includes("tập") ? currentEpisode.name : `Tập ${currentEpisode?.name || currentEpisodeIndex + 1}`}
          </h1>
          {movie.origin_name && (
            <p className="text-lg text-zinc-400 mb-4">{movie.origin_name}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm mb-4">
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
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.category.map((cat) => (
                <span key={cat.id} className="text-sm text-blue-400">
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Countries */}
          {movie.country && movie.country.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.country.map((country) => (
                <span key={country.id} className="text-sm text-zinc-400">
                  {country.name}
                </span>
              ))}
            </div>
          )}

          {/* Actors */}
          {movie.actor && movie.actor.length > 0 && (
            <div className="mb-4">
              <span className="text-sm text-zinc-500">Diễn viên: </span>
              <span className="text-sm text-zinc-400">
                {movie.actor.join(", ")}
              </span>
            </div>
          )}

          {/* Description */}
          {movie.content && (
            <div 
              className="text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: movie.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
