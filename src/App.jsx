import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Story from './components/Story';
import FamilyTree from './components/FamilyTree';
import JourneyMap from './components/JourneyMap';
import Puzzle from './components/Puzzle';
import Events from './components/Events';
import Vendors from './components/Vendors';
import SongRequests from './components/SongRequests';
import GuestMap from './components/GuestMap';
import Blessings from './components/Blessings';
import PhotoWall from './components/PhotoWall';
import CeremonyAlbums from './components/CeremonyAlbums';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import Background from './components/Background';
import Preloader from './components/Preloader';
import ThemeSwitcher from './components/ThemeSwitcher';
import Navbar from './components/Navbar';
import Envelope from './components/Envelope';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [envelopeActive, setEnvelopeActive] = useState(true);

  useEffect(() => {
    if (loading || envelopeActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loading, envelopeActive]);
  useEffect(() => {
    if (loading) return;
    // Intersection Observer for scroll reveal animations
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0.05,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal');

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

  if (loading) {
    return <Preloader onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      <Envelope onOpenComplete={() => setEnvelopeActive(false)} />
      <Background />
      <Navbar />
      <div className="content-wrapper">
        <Hero />
        <Story />
        <FamilyTree />
        <GuestMap />
        <PhotoWall />
        <CeremonyAlbums />
        <JourneyMap />
        <Puzzle />
        {/* <Gallery /> */}
        <Events />
        <Vendors />
        <SongRequests />
        <Blessings />
        <Footer />
        <MusicPlayer />
        <ThemeSwitcher />
      </div>
    </>
  );
}

export default App;
