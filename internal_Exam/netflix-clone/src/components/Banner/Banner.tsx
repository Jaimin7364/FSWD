import React, { useState, useEffect } from 'react';
import { tmdbApi, endpoints, Movie, imageUrl } from '../../api/tmdb';
import './Banner.css';

interface BannerProps {
  onPlayClick?: (movie: Movie) => void;
}

const Banner: React.FC<BannerProps> = ({ onPlayClick }) => {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await tmdbApi.get(endpoints.netflixOriginals);
        const movies = response.data.results;
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        setMovie(randomMovie);
      } catch (error) {
        console.error('Error fetching banner movie:', error);
      }
    };

    fetchData();
  }, []);

  const truncate = (string: string, n: number) => {
    return string?.length > n ? string.substr(0, n - 1) + '...' : string;
  };

  if (!movie) return <div className="banner__loading">Loading...</div>;

  return (
    <header
      className="banner"
      style={{
        backgroundSize: 'cover',
        backgroundImage: `url(${imageUrl('original', movie?.backdrop_path)})`,
        backgroundPosition: 'center center',
      }}
    >
      <div className="banner__contents">
        <h1 className="banner__title">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        
        <div className="banner__buttons">
          <button 
            className="banner__button banner__button--play"
            onClick={() => onPlayClick && onPlayClick(movie)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
            Play
          </button>
          
          <button className="banner__button banner__button--info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 13C12.5523 13 13 12.5523 13 12V8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8V12C11 12.5523 11.4477 13 12 13ZM13 15.5C13 16.0523 12.5523 16.5 12 16.5C11.4477 16.5 11 16.0523 11 15.5C11 14.9477 11.4477 14.5 12 14.5C12.5523 14.5 13 14.9477 13 15.5Z" fill="currentColor"/>
            </svg>
            More Info
          </button>
        </div>
        
        <p className="banner__description">
          {truncate(movie?.overview || '', 150)}
        </p>
      </div>
      
      <div className="banner__fadeBottom" />
    </header>
  );
};

export default Banner;