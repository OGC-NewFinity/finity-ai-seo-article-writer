import React from 'react';

const ContactNewsletter = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <section className="contact-newsletter">
      <h2>Contact & Newsletter</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Email Address" />
        <textarea placeholder="Your Message" rows="4" />
        <button type="submit">Send Message</button>
      </form>
      <p className="newsletter-label">Or subscribe for updates:</p>
      <input type="email" placeholder="Subscribe via Email" className="newsletter-input" />
    </section>
  );
};

export default ContactNewsletter;
