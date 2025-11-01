import { Star, Quotes } from '@phosphor-icons/react';
import { AnimatedSection, FadeIn, ScaleIn } from './AnimatedSection';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Thomas Rousseau',
    role: 'Architecte 3D',
    company: 'DesignLab Studio',
    content:
      "Grâce à 3D E-Learning, j'ai pu maîtriser Blender en seulement 3 mois. Les cours sont exceptionnels et les instructeurs très compétents. J'ai même obtenu une promotion !",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=thomas',
  },
  {
    id: '2',
    name: 'Marie Lefèvre',
    role: 'Game Designer',
    company: 'Indie Games Co.',
    content:
      "La plateforme est intuitive et les cours sont très bien structurés. J'ai pu créer mon premier personnage 3D professionnel en suivant le cours de Laura. Incroyable !",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=marie',
  },
  {
    id: '3',
    name: 'Alex Martin',
    role: 'Motion Designer',
    company: 'Creative Agency',
    content:
      "Les techniques d'animation que j'ai apprises ici ont transformé mon travail. Mes clients sont impressionnés par la qualité de mes rendus maintenant.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=alex',
  },
  {
    id: '4',
    name: 'Sophie Dubois',
    role: 'Freelance 3D Artist',
    company: 'Indépendante',
    content:
      "J'ai démarré en tant que débutante et maintenant je travaille sur des projets clients internationaux. La communauté est également très active et entraide.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=sophie',
  },
  {
    id: '5',
    name: 'Lucas Bernard',
    role: 'VFX Artist',
    company: 'Film Productions',
    content:
      "Les cours de rendu réaliste m'ont ouvert les portes de l'industrie du cinéma. La qualité pédagogique est au rendez-vous, je recommande à 100%.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=lucas',
  },
  {
    id: '6',
    name: 'Emma Petit',
    role: 'Product Designer',
    company: 'Tech Startup',
    content:
      "Plateforme fantastique avec des cours de haute qualité. J'ai pu rapidement monter en compétences et intégrer la 3D dans mes designs produits.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=emma',
  },
];

export const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star size={16} weight="fill" />
            <span>Témoignages</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos étudiants
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants satisfaits qui ont transformé leur carrière
          </p>
        </FadeIn>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.id} delay={index * 0.1}>
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-purple-200">
                <Quotes size={32} weight="fill" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} weight="fill" className="text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-16 text-center">
          <ScaleIn className="inline-flex flex-col items-center bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={32} weight="fill" className="text-yellow-400" />
              ))}
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600 mb-4">Note moyenne de nos étudiants</div>
            <div className="text-sm text-gray-500">Basé sur plus de 50,000 avis vérifiés</div>
          </ScaleIn>
        </div>
      </div>
    </section>
  );
};
