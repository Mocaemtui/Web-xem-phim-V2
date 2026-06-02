import type {
  ApiResponse,
  HomeData,
  MovieListResponse,
  MovieDetail,
  MovieImages,
  MoviePeoples,
  Genre,
  Country,
  Year,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ophim1.com";

export async function fetchAPI<T>(endpoint: string): Promise<ApiResponse<T> | null> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      cache: 'no-store', // Disable caching for client-side calls
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Check if API returns error status
    if (data.status === 'error') {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export async function getHome(): Promise<ApiResponse<HomeData> | null> {
  return fetchAPI<HomeData>("/v1/api/home");
}

export async function getPhimMoi(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-moi?page=${page}&limit=${limit}`
  );
}

export async function getPhimBo(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-bo?page=${page}&limit=${limit}`
  );
}

export async function getPhimLe(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-le?page=${page}&limit=${limit}`
  );
}

export async function getPhimViet(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-viet?page=${page}&limit=${limit}`
  );
}

export async function getPhimAuMy(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-au-my?page=${page}&limit=${limit}`
  );
}

export async function getPhimHan(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-han?page=${page}&limit=${limit}`
  );
}

export async function getPhimNhat(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-nhat?page=${page}&limit=${limit}`
  );
}

export async function getPhimTrung(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/danh-sach/phim-trung?page=${page}&limit=${limit}`
  );
}

export async function searchPhim(
  keyword: string
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(`/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
}

export async function getTheLoai(): Promise<ApiResponse<{ items: Genre[] }> | null> {
  return fetchAPI<{ items: Genre[] }>("/v1/api/the-loai");
}

export async function getQuocGia(): Promise<ApiResponse<{ items: Country[] }> | null> {
  return fetchAPI<{ items: Country[] }>("/v1/api/quoc-gia");
}

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
  return fetchAPI<MovieListResponse>(endpoint);
}

// Get category details with filters
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

// Get country details with filters
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

export async function getNamPhatHanh(): Promise<ApiResponse<{ items: Year[] }> | null> {
  return fetchAPI<{ items: Year[] }>("/v1/api/nam-phat-hanh");
}
export async function getDanhSach(
  slug: string,
  options: {
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_type?: string;
    category?: string;
    country?: string;
    year?: string;
  } = {}
): Promise<ApiResponse<MovieListResponse> | null> {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.append('page', options.page.toString());
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  if (options.sort_field) params.append('sort_field', options.sort_field);
  if (options.sort_type) params.append('sort_type', options.sort_type);
  if (options.category) params.append('category', options.category);
  if (options.country) params.append('country', options.country);
  if (options.year) params.append('year', options.year);
  const query = params.toString();
  const endpoint = `/v1/api/danh-sach/${slug}${query ? '?' + query : ''}`;
  return fetchAPI<MovieListResponse>(endpoint);
}


export async function getChiTietPhim(
  slug: string
): Promise<ApiResponse<{ item: MovieDetail }> | null> {
  return fetchAPI<{ item: MovieDetail }>(`/v1/api/phim/${slug}`);
}

export async function getHinhAnhPhim(
  slug: string
): Promise<ApiResponse<MovieImages> | null> {
  return fetchAPI<MovieImages>(`/v1/api/phim/${slug}/images`);
}

export async function getPeoplesPhim(
  slug: string
): Promise<ApiResponse<MoviePeoples> | null> {
  return fetchAPI<MoviePeoples>(`/v1/api/phim/${slug}/peoples`);
}

export async function getPhimByTheLoai(
  slug: string,
  page: number = 1,
  limit: number = 24
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/the-loai/${slug}?page=${page}&limit=${limit}`
  );
}

export async function getPhimByQuocGia(
  slug: string,
  page: number = 1,
  limit: number = 24
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/quoc-gia/${slug}?page=${page}&limit=${limit}`
  );
}

export async function getPhimByNam(
  year: number,
  page: number = 1,
  limit: number = 24
): Promise<ApiResponse<MovieListResponse> | null> {
  return fetchAPI<MovieListResponse>(
    `/v1/api/nam-phat-hanh/${year}?page=${page}&limit=${limit}`
  );
}

// Get movies by release year with filters
export async function getNamPhatHanhDetails(
  year: number,
  options: {
    page?: number;
    limit?: number;
    sort_field?: string;
    sort_type?: string;
    category?: string;
    country?: string;
  } = {}
): Promise<ApiResponse<MovieListResponse> | null> {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.append('page', options.page.toString());
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  if (options.sort_field) params.append('sort_field', options.sort_field);
  if (options.sort_type) params.append('sort_type', options.sort_type);
  if (options.category) params.append('category', options.category);
  if (options.country) params.append('country', options.country);
  const query = params.toString();
  const endpoint = `/v1/api/nam-phat-hanh/${year}${query ? '?' + query : ''}`;
  return fetchAPI<MovieListResponse>(endpoint);
}

// Helper function to get TMDB poster URL for a movie
export async function getMoviePosterUrl(slug: string): Promise<string | null> {
  const imagesData = await fetchAPI<MovieImages>(`/v1/api/phim/${slug}/images`);
  if (!imagesData?.data) return null;

  const poster = imagesData.data.images?.find(img => img.type === 'poster')?.file_path;
  const baseUrl = imagesData.data.image_sizes?.poster?.w500;

  return poster && baseUrl ? `${baseUrl}${poster}` : null;
}
