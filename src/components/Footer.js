import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

// SVG Social Icons
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="qb-footer">
      {/* Gradient accent line */}
      <div className="qb-footer-accent"></div>

      <div className="qb-footer-main">
        {/* Brand Column */}
        <div className="qb-footer-brand">
          <Link to="/" className="qb-footer-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{marginRight: '0.6rem', verticalAlign: 'middle'}}>
              <rect width="32" height="32" rx="8" fill="url(#footer-brand-grad)"/>
              <path d="M8 12h16l-2 10H10L8 12z" fill="white" opacity="0.9"/>
              <circle cx="12" cy="25" r="2" fill="white"/>
              <circle cx="20" cy="25" r="2" fill="white"/>
              <path d="M8 12l-2-4h-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <defs><linearGradient id="footer-brand-grad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6C63FF"/><stop offset="1" stopColor="#00D2FF"/></linearGradient></defs>
            </svg>
            QuickBazaar
          </Link>
          <p>
            Bringing artisanal quality from local neighborhood makers straight to
            your doorstep. Experience the freshness of hand-crafted essentials.
          </p>
          <div className="qb-footer-social">
            <a href="#0" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#0" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#0" aria-label="Twitter"><TwitterIcon /></a>
            <a href="#0" aria-label="LinkedIn"><LinkedInIcon /></a>
          </div>
        </div>

        {/* Links */}
        <div className="qb-footer-links">
          <div className="qb-footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          <div className="qb-footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#0">Help Center</a></li>
              <li><a href="#0">Shipping Policy</a></li>
              <li><a href="#0">Returns & Refunds</a></li>
              <li><a href="#0">Contact Us</a></li>
            </ul>
          </div>

          <div className="qb-footer-col">
            <h4>Newsletter</h4>
            <p className="qb-newsletter-desc">Get weekly updates on fresh local finds and exclusive deals.</p>
            <form className="qb-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                {subscribed ? '✓' : '→'}
              </button>
            </form>
            {subscribed && <p className="qb-subscribe-success">Thanks for subscribing! 🎉</p>}
          </div>
        </div>
      </div>

      <div className="qb-footer-bottom">
        <div className="qb-footer-legal">
          <span>© 2024 QuickBazaar. All rights reserved.</span>
          <div className="qb-legal-links">
            <a href="#0">Privacy Policy</a>
            <a href="#0">Terms of Service</a>
          </div>
        </div>
        <div className="qb-footer-bottom-right">
          <div className="qb-footer-payment">
            <span>Secure Payments:</span>
            <div className="qb-pay-icons">
              <span>UPI</span>
              <span>Cards</span>
              <span>COD</span>
            </div>
          </div>
          <button className="qb-back-to-top" onClick={scrollToTop} aria-label="Back to top">
            <ArrowUpIcon />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
