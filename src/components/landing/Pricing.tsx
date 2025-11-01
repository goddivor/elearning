import { Link } from 'react-router-dom';
import { Check, Crown, Lightning, Sparkle } from '@phosphor-icons/react';
import { AnimatedSection, FadeIn, ScaleIn } from './AnimatedSection';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
  icon: React.ReactNode;
  popular: boolean;
  features: string[];
  cta: string;
  highlight?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour commencer',
    price: 0,
    billingPeriod: 'mois',
    icon: <Sparkle size={24} weight="fill" />,
    popular: false,
    features: [
      'Accès à 10 cours gratuits',
      'Certificats de complétion',
      'Communauté étudiante',
      'Support par email',
    ],
    cta: "Commencer gratuitement",
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les apprenants sérieux',
    price: 29.99,
    billingPeriod: 'mois',
    icon: <Lightning size={24} weight="fill" />,
    popular: true,
    highlight: 'Le plus populaire',
    features: [
      'Accès illimité à tous les cours',
      'Téléchargements pour hors ligne',
      'Certificats professionnels',
      'Support prioritaire 24/7',
      'Projets pratiques exclusifs',
      'Accès aux masterclasses',
    ],
    cta: 'Essayer 7 jours gratuits',
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Pour les équipes et entreprises',
    price: 99.99,
    billingPeriod: 'mois',
    icon: <Crown size={24} weight="fill" />,
    popular: false,
    features: [
      'Tout du plan Pro',
      'Jusqu\'à 20 utilisateurs',
      'Tableau de bord analytics',
      'Gestion des équipes',
      'Factu ration centralisée',
      'Formations personnalisées',
      'Account manager dédié',
    ],
    cta: 'Contacter les ventes',
  },
];

export const Pricing = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown size={16} weight="fill" />
            <span>Plans & Tarifs</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Un plan pour chaque objectif
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choisissez le plan qui vous convient. Changez ou annulez à tout moment.
          </p>
        </FadeIn>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <ScaleIn key={plan.id} delay={index * 0.15}>
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'border-2 border-purple-600 shadow-2xl scale-105'
                  : 'border border-gray-200 hover:border-purple-300 hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                    {plan.highlight}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {plan.icon}
              </div>

              {/* Plan Info */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}€</span>
                  <span className="ml-2 text-gray-600">/{plan.billingPeriod}</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to="/signup"
                className={`block w-full text-center px-6 py-4 rounded-xl font-semibold transition-all mb-8 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-900 mb-3">
                  Ce qui est inclus :
                </div>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check
                      size={20}
                      weight="bold"
                      className={`flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-purple-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            </ScaleIn>
          ))}
        </div>

        {/* FAQ/Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Toutes les offres incluent une garantie satisfait ou remboursé de 30 jours
          </p>
          <Link to="/pricing" className="text-purple-600 hover:text-purple-700 font-medium">
            Comparer tous les plans en détail →
          </Link>
        </div>
      </div>
    </section>
  );
};
