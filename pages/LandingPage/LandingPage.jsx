import React from 'react';
import './LandingPage.css';

import HeroSection from './components/HeroSection.jsx';
import ProjectOverview from './components/ProjectOverview.jsx';
import ServicesSection from './components/ServicesSection.jsx';
import ContactNewsletter from './components/ContactNewsletter.jsx';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <HeroSection />
      <ProjectOverview />
      <ServicesSection />
      <ContactNewsletter />
    </div>
  );
};

export default LandingPage;
