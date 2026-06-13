export const MOVIE_SOURCES = {
  OPHIM: {
    id: 'ophim',
    name: 'Ophim',
    url: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ophim1.com',
    type: 'V1_STANDARD'
  },
  PHIMAPI: {
    id: 'phimapi',
    name: 'PhimAPI',
    url: 'https://phimapi.com',
    type: 'V1_STANDARD'
  },
  NGUONC: {
    id: 'nguonc',
    name: 'NguonC',
    url: 'https://phim.nguonc.com',
    type: 'CUSTOM_NGUONC'
  }
};

// Đặt Ophim làm Nguồn chính (Primary Source)
export const PRIMARY_SOURCE = MOVIE_SOURCES.OPHIM;
