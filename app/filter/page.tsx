"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FilterPanel from "@/components/FilterPanel";
import MovieCard from "@/components/MovieCard";
import SectionTitle from "@/components/SectionTitle";
import Pagination from "@/components/Pagination";
import { getTheLoaiDetails, getQuocGiaDetails, getDanhSach, getTheLoai, getQuocGia, getMoviePosterUrl } from "@/lib/api";
import type { MovieListResponse, Genre, Country, Movie } from "@/types/api";

const DANH_MUC_LIST = [
  { name: "Phim mới", slug: "phim-moi" },
  { name: "Phim bộ", slug: "phim-bo" },
  { name: "Phim lẻ", slug: "phim-le" },
  { name: "Shows", slug: "tv-shows" },
  { name: "Hoạt hình", slug: "hoat-hinh" },
  { name: "Phim vietsub", slug: "phim-vietsub" },
  { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
  { name: "Phim lồng tiếng", slug: "phim-long-tieng" },
  { name: "Phim bộ đang chiếu", slug: "phim-bo-dang-chieu" },
  { name: "Phim bộ đã hoàn thành", slug: "phim-bo-hoan-thanh" },
  { name: "Phim sắp chiếu", slug: "phim-sap-chieu" },
  { name: "Subteam", slug: "subteam" },
  { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
];

export default function FilterPage() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<MovieListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    theLoai?: string;
    quocGia?: string;
    year?: string;
    danhMuc?: string;
  }>({});
  const [title, setTitle] = useState("Bộ Lọc Phim");
  const [theLoaiList, setTheLoaiList] = useState<Genre[]>([]);
  const [quocGiaList, setQuocGiaList] = useState<Country[]>([]);
  const [posterUrls, setPosterUrls] = useState<Record<string, string>>({});

  const fetchPosterUrls = useCallback(async (movieList: Movie[]) => {
    const urls: Record<string, string> = {};
    const promises = movieList.map(async (movie) => {
      const posterUrl = await getMoviePosterUrl(movie.slug);
      if (posterUrl) {
        urls[movie._id] = posterUrl;
      }
    });
    await Promise.all(promises);
    setPosterUrls(urls);
  }, []);

  const updateTitle = useCallback(() => {
    const parts = [];
    if (filters.danhMuc) {
      const danhMucName = DANH_MUC_LIST.find(d => d.slug === filters.danhMuc)?.name || filters.danhMuc;
      parts.push(danhMucName);
    }
    if (filters.theLoai) {
      const theLoaiName = theLoaiList.find(t => t.slug === filters.theLoai)?.name || filters.theLoai;
      parts.push(theLoaiName);
    }
    if (filters.quocGia) {
      const quocGiaName = quocGiaList.find(c => c.slug === filters.quocGia)?.name || filters.quocGia;
      parts.push(quocGiaName);
    }
    if (filters.year) parts.push(filters.year);

    if (parts.length > 0) {
      setTitle(parts.join(" - "));
    } else {
      setTitle("Bộ Lọc Phim");
    }
  }, [filters, theLoaiList, quocGiaList]);

  const fetchMovies = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      let data: MovieListResponse | null = null;

      // Nếu có danh mục, ưu tiên filter theo danh mục
      if (filters.danhMuc) {
        const response = await getDanhSach(filters.danhMuc, {
          page,
          limit: 30,
          category: filters.theLoai,
          country: filters.quocGia,
          year: filters.year,
        });
        data = response?.data || null;
      }
      // Nếu có thể loại, ưu tiên filter theo thể loại
      else if (filters.theLoai) {
        const response = await getTheLoaiDetails(filters.theLoai, {
          page,
          limit: 30,
          country: filters.quocGia,
          year: filters.year,
        });
        data = response?.data || null;
      }
      // Nếu có quốc gia nhưng không có thể loại
      else if (filters.quocGia) {
        const response = await getQuocGiaDetails(filters.quocGia, {
          page,
          limit: 30,
          category: filters.theLoai,
          year: filters.year,
        });
        data = response?.data || null;
      }
      // Nếu chỉ có năm
      else if (filters.year) {
        const response = await getDanhSach("phim-moi", {
          page,
          limit: 30,
          year: filters.year,
        });
        data = response?.data || null;
      }
      // Mặc định: lấy phim mới
      else {
        const response = await getDanhSach("phim-moi", {
          page,
          limit: 30,
        });
        data = response?.data || null;
      }

      setMovies(data);
      updateTitle();
      
      // Fetch TMDB poster URLs for better quality images
      if (data?.items) {
        fetchPosterUrls(data.items);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, updateTitle, fetchPosterUrls]);

  const fetchFilterData = useCallback(async () => {
    try {
      const [theLoaiData, quocGiaData] = await Promise.all([
        getTheLoai(),
        getQuocGia(),
      ]);

      if (theLoaiData?.data?.items) {
        // Filter out 18+ genres
        const filteredTheLoaiList = theLoaiData.data.items.filter(
          (item) => !item.name.toLowerCase().includes('18+') && !item.name.toLowerCase().includes('18')
        );
        setTheLoaiList(filteredTheLoaiList);
      }
      if (quocGiaData?.data?.items) {
        setQuocGiaList(quocGiaData.data.items);
      }
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  }, []);

  const handleFilterChange = (newFilters: {
    theLoai?: string;
    quocGia?: string;
    year?: string;
    danhMuc?: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMovies(currentPage);
  }, [fetchMovies, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Horizontal Filter */}
      <div className="mb-6">
        <FilterPanel 
          theLoaiList={theLoaiList}
          quocGiaList={quocGiaList}
          onFilterChange={handleFilterChange} 
        />
      </div>

      {/* Main Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title={title} />
          {movies?.params?.pagination && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng: {movies.params.pagination.totalItems} phim
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : movies?.items && movies.items.length > 0 ? (
          <>
            <div className="grid grid-cols-6 gap-4">
              {movies.items.map((movie) => (
                <MovieCard key={movie._id} movie={movie} posterUrl={posterUrls[movie._id]} />
              ))}
            </div>

            {Math.ceil(movies.params.pagination.totalItems / movies.params.pagination.totalItemsPerPage) > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(movies.params.pagination.totalItems / movies.params.pagination.totalItemsPerPage)}
                  baseUrl="/filter"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Không tìm thấy phim nào với bộ lọc đã chọn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
