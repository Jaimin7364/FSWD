import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const imageUrl = (size: string, path: string) => 
  `${IMAGE_BASE_URL}${size}${path}`;

export const endpoints = {
  trending: '/trending/all/day',
  netflixOriginals: '/discover/tv?with_networks=213',
  topRated: '/movie/top_rated',
  actionMovies: '/discover/movie?with_genres=28',
  comedyMovies: '/discover/movie?with_genres=35',
  horrorMovies: '/discover/movie?with_genres=27',
  romanceMovies: '/discover/movie?with_genres=10749',
  documentaries: '/discover/movie?with_genres=99',
  scienceFiction: '/discover/movie?with_genres=878',
  drama: '/discover/movie?with_genres=18',
  thriller: '/discover/movie?with_genres=53',
  getMovieVideos: (id: number) => `/movie/${id}/videos`,
  getTvVideos: (id: number) => `/tv/${id}/videos`,
};

export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  media_type?: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
}