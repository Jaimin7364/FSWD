import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { tmdbApi, endpoints, Movie, VideoResponse } from '../../api/tmdb';
import './TrailerModal.css';

interface TrailerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ movie, isOpen, onClose }) => {
  const [trailerKey, setTrailerKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!movie) return;

      setLoading(true);
      setError('');
      setTrailerKey('');

      try {
        
        let endpoint = endpoints.getMovieVideos(movie.id);
        
        
        if (movie.media_type === 'tv' || movie.name) {
          endpoint = endpoints.getTvVideos(movie.id);
        }

        const response = await tmdbApi.get<VideoResponse>(endpoint);
        const videos = response.data.results;

        // Find trailer video
        const trailer = videos.find(
          (video) => 
            video.type === 'Trailer' && 
            video.site === 'YouTube'
        );

        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
         
          const anyVideo = videos.find(video => video.site === 'YouTube');
          if (anyVideo) {
            setTrailerKey(anyVideo.key);
          } else {
            setError('No trailer available for this title');
          }
        }
      } catch (err) {
        console.error('Error fetching trailer:', err);
        setError('Failed to load trailer');
      } finally {
        setLoading(false);
      }
    };

    if (movie && isOpen) {
      fetchTrailer();
    }
  }, [movie, isOpen]);

  const handleClose = () => {
    setTrailerKey('');
    setError('');
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0,
      mute: 0,
    },
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="trailer-modal__overlay" onClick={handleOverlayClick}>
      <div className="trailer-modal">
        <button className="trailer-modal__close" onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
          </svg>
        </button>

        <div className="trailer-modal__content">
          <div className="trailer-modal__header">
            <h2 className="trailer-modal__title">
              {movie.title || movie.name || movie.original_name}
            </h2>
            {movie.release_date || movie.first_air_date ? (
              <span className="trailer-modal__year">
                ({(movie.release_date || movie.first_air_date)?.split('-')[0]})
              </span>
            ) : null}
          </div>

          <div className="trailer-modal__video-container">
            {loading && (
              <div className="trailer-modal__loading">
                <div className="trailer-modal__spinner"></div>
                <p>Loading trailer...</p>
              </div>
            )}

            {error && (
              <div className="trailer-modal__error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                </svg>
                <p>{error}</p>
              </div>
            )}

            {trailerKey && !loading && !error && (
              <YouTube
                videoId={trailerKey}
                opts={opts}
                className="trailer-modal__youtube"
                onError={() => setError('Failed to load video')}
              />
            )}
          </div>

          {movie.overview && (
            <div className="trailer-modal__description">
              <h3>Overview</h3>
              <p>{movie.overview}</p>
            </div>
          )}

          <div className="trailer-modal__info">
            <div className="trailer-modal__rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffd700">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span>{movie.vote_average?.toFixed(1)} / 10</span>
            </div>
            
            <div className="trailer-modal__popularity">
              <span>Popularity: {Math.round(movie.popularity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;