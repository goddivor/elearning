import {
  Brain,
  ChatsCircle,
  MagicWand,
  ChartBar,
  Lightbulb,
  Sparkle,
} from '@phosphor-icons/react';
import { SlideInLeft, SlideInRight, FadeIn, AnimatedSection } from './AnimatedSection';

const aiFeatures = [
  {
    icon: <ChatsCircle size={32} weight="bold" />,
    title: 'Assistant IA Personnel',
    description: 'Un tuteur intelligent disponible 24/7 pour répondre à vos questions',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: <MagicWand size={32} weight="bold" />,
    title: 'Recommandations Personnalisées',
    description: 'L\'IA analyse votre profil et suggère les cours adaptés à vos objectifs',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <ChartBar size={32} weight="bold" />,
    title: 'Analyse Prédictive',
    description: 'Prédiction de vos performances et identification des zones à améliorer',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: <Lightbulb size={32} weight="bold" />,
    title: 'Génération de Contenu',
    description: 'Création automatique d\'exercices et de quiz personnalisés',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: <Brain size={32} weight="bold" />,
    title: 'Apprentissage Adaptatif',
    description: 'Le contenu s\'adapte automatiquement à votre rythme d\'apprentissage',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: <Sparkle size={32} weight="bold" />,
    title: 'Résumés Intelligents',
    description: 'L\'IA génère des résumés de cours et des fiches de révision',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export const AIFeatures = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Right Content - Visual */}
          <SlideInLeft>
            <div className="relative">
              {/* Floating AI Bubbles */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <Brain size={20} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">IA active</div>
                    <div className="font-bold text-gray-900">Apprentissage...</div>
                  </div>
                </div>
              </div>

              {/* Main Chat Interface */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 relative">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Assistant IA</h4>
                    <p className="text-sm text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                      En ligne
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4 mb-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                      <p className="text-sm">Comment puis-je améliorer mes compétences en modélisation 3D ?</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                      <p className="text-sm">
                        Basé sur votre profil, je vous recommande de commencer par le cours
                        "Blender pour débutants" suivi par "Techniques avancées". Voulez-vous que
                        je crée un plan d'apprentissage personnalisé ?
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors">
                          Oui, créer un plan
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 transition-colors">
                          Plus d'infos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>L'IA analyse votre réponse...</span>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Sparkle size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-600">Précision IA</div>
                  </div>
                </div>
              </div>
            </div>
          </SlideInLeft>

          {/* Left Content */}
          <SlideInRight>
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain size={16} weight="fill" />
              <span>Intelligence Artificielle</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              L'apprentissage{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                intelligent
              </span>
              {' '}avec l'IA
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Notre intelligence artificielle révolutionne votre expérience d'apprentissage en
              s'adaptant à votre niveau, vos objectifs et votre rythme personnel.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Assistance en temps réel</h4>
                  <p className="text-gray-600">L'IA répond à vos questions instantanément, 24/7</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Parcours personnalisé</h4>
                  <p className="text-gray-600">Chaque étudiant a un parcours unique adapté à ses besoins</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Amélioration continue</h4>
                  <p className="text-gray-600">L'IA apprend de vos interactions pour mieux vous servir</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Sparkle size={24} weight="fill" className="text-purple-600" />
                <h4 className="font-bold text-gray-900">Nouveauté !</h4>
              </div>
              <p className="text-gray-700">
                Notre nouvelle IA peut maintenant créer des exercices pratiques personnalisés
                basés sur vos points faibles identifiés.
              </p>
            </div>
          </SlideInRight>
        </div>

        {/* AI Features Grid */}
        <FadeIn>
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités IA de pointe
          </h3>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiFeatures.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-white">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
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
