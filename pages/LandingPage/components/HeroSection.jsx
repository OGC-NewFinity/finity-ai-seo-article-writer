import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section className="hero-section">
      <h1>Finity AI SEO Writer</h1>
      <p>Create powerful, optimized content with futuristic multi-provider AI tools built for growth.</p>
      <button onClick={handleGetStarted}>Get Started</button>
    </section>
  );
};

export default HeroSection;