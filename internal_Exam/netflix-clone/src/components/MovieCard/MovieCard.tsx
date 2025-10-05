import React from 'react';
import { Movie, imageUrl } from '../../api/tmdb';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  isLarge?: boolean;
  onClick?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, isLarge = false, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  const posterPath = movie.poster_path;
  const title = movie.title || movie.name || movie.original_name;

  return (
    <div 
      className={`movie-card ${isLarge ? 'movie-card--large' : ''}`}
      onClick={handleClick}
    >
      <img
        className="movie-card__image"
        src={posterPath ? imageUrl(isLarge ? 'w300' : 'w185', posterPath) : '/placeholder-image.jpg'}
        alt={title}
        loading="lazy"
      />
      
      <div className="movie-card__overlay">
        <div className="movie-card__info">
          <h3 className="movie-card__title">{title}</h3>
          <div className="movie-card__rating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffd700">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <span>{movie.vote_average?.toFixed(1)}</span>
          </div>
          <p className="movie-card__year">
            {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}
          </p>
        </div>
        
        <div className="movie-card__actions">
          <button className="movie-card__play-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5V19L19 12L8 5Z"/>
            </svg>
          </button>
          
          <button className="movie-card__add-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>
          
          <button className="movie-card__like-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
          </button>
          
          <button className="movie-card__info-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9L12 15L18 9"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;