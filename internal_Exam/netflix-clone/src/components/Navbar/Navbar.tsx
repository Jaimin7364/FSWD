import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [show, setShow] = useState(false);

  const transitionNavBar = () => {
    if (window.scrollY > 100) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', transitionNavBar);
    return () => window.removeEventListener('scroll', transitionNavBar);
  }, []);

  return (
    <div className={`nav ${show && 'nav__black'}`}>
      <div className="nav__contents">
        <div className="nav__left">
          <img
            className="nav__logo"
            src="https://images.ctfassets.net/y2ske730sjqp/6bhPChRFLRxc17sR8jgKbe/6fa1c6e6f37acdc97ff635cf16ba6fb3/Logos-Readability-Netflix-logo.png"
            alt="Netflix"
          />
          
          <ul className="nav__links">
            <li>Home</li>
            <li>TV Shows</li>
            <li>Movies</li>
            <li>New & Popular</li>
            <li>My List</li>
          </ul>
        </div>

        <div className="nav__right">
          <div className="nav__search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M14 11C14 14.3137 11.3137 17 8 17C4.68629 17 2 14.3137 2 11C2 7.68629 4.68629 5 8 5C11.3137 5 14 7.68629 14 11ZM14.3623 15.8506C12.7866 17.2649 10.7218 18 8.5 18C4.08172 18 0.5 14.4183 0.5 10C0.5 5.58172 4.08172 2 8.5 2C12.9183 2 16.5 5.58172 16.5 10C16.5 12.2218 15.7649 14.2866 14.3506 15.8623L22.5 24L21 25.5L14.3623 15.8506Z" fill="white"/>
            </svg>
          </div>
          
          <div className="nav__kids">KIDS</div>
          
          <div className="nav__notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M13.0002 4.07092C16.3924 4.55624 19 7.4736 19 11V15.2538C20.0489 15.3307 21.0851 15.4245 22.1072 15.5347L21.8928 17.5232C18.9493 17.1813 15.9511 17 13 17C10.0489 17 7.05067 17.1813 4.10718 17.5232L3.89282 15.5347C4.91493 15.4245 5.95112 15.3307 7 15.2538V11C7 7.47345 9.60675 4.55599 13.0002 4.07092ZM17 15.1287V11C17 8.23858 14.7614 6 12 6C9.23858 6 7 8.23858 7 11V15.1287C8.64588 15.0437 10.3089 15 12 15C13.6911 15 15.3541 15.0437 17 15.1287ZM8.61611 19C9.40642 20.2822 10.6122 21 12 21C13.3878 21 14.5936 20.2822 15.3839 19H8.61611Z" fill="white"/>
            </svg>
          </div>
          
          <div className="nav__profile">
            <img
              className="nav__avatar"
              src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
              alt="Profile"
            />
            <div className="nav__dropdown">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 10L12 15L17 10H7Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;