"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Genre, Country } from "@/types/api";

const NAM_PHAT_HANH = Array.from({ length: 30 }, (_, i) => 2024 - i);

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

interface FilterPanelProps {
  theLoaiList: Genre[];
  quocGiaList: Country[];
  onFilterChange: (filters: {
    theLoai?: string;
    quocGia?: string;
    year?: string;
    danhMuc?: string;
  }) => void;
}

export default function FilterPanel({ theLoaiList, quocGiaList, onFilterChange }: FilterPanelProps) {
  const [selectedFilters, setSelectedFilters] = useState<{
    theLoaiSlug?: string;
    quocGiaSlug?: string;
    year?: string;
    danhMuc?: string;
  }>({});

  const handleFilterSelect = (
    type: keyof typeof selectedFilters,
    value: string
  ) => {
    const newFilters = {
      ...selectedFilters,
      [type]: selectedFilters[type] === value ? undefined : value,
    };
    setSelectedFilters(newFilters);
    
    // Convert to the format expected by parent
    const filtersForParent = {
      theLoai: newFilters.theLoaiSlug,
      quocGia: newFilters.quocGiaSlug,
      year: newFilters.year,
      danhMuc: newFilters.danhMuc,
    };
    onFilterChange(filtersForParent);
  };

  const clearFilter = (type: keyof typeof selectedFilters) => {
    const newFilters = { ...selectedFilters, [type]: undefined };
    setSelectedFilters(newFilters);
    
    const filtersForParent = {
      theLoai: newFilters.theLoaiSlug,
      quocGia: newFilters.quocGiaSlug,
      year: newFilters.year,
      danhMuc: newFilters.danhMuc,
    };
    onFilterChange(filtersForParent);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (value) => value !== undefined
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Bộ Lọc
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Danh Mục */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Danh Mục</span>
            {selectedFilters.danhMuc && (
              <button
                onClick={() => clearFilter("danhMuc")}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {DANH_MUC_LIST.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleFilterSelect("danhMuc", item.slug)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  selectedFilters.danhMuc === item.slug
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Thể Loại */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Thể Loại</span>
            {selectedFilters.theLoaiSlug && (
              <button
                onClick={() => clearFilter("theLoaiSlug")}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {theLoaiList.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleFilterSelect("theLoaiSlug", item.slug)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  selectedFilters.theLoaiSlug === item.slug
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quốc Gia */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Quốc Gia</span>
            {selectedFilters.quocGiaSlug && (
              <button
                onClick={() => clearFilter("quocGiaSlug")}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {quocGiaList.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleFilterSelect("quocGiaSlug", item.slug)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  selectedFilters.quocGiaSlug === item.slug
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Năm Phát Hành */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Năm Phát Hành</span>
            {selectedFilters.year && (
              <button
                onClick={() => clearFilter("year")}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {NAM_PHAT_HANH.map((year) => (
              <button
                key={year}
                onClick={() => handleFilterSelect("year", year.toString())}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  selectedFilters.year === year.toString()
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
