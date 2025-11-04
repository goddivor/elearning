import { Link } from 'react-router-dom';
import {
  GraduationCap,
  TrendUp,
  Users,
  Globe,
  CurrencyCircleDollar,
  Video,
  ChartLineUp,
  Lightbulb,
  Heart,
  ArrowRight
} from '@phosphor-icons/react';

export default function BecomeInstructor() {
  const benefits = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Construisez votre communauté',
      description: 'Partagez votre expertise avec des milliers d\'étudiants à travers le monde et créez une communauté engagée.'
    },
    {
      icon: <CurrencyCircleDollar className="w-8 h-8" />,
      title: 'Générez des revenus',
      description: 'Monétisez vos connaissances et créez une source de revenus passifs grâce à vos cours en ligne.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Impact mondial',
      description: 'Atteignez des étudiants du monde entier et ayez un impact positif sur leur parcours d\'apprentissage.'
    },
    {
      icon: <ChartLineUp className="w-8 h-8" />,
      title: 'Outils de création avancés',
      description: 'Accédez à notre suite d\'outils de création de contenu, incluant l\'intégration 3D et l\'IA.'
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Liberté de création',
      description: 'Créez vos cours à votre rythme, sur les sujets qui vous passionnent le plus.'
    },
    {
      icon: <TrendUp className="w-8 h-8" />,
      title: 'Statistiques en temps réel',
      description: 'Suivez les performances de vos cours et l\'engagement de vos étudiants avec des analyses détaillées.'
    }
  ];

  const impactStories = [
    {
      stat: '50K+',
      label: 'Étudiants actifs'
    },
    {
      stat: '2,000+',
      label: 'Instructeurs'
    },
    {
      stat: '95%',
      label: 'Taux de satisfaction'
    },
    {
      stat: '150+',
      label: 'Pays couverts'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Postulez',
      description: 'Remplissez notre formulaire simple et partagez votre expertise'
    },
    {
      number: '02',
      title: 'Validation',
      description: 'Notre équipe examine votre candidature sous 48h'
    },
    {
      number: '03',
      title: 'Créez',
      description: 'Commencez à créer et publier vos cours immédiatement'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium mb-6">
              <GraduationCap className="w-5 h-5" />
              <span>Rejoignez notre communauté d'instructeurs</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Partagez votre passion.<br />
              Inspirez le monde.
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Devenez instructeur sur Elearning 3D+ et transformez vos connaissances en une
              expérience d'apprentissage extraordinaire pour des milliers d'étudiants.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/become-instructor/apply"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg group"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#benefits"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-semibold text-lg"
              >
                <span>En savoir plus</span>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStories.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <div className="text-slate-600 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Pourquoi devenir instructeur ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Découvrez tous les avantages qui vous attendent en tant qu'instructeur sur notre plateforme
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Impact Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Votre impact</span>
              </div>

              <h2 className="text-4xl font-bold mb-6">
                Chaque cours peut changer une vie
              </h2>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                En tant qu'instructeur, vous ne partagez pas seulement des connaissances -
                vous ouvrez des portes, créez des opportunités et inspirez des transformations.
                Votre expertise peut aider quelqu'un à décrocher le job de ses rêves, à lancer
                sa startup, ou à découvrir une nouvelle passion.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Partagez votre expertise unique</h4>
                    <p className="text-white/80">Votre perspective et expérience sont précieuses</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Créez une communauté</h4>
                    <p className="text-white/80">Connectez avec des personnes partageant votre passion</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TrendUp className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Évoluez avec votre audience</h4>
                    <p className="text-white/80">Apprenez de vos étudiants et améliorez continuellement</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="text-6xl font-bold mb-4">10,000+</div>
                    <div className="text-xl">
                      Vies impactées par nos instructeurs<br />
                      <span className="text-white/80">chaque mois</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-pink-400/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Trois étapes simples pour commencer votre parcours d'instructeur
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200" />

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Rejoignez des milliers d'instructeurs qui changent des vies chaque jour.
            Le processus de candidature ne prend que 5 minutes.
          </p>

          <Link
            to="/become-instructor/apply"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-2xl transition-all duration-300 font-bold text-lg group"
          >
            <GraduationCap className="w-6 h-6" />
            <span>Postuler maintenant</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="mt-6 text-slate-400 text-sm">
            Pas de frais d'inscription • Processus de validation rapide • Support dédié
          </p>
        </div>
      </section>
    </div>
  );
}
