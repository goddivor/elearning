import { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, X, MagnifyingGlass } from '@phosphor-icons/react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">3D</span>
            </div>
            <span className="text-xl font-bold text-gray-900 whitespace-nowrap">3D E-Learning</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/courses" className="text-gray-700 hover:text-purple-600 transition-colors">
              Parcourir
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors">
              Catégories
            </Link>
            <Link to="/become-instructor" className="text-gray-700 hover:text-purple-600 transition-colors">
              Enseigner
            </Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher un cours..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/signin"
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                S'inscrire
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden py-3 border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/courses"
                className="text-gray-700 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Parcourir
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catégories
              </Link>
              <Link
                to="/become-instructor"
                className="text-gray-700 hover:text-purple-600 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Enseigner
              </Link>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  to="/signin"
                  className="block w-full text-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
