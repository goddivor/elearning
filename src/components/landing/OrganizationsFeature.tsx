import {
  Buildings,
  ChartLineUp,
  Users,
  Certificate,
  Gear,
  ShieldCheck
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { SlideInLeft, SlideInRight, FadeIn, AnimatedSection } from './AnimatedSection';

const features = [
  {
    icon: <Users size={32} weight="bold" />,
    title: 'Gestion Multi-Utilisateurs',
    description: 'Gérez facilement étudiants, instructeurs et administrateurs au sein de votre organisation',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <ChartLineUp size={32} weight="bold" />,
    title: 'Tableaux de Bord Analytics',
    description: 'Suivez les performances et la progression de vos équipes en temps réel',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: <Certificate size={32} weight="bold" />,
    title: 'Certificats Personnalisés',
    description: 'Délivrez des certificats aux couleurs de votre institution',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: <Gear size={32} weight="bold" />,
    title: 'Personnalisation Complète',
    description: 'Adaptez la plateforme à vos besoins spécifiques et votre branding',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: <ShieldCheck size={32} weight="bold" />,
    title: 'Sécurité & Conformité',
    description: 'Sécurité renforcée et conformité RGPD pour vos données sensibles',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: <Buildings size={32} weight="bold" />,
    title: 'Multi-Organisations',
    description: 'Gérez plusieurs campus ou branches depuis une seule plateforme',
    color: 'from-violet-500 to-purple-500',
  },
];

export const OrganizationsFeature = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <SlideInLeft>
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Buildings size={16} weight="fill" />
              <span>Pour les Organisations</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Gérez votre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                institution éducative
              </span>
              {' '}facilement
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Une plateforme complète pour les universités, écoles et centres de formation.
              Centralisez la gestion de vos cours, étudiants et instructeurs en un seul endroit.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Déploiement rapide</h4>
                  <p className="text-gray-600">Configurez votre organisation en moins de 24h</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Formation incluse</h4>
                  <p className="text-gray-600">Support et formation pour vos administrateurs</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Tarifs dégressifs</h4>
                  <p className="text-gray-600">Plus vous avez d'utilisateurs, moins vous payez par personne</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact-sales"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Demander une démo
              </Link>
              <Link
                to="/organizations"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl border-2 border-gray-200 hover:border-purple-600 transition-all font-semibold"
              >
                En savoir plus
              </Link>
            </div>
          </SlideInLeft>

          {/* Right Content - Visual */}
          <SlideInRight>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Buildings size={24} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Université Paris Tech</h3>
                      <p className="text-sm text-gray-500">2,450 étudiants actifs</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Active
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-gray-600">Cours actifs</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-sm text-gray-600">Taux de réussite</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-sm text-gray-600">Instructeurs</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-600">1.2K</div>
                    <div className="text-sm text-gray-600">Certificats</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">Engagement global</span>
                      <span className="text-gray-900 font-semibold">87%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '87%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <ChartLineUp size={24} className="text-green-600" weight="bold" />
                  <div>
                    <div className="text-xs text-gray-600">Cette semaine</div>
                    <div className="font-bold text-gray-900">+23%</div>
                  </div>
                </div>
              </div>
            </div>
          </SlideInRight>
        </div>

        {/* Features Grid */}
        <FadeIn>
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités dédiées aux organisations
          </h3>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};
