const MOVIE_SOURCES = {
  OPHIM: { url: 'https://ophim1.com' },
  PHIMAPI: { url: 'https://phimapi.com' }
};
const NGUONC_BASE_URL = "https://phim.nguonc.com/api";

async function fetchAPI(endpoint, customBaseUrl) {
    const baseUrl = customBaseUrl || MOVIE_SOURCES.OPHIM.url;
    const url = `${baseUrl}${endpoint}`;
    console.log("Fetching:", url);
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
}

async function fetchNguonC(endpoint) {
    const url = `${NGUONC_BASE_URL}${endpoint}`;
    console.log("Fetching NguonC:", url);
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
}

async function getChiTietPhim(slug) {
  const [ophimRes, phimapiRes, nguoncRes] = await Promise.all([
    fetchAPI(`/v1/api/phim/${slug}`, MOVIE_SOURCES.OPHIM.url),
    fetchAPI(`/v1/api/phim/${slug}`, MOVIE_SOURCES.PHIMAPI.url),
    fetchNguonC(`/film/${slug}`)
  ]);

  let baseMovie = null;
  const allEpisodes = [];

  if (ophimRes?.data?.item) {
    baseMovie = ophimRes.data.item;
    allEpisodes.push(...(baseMovie.episodes?.map(e => ({ ...e, server_name: `Ophim - ${e.server_name}` })) || []));
  }
  
  if (phimapiRes?.data?.item) {
    if (!baseMovie) baseMovie = phimapiRes.data.item;
    allEpisodes.push(...(phimapiRes.data.item.episodes?.map(e => ({ ...e, server_name: `PhimAPI - ${e.server_name}` })) || []));
  }

  if (nguoncRes && nguoncRes.movie) {
    if (!baseMovie) baseMovie = nguoncRes.movie;
    // Map episodes like apiNguonC.ts
    const eps = nguoncRes.movie.episodes?.map((epServer) => {
        return {
          server_name: epServer.server_name || "NguonC",
          server_data: epServer.items?.map((ep) => ({
            name: ep.name,
            link_m3u8: ep.m3u8,
          })) || []
        };
    }) || [];
    allEpisodes.push(...(eps.map(e => ({ ...e, server_name: `NguonC - ${e.server_name}` })) || []));
  }

  if (!baseMovie) return null;
  baseMovie.episodes = allEpisodes;
  return baseMovie;
}

async function test() {
    const res = await getChiTietPhim('ngoi-truong-xac-song');
    console.log("Servers found:");
    res.episodes.forEach(e => console.log(e.server_name));
}
test();
