"use client";

import { useState, useEffect } from "react";
import MovieCardWrapper from "@/components/MovieCardWrapper";
import type { Movie } from "@/types/api";

interface SearchGridProps {
  initialMovies: Movie[];
  keyword: string;
}

export default function SearchGrid({ initialMovies, keyword }: SearchGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [isLoadingNguonC, setIsLoadingNguonC] = useState(true);

  useEffect(() => {
    const fetchNguonC = async () => {
      try {
        const res = await fetch(`https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`);
        if (!res.ok) {
          setIsLoadingNguonC(false);
          return;
        }
        const data = await res.json();
        
        if (data && data.items && Array.isArray(data.items)) {
          // Lọc bỏ những phim đã có từ Ophim/PhimAPI (trùng slug)
          const existingSlugs = new Set(initialMovies.map(m => m.slug));
          const newMovies: Movie[] = [];
          
          for (const item of data.items) {
            if (!existingSlugs.has(item.slug)) {
              // Map NguonC search item format to our standard Movie format
              newMovies.push({
                _id: item.id || Math.random().toString(),
                name: item.name,
                slug: item.slug,
                origin_name: item.original_name || item.name,
                poster_url: item.thumb_url || item.poster_url,
                thumb_url: item.thumb_url || item.poster_url,
                year: new Date().getFullYear(), // Mặc định nếu không có
              });
              existingSlugs.add(item.slug);
            }
          }
          
          if (newMovies.length > 0) {
            setMovies(prev => [...prev, ...newMovies]);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy NguonC Search (Client):", error);
      } finally {
        setIsLoadingNguonC(false);
      }
    };

    fetchNguonC();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  if (movies.length === 0 && !isLoadingNguonC) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400 text-lg">
          Không tìm thấy phim nào với từ khóa "{keyword}"
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCardWrapper key={movie._id} movie={movie} />
        ))}
      </div>
      {isLoadingNguonC && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-zinc-500">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Đang quét thêm MOCA MAX...</span>
          </div>
        </div>
      )}
    </div>
  );
}
