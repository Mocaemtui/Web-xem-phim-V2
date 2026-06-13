import type { ApiResponse, MovieListResponse, MovieDetail, Movie } from "@/types/api";

const NGUONC_BASE_URL = "https://phim.nguonc.com/api";

// Helper function to fetch from NguonC
async function fetchNguonC<T>(endpoint: string, revalidate: number = 3600): Promise<T | null> {
  try {
    const hasQuery = endpoint.includes('?');
    const url = `${NGUONC_BASE_URL}${endpoint}${hasQuery ? '&' : '?'}cb=1`;
    const response = await fetch(url, {
      next: { revalidate },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('NguonC API Error:', error);
    return null;
  }
}

// Convert NguonC movie to standard Movie type
function mapNguonCMovieToStandard(movie: any): Movie {
  return {
    _id: movie.id || movie.slug,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.original_name,
    poster_url: movie.poster_url,
    thumb_url: movie.thumb_url,
    year: movie.year || (movie.category && movie.category['3'] ? movie.category['3'].list[0]?.name : 2024),
    quality: movie.quality,
    lang: movie.language,
    time: movie.duration,
    episode_current: movie.current_episode,
    episode_total: movie.total_episodes?.toString(),
    content: movie.description,
  };
}

export async function searchNguonC(keyword: string): Promise<MovieListResponse | null> {
  const data = await fetchNguonC<any>(`/films/search?keyword=${encodeURIComponent(keyword)}`, 60);
  if (!data || !data.items || data.items.length === 0) return null;

  return {
    items: data.items.map(mapNguonCMovieToStandard),
    params: {
      pagination: {
        totalItems: data.paginate?.totalItems || data.items.length,
        totalItemsPerPage: data.paginate?.itemsPerPage || 20,
        currentPage: data.paginate?.currentPage || 1,
        pageRanges: data.paginate?.totalPages || 1,
      }
    }
  };
}

export async function getChiTietPhimNguonC(slug: string): Promise<MovieDetail | null> {
  const data = await fetchNguonC<any>(`/film/${slug}`, 86400);
  if (!data || !data.movie) return null;

  const standardMovie = mapNguonCMovieToStandard(data.movie);

  // Map episodes
  const episodes = data.movie.episodes?.map((epServer: any) => {
    return {
      server_name: epServer.server_name || "NguonC",
      server_data: epServer.items?.map((ep: any) => ({
        name: ep.name,
        slug: ep.slug,
        filename: ep.name,
        link: "",
        link_embed: ep.embed,
        link_m3u8: ep.m3u8,
      })) || []
    };
  }) || [];

  return {
    ...standardMovie,
    episodes
  };
}
