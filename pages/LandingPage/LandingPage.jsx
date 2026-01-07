import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Finity AI SEO Writer</h1>
        <p>Create powerful, optimized content with multi-provider AI tools.</p>
        <button onClick={handleGetStarted}>Get Started</button>
      </section>

      <section className="features">
        <div className="feature-box">🔍 AI Research Assistant</div>
        <div className="feature-box">📝 SEO-Driven Article Generator</div>
        <div className="feature-box">🔌 WordPress Plugin Sync</div>
      </section>

      <footer>
        <p>© 2026 Finity AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
