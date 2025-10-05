import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Banner from '../components/Banner/Banner';
import MovieRow from '../components/MovieRow/MovieRow';
import TrailerModal from '../components/TrailerModal/TrailerModal';
import { endpoints, Movie } from '../api/tmdb';
import './Home.css';

const Home: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="home">
      <Navbar />
      
      <Banner onPlayClick={handleMovieClick} />
      
      <div className="home__rows">
        <MovieRow
          title="Netflix Originals"
          fetchUrl={endpoints.netflixOriginals}
          isLarge
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Trending Now"
          fetchUrl={endpoints.trending}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Top Rated"
          fetchUrl={endpoints.topRated}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Action Movies"
          fetchUrl={endpoints.actionMovies}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Comedy Movies"
          fetchUrl={endpoints.comedyMovies}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Horror Movies"
          fetchUrl={endpoints.horrorMovies}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Romance Movies"
          fetchUrl={endpoints.romanceMovies}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Documentaries"
          fetchUrl={endpoints.documentaries}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Science Fiction"
          fetchUrl={endpoints.scienceFiction}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Drama"
          fetchUrl={endpoints.drama}
          onMovieClick={handleMovieClick}
        />
        
        <MovieRow
          title="Thriller"
          fetchUrl={endpoints.thriller}
          onMovieClick={handleMovieClick}
        />
      </div>
      
      <TrailerModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;