import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Story from './components/Story';
import Gallery from './components/Gallery';
import JourneyMap from './components/JourneyMap';
import Events from './components/Events';
import Blessings from './components/Blessings';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import Background from './components/Background';
import Preloader from './components/Preloader';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loading]);
  useEffect(() => {
    if (loading) return;
    // Intersection Observer for scroll reveal animations
    const observerCallback = (entries, observer) => {
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
      <Background />
      <div className="content-wrapper">
        <Hero />
        <Story />
        <JourneyMap />
        {/* <Gallery /> */}
        <Events />
        <Blessings />
        <Footer />
        <MusicPlayer />
      </div>
    </>
  );
}

export default App;
