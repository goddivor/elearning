import { PaperPlaneTilt, CheckCircle, Sparkle } from '@phosphor-icons/react';
import { FadeIn, SlideInLeft, SlideInRight } from './AnimatedSection';
import { useState } from 'react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

  const benefits = [
    'Nouveaux cours et contenus exclusifs',
    'Offres spéciales et réductions',
    'Conseils d\'apprentissage personnalisés',
    'Actualités de la plateforme',
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <SlideInLeft>
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkle size={16} weight="fill" />
                <span>Restez informé</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Abonnez-vous à notre newsletter
              </h2>

              <p className="text-lg text-purple-100 mb-8">
                Recevez les dernières actualités, cours exclusifs et offres spéciales directement dans votre boîte mail.
              </p>

              {/* Benefits List */}
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={16} weight="fill" className="text-white" />
                      </div>
                      <span className="text-purple-100">{benefit}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </SlideInLeft>

          {/* Right Content - Form */}
          <SlideInRight>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Rejoignez plus de 50,000 abonnés
              </h3>

              {isSubscribed ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} weight="fill" className="text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Inscription réussie !
                  </h4>
                  <p className="text-gray-600 text-center">
                    Merci de votre abonnement. Vous recevrez bientôt nos actualités.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="newsletter-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      id="newsletter-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold group"
                  >
                    <span>S'abonner à la newsletter</span>
                    <PaperPlaneTilt
                      size={20}
                      weight="fill"
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    En vous abonnant, vous acceptez de recevoir nos emails marketing. Vous pouvez vous désabonner à tout moment.
                  </p>
                </form>
              )}

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} weight="fill" className="text-green-600" />
                    <span>100% Gratuit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} weight="fill" className="text-green-600" />
                    <span>Pas de spam</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} weight="fill" className="text-green-600" />
                    <span>Désabonnement facile</span>
                  </div>
                </div>
              </div>
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
};
