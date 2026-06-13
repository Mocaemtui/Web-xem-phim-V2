"use client";

import { useState, useEffect, useMemo } from "react";
import MovieCardWrapper from "@/components/MovieCardWrapper";
import type { Movie } from "@/types/api";

interface SearchGridProps {
  initialMovies: Movie[];
  keyword: string;
}

export default function SearchGrid({ initialMovies, keyword }: SearchGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [lastKeyword, setLastKeyword] = useState("");

  // No smart default selection needed, always default to "all" as requested by user


  const filteredMovies = useMemo(() => {
    const getSmartKey = (item: Movie) => {
      const originName = item.origin_name || item.name || '';
      const normalizedOriginName = originName.toLowerCase().replace(/\s+/g, ' ').trim();
      return `${normalizedOriginName}-${item.year || 'unknown'}`;
    };

    // 1. Build maps of priority sources (Ophim, PhimAPI)
    const ophimMap = new Map<string, Movie>();
    const phimapiMap = new Map<string, Movie>();

    movies.forEach(movie => {
      const key = getSmartKey(movie);
      const source = (movie as any).source;
      if (source === 'ophim') {
        ophimMap.set(key, movie);
      } else if (source === 'phimapi') {
        phimapiMap.set(key, movie);
      }
    });

    // 2. Filter or Deduplicate based on selectedSource
    if (selectedSource === "all") {
      const itemsMap = new Map<string, Movie>();
      
      // Sort movies: 'phimapi' first, then 'ophim'
      const sortedMovies = [...movies].sort((a: any, b: any) => {
        const priority = { phimapi: 2, ophim: 1 } as any;
        const priorityA = priority[(a as any).source] || 0;
        const priorityB = priority[(b as any).source] || 0;
        return priorityB - priorityA;
      });

      sortedMovies.forEach(movie => {
        const key = getSmartKey(movie);
        if (!itemsMap.has(key)) {
          itemsMap.set(key, movie);
        }
      });

      return Array.from(itemsMap.values());
    } else {
      // Show all movies from that source directly without overriding metadata
      return movies.filter((movie: any) => (movie as any).source === selectedSource);
    }
  }, [movies, selectedSource]);

  const sourceFilters = [
    { id: "all", name: "Tất cả" },
    { id: "ophim", name: "Ophim" },
    { id: "phimapi", name: "PhimAPI" },
  ];

  if (filteredMovies.length === 0) {
    return (
      <div>
        {/* Source Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
          {sourceFilters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSource(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${
                selectedSource === tab.id
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="text-center py-16">
          <p className="text-zinc-400 text-lg">
            Không tìm thấy phim nào từ nguồn này với từ khóa "{keyword}"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Source Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
        {sourceFilters.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSource(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${
              selectedSource === tab.id
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCardWrapper key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
