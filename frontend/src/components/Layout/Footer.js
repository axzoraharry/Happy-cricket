import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🏏</div>
              <span className="text-xl font-bold bg-gradient-to-r from-happy-400 to-happy-600 bg-clip-text text-transparent">
                Happy Cricket
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              India's premier cricket betting and gaming platform. Experience the thrill of cricket with our advanced betting system, live matches, and Happy Coin rewards.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.017 14.5c0 .75-.393 1.067-1.067 1.067-.75 0-1.067-.317-1.067-1.067v-4c0-.75.317-1.067 1.067-1.067.674 0 1.067.317 1.067 1.067v4zm.5-7.5c0 .75-.393 1.067-1.067 1.067-.75 0-1.067-.317-1.067-1.067s.317-1.067 1.067-1.067c.674 0 1.067.317 1.067 1.067zm2.483 7.5v-4c0-2.942-1.567-4.333-3.667-4.333-1.508 0-2.342.667-2.75 1.333h-.083V6.5c0-.75-.393-1.067-1.067-1.067-.75 0-1.067.317-1.067 1.067v7c0 .75.317 1.067 1.067 1.067.674 0 1.067-.317 1.067-1.067v-4c0-1.5.733-2.167 1.833-2.167 1.167 0 1.667.667 1.667 2.167v4c0 .75.317 1.067 1.067 1.067.674 0 1.067-.317 1.067-1.067z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/live-matches" className="text-gray-400 hover:text-happy-400 transition-colors">Live Matches</Link></li>
              <li><Link to="/betting" className="text-gray-400 hover:text-happy-400 transition-colors">Betting</Link></li>
              <li><Link to="/wallet" className="text-gray-400 hover:text-happy-400 transition-colors">Wallet</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-happy-400 transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-happy-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Happy Cricket. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-500">Responsible Gaming</span>
              <span className="text-xs text-gray-500">18+</span>
              <span className="text-xs text-gray-500">Play Responsibly</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;