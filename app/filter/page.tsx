"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterPanel from "@/components/FilterPanel";
import MovieCard from "@/components/MovieCard";
import SectionTitle from "@/components/SectionTitle";
import Pagination from "@/components/Pagination";
import { getDanhSach, getTheLoaiDetails, getQuocGiaDetails, getTheLoai, getQuocGia, getMoviePosterUrl } from "@/lib/api";
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

function FilterContent() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<MovieListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{ theLoai?: string; quocGia?: string; year?: string; danhMuc?: string }>({});
  const [title, setTitle] = useState("Bộ Lọc Phim");
  const [theLoaiList, setTheLoaiList] = useState<Genre[]>([]);
  const [quocGiaList, setQuocGiaList] = useState<Country[]>([]);
  const [posterUrls, setPosterUrls] = useState<Record<string, string>>({});

  const fetchPosterUrls = useCallback(async (movieList: Movie[]) => {
    const urls: Record<string, string> = {};
    await Promise.all(
      movieList.map(async (movie) => {
        const url = await getMoviePosterUrl(movie.slug);
        if (url) urls[movie._id] = url;
      })
    );
    setPosterUrls(urls);
  }, []);

  const updateTitle = useCallback(() => {
    const parts: string[] = [];
    if (filters.danhMuc) {
      const name = DANH_MUC_LIST.find(d => d.slug === filters.danhMuc)?.name || filters.danhMuc;
      parts.push(name);
    }
    if (filters.theLoai) {
      const name = theLoaiList.find(t => t.slug === filters.theLoai)?.name || filters.theLoai;
      parts.push(name);
    }
    if (filters.quocGia) {
      const name = quocGiaList.find(c => c.slug === filters.quocGia)?.name || filters.quocGia;
      parts.push(name);
    }
    if (filters.year) parts.push(filters.year);
    setTitle(parts.length > 0 ? parts.join(" - ") : "Bộ Lọc Phim");
  }, [filters, theLoaiList, quocGiaList]);

  const fetchMovies = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      let data: MovieListResponse | null = null;
      if (filters.danhMuc) {
        const res = await getDanhSach(filters.danhMuc, { page, limit: 30, category: filters.theLoai, country: filters.quocGia, year: filters.year });
        data = res?.data || null;
      } else if (filters.theLoai) {
        const res = await getTheLoaiDetails(filters.theLoai, { page, limit: 30, country: filters.quocGia, year: filters.year });
        data = res?.data || null;
      } else if (filters.quocGia) {
        const res = await getQuocGiaDetails(filters.quocGia, { page, limit: 30, category: filters.theLoai, year: filters.year });
        data = res?.data || null;
      } else if (filters.year) {
        const res = await getDanhSach("phim-moi", { page, limit: 30, year: filters.year });
        data = res?.data || null;
      } else {
        const res = await getDanhSach("phim-moi", { page, limit: 30 });
        data = res?.data || null;
      }
      setMovies(data);
      updateTitle();
      if (data?.items) await fetchPosterUrls(data.items);
    } catch (e) {
      console.error("Error fetching movies:", e);
    } finally {
      setLoading(false);
    }
  }, [filters, updateTitle, fetchPosterUrls]);

  const fetchFilterData = useCallback(async () => {
    try {
      const [theLoaiRes, quocGiaRes] = await Promise.all([getTheLoai(), getQuocGia()]);
      if (theLoaiRes?.data?.items) {
        const filtered = theLoaiRes.data.items.filter(item => !item.name.toLowerCase().includes('18+') && !item.name.toLowerCase().includes('18'));
        setTheLoaiList(filtered);
      }
      if (quocGiaRes?.data?.items) setQuocGiaList(quocGiaRes.data.items);
    } catch (e) {
      console.error("Error fetching filter data:", e);
    }
  }, []);

  const handleFilterChange = (newFilters: { theLoai?: string; quocGia?: string; year?: string; danhMuc?: string }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  useEffect(() => { fetchFilterData(); }, [fetchFilterData]);
  useEffect(() => {
    const p = searchParams.get('page');
    if (p) setCurrentPage(parseInt(p, 10));
  }, [searchParams]);
  useEffect(() => { fetchMovies(currentPage); }, [fetchMovies, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <FilterPanel theLoaiList={theLoaiList} quocGiaList={quocGiaList} onFilterChange={handleFilterChange} />
      </div>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : movies?.items && movies.items.length > 0 ? (
          <>
            <div className="grid grid-cols-6 gap-4">
              {movies.items.map(movie => (
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

export default function FilterPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <FilterContent />
    </Suspense>
  );
}
