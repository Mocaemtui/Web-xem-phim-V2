import type { ApiResponse, MovieListResponse, MovieDetail, Genre, Country, Year } from "@/types/api";
import { fetchAPI } from "./api";

// Search with optional pagination
export async function searchPhimWithPagination(
  keyword: string,
  options: { page?: number; limit?: number } = {}
): Promise<ApiResponse<MovieListResponse> | null> {
  const params = new URLSearchParams();
  params.append('keyword', keyword);
  if (options.page !== undefined) params.append('page', options.page.toString());
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  const endpoint = `/v1/api/tim-kiem?${params.toString()}`;
  return fetchAPI<MovieListResponse>(endpoint, 60);
}

// Get category list (already exists in lib/api as getTheLoai)

// Get movies by category slug with extended filters
export async function getTheLoaiDetails(
  slug: string,
  options: {
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_type?: string;
    country?: string;
    year?: string;
  } = {}
): Promise<ApiResponse<MovieListResponse> | null> {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.append('page', options.page.toString());
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  if (options.sort_field) params.append('sort_field', options.sort_field);
  if (options.sort_type) params.append('sort_type', options.sort_type);
  if (options.country) params.append('country', options.country);
  if (options.year) params.append('year', options.year);
  const endpoint = `/v1/api/the-loai/${slug}${params.toString() ? '?' + params.toString() : ''}`;
  return fetchAPI<MovieListResponse>(endpoint);
}

// Get country list (already exists as getQuocGia)

// Get movies by country slug with extended filters
export async function getQuocGiaDetails(
  slug: string,
  options: {
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_type?: string;
    category?: string;
    year?: string;
  } = {}
): Promise<ApiResponse<MovieListResponse> | null> {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.append('page', options.page.toString());
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  if (options.sort_field) params.append('sort_field', options.sort_field);
  if (options.sort_type) params.append('sort_type', options.sort_type);
  if (options.category) params.append('category', options.category);
  if (options.year) params.append('year', options.year);
  const endpoint = `/v1/api/quoc-gia/${slug}${params.toString() ? '?' + params.toString() : ''}`;
  return fetchAPI<MovieListResponse>(endpoint);
}
