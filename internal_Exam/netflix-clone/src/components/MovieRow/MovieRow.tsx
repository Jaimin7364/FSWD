import React, { useState, useEffect, useRef } from 'react';
import { tmdbApi, Movie } from '../../api/tmdb';
import MovieCard from '../MovieCard/MovieCard';
import './MovieRow.css';

interface MovieRowProps {
  title: string;
  fetchUrl: string;
  isLarge?: boolean;
  onMovieClick?: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ 
  title, 
  fetchUrl, 
  isLarge = false, 
  onMovieClick 
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await tmdbApi.get(fetchUrl);
        setMovies(response.data.results);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl, title]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="movie-row">
        <h2 className="movie-row__title">{title}</h2>
        <div className="movie-row__loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="movie-row">
      <h2 className="movie-row__title">{title}</h2>
      
      <div className="movie-row__container">
        <button 
          className="movie-row__scroll-btn movie-row__scroll-btn--left"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12Z"/>
          </svg>
        </button>
        
        <div className="movie-row__posters" ref={scrollRef}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isLarge={isLarge}
              onClick={onMovieClick}
            />
          ))}
        </div>
        
        <button 
          className="movie-row__scroll-btn movie-row__scroll-btn--right"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12Z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MovieRow;