import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <section className="hero-section">
      <img 
        src="/brand-identity/logo/nova-logo.png" 
        alt="Nova‑XFinity AI Logo" 
        className="w-24 h-24 mx-auto mb-6"
      />
      <h1>Nova‑XFinity AI Writer</h1>
      <p>Create powerful, optimized content with futuristic multi-provider AI tools built for growth.</p>
      <button onClick={handleGetStarted}>Get Started</button>
    </section>
  );
};

export default HeroSection;
