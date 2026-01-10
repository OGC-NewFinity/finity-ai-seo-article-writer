import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import MainNavbar from '@/components/navigation/MainNavbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavbar />
      <Outlet />
      <footer className="bg-slate-900 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Nova‑XFinity AI</h3>
              <p className="text-slate-400 text-sm">
                AI-powered content creation tools for modern creators.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/docs" className="text-slate-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-slate-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-400 hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/community" className="text-slate-400 hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-slate-400 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="text-slate-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Nova‑XFinity AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
