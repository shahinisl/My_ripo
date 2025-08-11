'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <h3>The Informative Times</h3>
              <p>The Pulse of Today's World</p>
              <p>Your trusted source for news, analysis, and insights from around the globe.</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/category/tech">Technology</Link></li>
              <li><Link href="/category/business">Business</Link></li>
              <li><Link href="/category/sports">Sports</Link></li>
              <li><Link href="/category/world">World News</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><button>About Us</button></li>
              <li><button>Contact</button></li>
              <li><button>Careers</button></li>
              <li><button>Advertise</button></li>
              <li><button>Press</button></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><button>Privacy Policy</button></li>
              <li><button>Terms of Service</button></li>
              <li><button>Cookie Policy</button></li>
              <li><button>Editorial Guidelines</button></li>
              <li><button>Code of Ethics</button></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <button className="social-link">📘 Facebook</button>
              <button className="social-link">🐦 Twitter</button>
              <button className="social-link">📸 Instagram</button>
              <button className="social-link">💼 LinkedIn</button>
              <button className="social-link">📺 YouTube</button>
            </div>
            
            <div className="newsletter">
              <h5>Newsletter Subscription</h5>
              <form className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-button">
                  Subscribe
                </button>
              </form>
              <p className="newsletter-text">
                Get the latest news and updates delivered to your inbox.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 The Informative Times. All rights reserved.</p>
            <div className="footer-bottom-links">
              <span>Version 1.0</span>
              <span>|</span>
              <span>Status: Final</span>
              <span>|</span>
              <button>Report Issue</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
