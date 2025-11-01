import { Link } from 'react-router-dom';
import { Play, TrendUp, Users, BookOpen } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { SlideInLeft, SlideInRight, FadeIn } from './AnimatedSection';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <SlideInLeft className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
              <TrendUp size={16} weight="bold" />
              <span>Plateforme #1 d'apprentissage en 3D</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Apprendre n'a jamais été aussi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                immersif
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              La plateforme complète pour la gestion d'organisations éducatives, l'apprentissage intelligent avec IA,
              et des cours immersifs en 3D. Plus de 50,000 étudiants ont déjà transformé leur carrière.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div>
                <div className="flex items-center space-x-2 text-purple-600 mb-2">
                  <BookOpen size={24} weight="bold" />
                </div>
                <div className="text-2xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">Cours disponibles</div>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-purple-600 mb-2">
                  <Users size={24} weight="bold" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50,000+</div>
                <div className="text-sm text-gray-600">Étudiants actifs</div>
              </div>
              <div>
                <div className="flex items-center space-x-2 text-purple-600 mb-2">
                  <TrendUp size={24} weight="bold" />
                </div>
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Taux de satisfaction</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg shadow-purple-200"
              >
                Commencer gratuitement
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl border-2 border-gray-200 hover:border-purple-600 transition-all font-semibold text-lg space-x-2 group">
                <Play size={24} weight="fill" className="text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Voir la démo</span>
              </button>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {['alice', 'bob', 'charlie', 'david'].map((name, i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/150?u=${name}`}
                    alt={`Student ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Rejoint par 5,000+ étudiants ce mois-ci
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.9/5</span>
                </div>
              </div>
            </div>
          </SlideInLeft>

          {/* Right Content - Image/Illustration */}
          <SlideInRight className="relative hidden lg:block">
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-6 mb-6">
                  <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Play size={64} weight="fill" className="text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400" />
                      <div>
                        <div className="font-semibold text-gray-900">Cours Introduction 3D</div>
                        <div className="text-sm text-gray-500">Par Marie Dubois</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>12 modules • 45 heures</span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="font-semibold">4.8</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-8 -left-8 bg-white rounded-xl shadow-lg p-4 transform -rotate-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendUp size={24} className="text-green-600" weight="bold" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">+127%</div>
                    <div className="text-xs text-gray-600">Progression</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-purple-600" weight="bold" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">2.5K</div>
                    <div className="text-xs text-gray-600">Étudiants inscrits</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-3xl transform -rotate-3 opacity-20 blur-2xl" />
          </SlideInRight>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-300 to-transparent opacity-20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-indigo-300 to-transparent opacity-20 blur-3xl rounded-full" />
    </section>
  );
};
