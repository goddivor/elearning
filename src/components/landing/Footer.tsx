import { Link } from 'react-router-dom';
import {
  FacebookLogo,
  TwitterLogo,
  InstagramLogo,
  LinkedinLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">3D</span>
              </div>
              <span className="text-xl font-bold text-white">3D E-Learning</span>
            </Link>
            <p className="text-gray-400 mb-6 text-sm">
              Transformez votre apprentissage avec nos cours 3D immersifs et interactifs.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <FacebookLogo size={18} weight="fill" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <TwitterLogo size={18} weight="fill" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <InstagramLogo size={18} weight="fill" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <LinkedinLogo size={18} weight="fill" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <YoutubeLogo size={18} weight="fill" />
              </a>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Plateforme</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/courses" className="hover:text-purple-400 transition-colors">
                  Parcourir les cours
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-purple-400 transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link to="/become-instructor" className="hover:text-purple-400 transition-colors">
                  Devenir instructeur
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-purple-400 transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="hover:text-purple-400 transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-purple-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-purple-400 transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-purple-400 transition-colors">
                  Communauté
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="hover:text-purple-400 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-purple-400 transition-colors">
                  Carrières
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-purple-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="hover:text-purple-400 transition-colors">
                  Presse
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="hover:text-purple-400 transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-400 transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-purple-400 transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-purple-400 transition-colors">
                  Plan du site
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} 3D E-Learning. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <select className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-600">
                <option>🇫🇷 Français</option>
                <option>🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
