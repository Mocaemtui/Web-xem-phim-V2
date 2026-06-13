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
  Movie,
} from "@/types/api";
import { MOVIE_SOURCES, PRIMARY_SOURCE } from "./sources";

const API_BASE_URL = PRIMARY_SOURCE.url;

export async function fetchAPI<T>(
  endpoint: string,
  revalidate: number = 3600,
  customBaseUrl?: string
): Promise<ApiResponse<T> | null> {
  try {
    const baseUrl = customBaseUrl || API_BASE_URL;
    const hasQuery = endpoint.includes('?');
    const url = `${baseUrl}${endpoint}${hasQuery ? '&' : '?'}cb=1`;
    
    const response = await fetch(url, {
      next: { revalidate }, // Cache API theo thời gian cấu hình
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
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
  const endpoint = `/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
  
  const [ophimRes, phimapiRes] = await Promise.all([
    fetchAPI<MovieListResponse>(endpoint, 60, MOVIE_SOURCES.OPHIM.url),
    fetchAPI<MovieListResponse>(endpoint, 60, MOVIE_SOURCES.PHIMAPI.url)
  ]);

  const allItems: Movie[] = [];

  const addItems = (res: any, sourceName: string) => {
    const processItem = (item: Movie) => {
      allItems.push({ ...item, source: sourceName } as any);
    };

    if (res?.data?.items) {
      res.data.items.forEach(processItem);
    } else if (res?.items) {
      res.items.forEach(processItem);
    }
  };

  addItems(ophimRes, 'ophim');
  addItems(phimapiRes, 'phimapi');

  if (allItems.length === 0) return null;

  return {
    status: "success",
    data: {
      items: allItems,
      params: {
        pagination: {
          totalItems: allItems.length,
          totalItemsPerPage: allItems.length,
          currentPage: 1,
          pageRanges: 1
        }
      }
    }
  };
}

export async function getTheLoai(): Promise<ApiResponse<{ items: Genre[] }> | null> {
  // Danh mục thể loại cố định, cache 24 giờ
  return fetchAPI<{ items: Genre[] }>("/v1/api/the-loai", 86400);
}

export async function getQuocGia(): Promise<ApiResponse<{ items: Country[] }> | null> {
  // Danh sách quốc gia cố định, cache 24 giờ
  return fetchAPI<{ items: Country[] }>("/v1/api/quoc-gia", 86400);
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
  // Tìm kiếm phân trang, cache 60 giây
  return fetchAPI<MovieListResponse>(endpoint, 60);
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
  // Danh sách năm phát hành cố định, cache 24 giờ
  return fetchAPI<{ items: Year[] }>("/v1/api/nam-phat-hanh", 86400);
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
  let [ophimRes, phimapiRes] = await Promise.all([
    fetchAPI<{ item: MovieDetail }>(`/v1/api/phim/${slug}`, 86400, MOVIE_SOURCES.OPHIM.url),
    fetchAPI<{ item: MovieDetail }>(`/v1/api/phim/${slug}`, 86400, MOVIE_SOURCES.PHIMAPI.url)
  ]);

  let baseMovie: MovieDetail | null = ophimRes?.data?.item || phimapiRes?.data?.item || null;

  // --- SMART CROSS-API MATCHING (FALLBACK) ---
  if (baseMovie) {
    const originName = baseMovie.origin_name || baseMovie.name;
    
    if ((!ophimRes?.data?.item || !phimapiRes?.data?.item) && originName) {
      // Step 1: Parallelize searches
      const [searchOphim, searchPhimapi] = await Promise.all([
        !ophimRes?.data?.item 
          ? fetchAPI<MovieListResponse>(`/v1/api/tim-kiem?keyword=${encodeURIComponent(originName)}`, 60, MOVIE_SOURCES.OPHIM.url) 
          : Promise.resolve(null),
        !phimapiRes?.data?.item 
          ? fetchAPI<MovieListResponse>(`/v1/api/tim-kiem?keyword=${encodeURIComponent(originName)}`, 60, MOVIE_SOURCES.PHIMAPI.url) 
          : Promise.resolve(null)
      ]);

      let fetchOphimPromise: Promise<ApiResponse<{ item: MovieDetail }> | null> | null = null;
      let fetchPhimapiPromise: Promise<ApiResponse<{ item: MovieDetail }> | null> | null = null;

      if (searchOphim?.data?.items) {
        const match = searchOphim.data.items.find(m => 
          (m.origin_name?.toLowerCase() === originName.toLowerCase() || m.name?.toLowerCase() === originName.toLowerCase())
        );
        if (match && match.slug !== slug) {
          fetchOphimPromise = fetchAPI<{ item: MovieDetail }>(`/v1/api/phim/${match.slug}`, 86400, MOVIE_SOURCES.OPHIM.url);
        }
      }

      if (searchPhimapi?.data?.items) {
        const match = searchPhimapi.data.items.find(m => 
          (m.origin_name?.toLowerCase() === originName.toLowerCase() || m.name?.toLowerCase() === originName.toLowerCase())
        );
        if (match && match.slug !== slug) {
          fetchPhimapiPromise = fetchAPI<{ item: MovieDetail }>(`/v1/api/phim/${match.slug}`, 86400, MOVIE_SOURCES.PHIMAPI.url);
        }
      }

      // Step 2: Parallelize detail fetches
      if (fetchOphimPromise || fetchPhimapiPromise) {
        const [fallbackOphim, fallbackPhimapi] = await Promise.all([
          fetchOphimPromise || Promise.resolve(null),
          fetchPhimapiPromise || Promise.resolve(null)
        ]);
        
        if (fallbackOphim?.data?.item) ophimRes = fallbackOphim;
        if (fallbackPhimapi?.data?.item) phimapiRes = fallbackPhimapi;
      }
    }
  }
  // -------------------------------------------

  const allEpisodes: any[] = [];

  if (ophimRes?.data?.item) {
    baseMovie = ophimRes.data.item;
    allEpisodes.push(...(baseMovie.episodes?.map(e => ({ ...e, server_name: `Ophim - ${e.server_name}` })) || []));
  }
  
  if (phimapiRes?.data?.item) {
    if (!baseMovie) baseMovie = phimapiRes.data.item;
    allEpisodes.push(...(phimapiRes.data.item.episodes?.map(e => ({ ...e, server_name: `PhimAPI - ${e.server_name}` })) || []));
  }

  if (!baseMovie) return null;

  baseMovie.episodes = allEpisodes;

  return {
    status: "success",
    data: { item: baseMovie }
  };
}

export async function getHinhAnhPhim(
  slug: string
): Promise<ApiResponse<MovieImages> | null> {
  // Hình ảnh phim phụ trợ, cache 24 giờ
  return fetchAPI<MovieImages>(`/v1/api/phim/${slug}/images`, 86400);
}

export async function getPeoplesPhim(
  slug: string
): Promise<ApiResponse<MoviePeoples> | null> {
  // Diễn viên/Đạo diễn, cache 24 giờ
  return fetchAPI<MoviePeoples>(`/v1/api/phim/${slug}/peoples`, 86400);
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
