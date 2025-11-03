import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ArrowRight, ShoppingCart, BookOpen } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, FadeIn } from './AnimatedSection';

interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  level: string;
  modules: number;
  description: string;
}

const categories = [
  { id: 'all', name: 'Tous les cours', icon: '🎯' },
  { id: 'modeling', name: 'Modélisation 3D', icon: '🎨' },
  { id: 'animation', name: 'Animation', icon: '🎬' },
  { id: 'rendering', name: 'Rendu', icon: '✨' },
  { id: 'game', name: 'Game Design', icon: '🎮' },
  { id: 'vfx', name: 'VFX & Effets', icon: '🌟' },
];

const allCourses: Course[] = [
  // Modélisation 3D
  {
    id: '1',
    title: 'Modélisation 3D avec Blender - De débutant à expert',
    instructor: 'Jean Martin',
    rating: 4.8,
    students: 12453,
    duration: '32h',
    price: 49.99,
    originalPrice: 99.99,
    thumbnail: 'https://picsum.photos/seed/course1/400/225',
    category: 'modeling',
    level: 'Débutant',
    modules: 24,
    description: 'Maîtrisez la modélisation 3D de A à Z avec Blender. Créez des objets complexes et des environnements détaillés.',
  },
  {
    id: '2',
    title: 'Architecture 3D avec SketchUp Pro',
    instructor: 'Marie Rousseau',
    rating: 4.7,
    students: 8234,
    duration: '28h',
    price: 44.99,
    originalPrice: 89.99,
    thumbnail: 'https://picsum.photos/seed/course2/400/225',
    category: 'modeling',
    level: 'Intermédiaire',
    modules: 20,
    description: 'Apprenez à créer des plans architecturaux professionnels en 3D avec SketchUp.',
  },
  {
    id: '3',
    title: 'Sculpture numérique avec ZBrush',
    instructor: 'Lucas Bernard',
    rating: 4.9,
    students: 15678,
    duration: '36h',
    price: 69.99,
    originalPrice: 139.99,
    thumbnail: 'https://picsum.photos/seed/course3/400/225',
    category: 'modeling',
    level: 'Avancé',
    modules: 30,
    description: 'Créez des sculptures numériques ultra-détaillées pour films et jeux vidéo.',
  },
  {
    id: '4',
    title: 'Modélisation Hard Surface avec Maya',
    instructor: 'Sophie Laurent',
    rating: 4.6,
    students: 6543,
    duration: '25h',
    price: 54.99,
    originalPrice: 109.99,
    thumbnail: 'https://picsum.photos/seed/course4/400/225',
    category: 'modeling',
    level: 'Intermédiaire',
    modules: 18,
    description: 'Maîtrisez la création de véhicules, robots et objets mécaniques en 3D.',
  },
  // Animation
  {
    id: '5',
    title: 'Animation 3D & Cinéma 4D - Techniques avancées',
    instructor: 'Sophie Leroux',
    rating: 4.9,
    students: 8932,
    duration: '28h',
    price: 59.99,
    originalPrice: 119.99,
    thumbnail: 'https://picsum.photos/seed/course5/400/225',
    category: 'animation',
    level: 'Intermédiaire',
    modules: 22,
    description: 'Techniques avancées d\'animation 3D pour créer des animations fluides et professionnelles.',
  },
  {
    id: '6',
    title: 'Animation de personnages avec Blender',
    instructor: 'Thomas Dubois',
    rating: 4.8,
    students: 11234,
    duration: '30h',
    price: 54.99,
    originalPrice: 109.99,
    thumbnail: 'https://picsum.photos/seed/course6/400/225',
    category: 'animation',
    level: 'Intermédiaire',
    modules: 26,
    description: 'Donnez vie à vos personnages avec des techniques d\'animation professionnelles.',
  },
  {
    id: '7',
    title: 'Motion Design avec After Effects',
    instructor: 'Camille Petit',
    rating: 4.7,
    students: 9876,
    duration: '24h',
    price: 49.99,
    originalPrice: 99.99,
    thumbnail: 'https://picsum.photos/seed/course7/400/225',
    category: 'animation',
    level: 'Débutant',
    modules: 20,
    description: 'Créez des animations graphiques percutantes pour vos projets vidéo.',
  },
  {
    id: '8',
    title: 'Rigging avancé pour l\'animation',
    instructor: 'Alexandre Moreau',
    rating: 4.9,
    students: 7654,
    duration: '26h',
    price: 64.99,
    originalPrice: 129.99,
    thumbnail: 'https://picsum.photos/seed/course8/400/225',
    category: 'animation',
    level: 'Avancé',
    modules: 24,
    description: 'Maîtrisez le rigging pour créer des personnages facilement animables.',
  },
  // Rendu
  {
    id: '9',
    title: 'Rendu réaliste avec V-Ray & Corona',
    instructor: 'Marc Dubois',
    rating: 4.7,
    students: 6721,
    duration: '24h',
    price: 44.99,
    originalPrice: 89.99,
    thumbnail: 'https://picsum.photos/seed/course9/400/225',
    category: 'rendering',
    level: 'Avancé',
    modules: 16,
    description: 'Créez des rendus photoréalistes avec les meilleurs moteurs de rendu du marché.',
  },
  {
    id: '10',
    title: 'Éclairage 3D pour le réalisme',
    instructor: 'Julie Martin',
    rating: 4.8,
    students: 8456,
    duration: '20h',
    price: 39.99,
    originalPrice: 79.99,
    thumbnail: 'https://picsum.photos/seed/course10/400/225',
    category: 'rendering',
    level: 'Intermédiaire',
    modules: 15,
    description: 'Maîtrisez les techniques d\'éclairage pour des rendus spectaculaires.',
  },
  {
    id: '11',
    title: 'Shading et texturing avancé',
    instructor: 'Pierre Lefebvre',
    rating: 4.9,
    students: 10234,
    duration: '28h',
    price: 59.99,
    originalPrice: 119.99,
    thumbnail: 'https://picsum.photos/seed/course11/400/225',
    category: 'rendering',
    level: 'Avancé',
    modules: 22,
    description: 'Créez des matériaux ultra-réalistes avec les techniques de shading avancées.',
  },
  {
    id: '12',
    title: 'Rendu temps réel avec Unreal Engine',
    instructor: 'Sarah Cohen',
    rating: 4.8,
    students: 9567,
    duration: '32h',
    price: 69.99,
    originalPrice: 139.99,
    thumbnail: 'https://picsum.photos/seed/course12/400/225',
    category: 'rendering',
    level: 'Avancé',
    modules: 28,
    description: 'Exploitez la puissance d\'Unreal Engine pour des rendus temps réel époustouflants.',
  },
  // Game Design
  {
    id: '13',
    title: 'Design de personnages 3D pour jeux vidéo',
    instructor: 'Laura Bernard',
    rating: 4.9,
    students: 15234,
    duration: '40h',
    price: 69.99,
    originalPrice: 139.99,
    thumbnail: 'https://picsum.photos/seed/course13/400/225',
    category: 'game',
    level: 'Intermédiaire',
    modules: 32,
    description: 'Créez des personnages 3D optimisés pour les jeux vidéo modernes.',
  },
  {
    id: '14',
    title: 'Environment Design pour jeux',
    instructor: 'Nicolas Durand',
    rating: 4.7,
    students: 11456,
    duration: '35h',
    price: 64.99,
    originalPrice: 129.99,
    thumbnail: 'https://picsum.photos/seed/course14/400/225',
    category: 'game',
    level: 'Intermédiaire',
    modules: 28,
    description: 'Concevez des environnements immersifs et optimisés pour le jeu vidéo.',
  },
  {
    id: '15',
    title: 'Assets 3D pour Unity',
    instructor: 'Emma Blanc',
    rating: 4.8,
    students: 13567,
    duration: '30h',
    price: 54.99,
    originalPrice: 109.99,
    thumbnail: 'https://picsum.photos/seed/course15/400/225',
    category: 'game',
    level: 'Débutant',
    modules: 25,
    description: 'Créez et optimisez des assets 3D prêts pour l\'intégration dans Unity.',
  },
  {
    id: '16',
    title: 'Game Props et objets interactifs',
    instructor: 'Vincent Roux',
    rating: 4.6,
    students: 8234,
    duration: '22h',
    price: 44.99,
    originalPrice: 89.99,
    thumbnail: 'https://picsum.photos/seed/course16/400/225',
    category: 'game',
    level: 'Débutant',
    modules: 18,
    description: 'Modélisez des props et objets interactifs pour enrichir vos jeux.',
  },
  // VFX & Effets
  {
    id: '17',
    title: 'VFX avec Houdini - Effets spectaculaires',
    instructor: 'David Martinez',
    rating: 4.9,
    students: 12890,
    duration: '38h',
    price: 74.99,
    originalPrice: 149.99,
    thumbnail: 'https://picsum.photos/seed/course17/400/225',
    category: 'vfx',
    level: 'Avancé',
    modules: 30,
    description: 'Créez des effets visuels époustouflants avec Houdini pour films et jeux.',
  },
  {
    id: '18',
    title: 'Simulations physiques réalistes',
    instructor: 'Léa Dupont',
    rating: 4.8,
    students: 9876,
    duration: '28h',
    price: 59.99,
    originalPrice: 119.99,
    thumbnail: 'https://picsum.photos/seed/course18/400/225',
    category: 'vfx',
    level: 'Avancé',
    modules: 24,
    description: 'Maîtrisez les simulations de fluides, tissus et destructions.',
  },
  {
    id: '19',
    title: 'Particules et effets dynamiques',
    instructor: 'Antoine Girard',
    rating: 4.7,
    students: 10567,
    duration: '24h',
    price: 49.99,
    originalPrice: 99.99,
    thumbnail: 'https://picsum.photos/seed/course19/400/225',
    category: 'vfx',
    level: 'Intermédiaire',
    modules: 20,
    description: 'Créez des systèmes de particules complexes pour des effets dynamiques.',
  },
  {
    id: '20',
    title: 'Compositing et post-production',
    instructor: 'Isabelle Moreau',
    rating: 4.8,
    students: 11234,
    duration: '26h',
    price: 54.99,
    originalPrice: 109.99,
    thumbnail: 'https://picsum.photos/seed/course20/400/225',
    category: 'vfx',
    level: 'Intermédiaire',
    modules: 22,
    description: 'Intégrez vos VFX dans des plans réels avec des techniques de compositing pro.',
  },
];

export const FeaturedCourses = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  const filteredCourses =
    activeCategory === 'all'
      ? allCourses.slice(0, 8)
      : allCourses.filter((course) => course.category === activeCategory).slice(0, 8);

  const handleAddToCart = (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Added to cart:', courseId);
    // TODO: Implémenter l'ajout au panier avec contexte
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star size={16} weight="fill" />
            <span>Populaire cette semaine</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cours les plus populaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les cours les mieux notés par notre communauté d'étudiants
          </p>
        </FadeIn>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Courses Grid with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {filteredCourses.map((course, index) => {
              // Déterminer si c'est la dernière colonne (pour afficher le tooltip à gauche)
              const isLastColumn = (index % 4) === 3;

              return (
              <AnimatedSection key={course.id} delay={index * 0.05}>
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredCourse(course.id)}
                  onMouseLeave={() => setHoveredCourse(null)}
                >
                  <Link
                    to={`/courses/${course.id}`}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="aspect-video w-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white text-gray-900 text-xs font-semibold rounded-full shadow-md">
                          {course.level}
                        </span>
                      </div>
                      {course.originalPrice && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md">
                            -
                            {Math.round(
                              ((course.originalPrice - course.price) / course.originalPrice) * 100
                            )}
                            %
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star size={16} weight="fill" className="text-yellow-400" />
                          <span className="font-semibold text-gray-900">{course.rating}</span>
                          <span className="text-gray-500">
                            ({course.students.toLocaleString()})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen size={16} />
                          <span>{course.modules} modules</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">{course.price}€</span>
                          {course.originalPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {course.originalPrice}€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Tooltip on Hover - Position à droite ou à gauche selon la colonne */}
                  <AnimatePresence>
                    {hoveredCourse === course.id && (
                      <motion.div
                        initial={{ opacity: 0, x: isLastColumn ? 10 : -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: isLastColumn ? 10 : -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-80 ${
                          isLastColumn ? 'right-full mr-2' : 'left-full ml-2'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 mb-2">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Niveau</span>
                            <span className="font-semibold text-gray-900">{course.level}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Durée totale</span>
                            <span className="font-semibold text-gray-900">{course.duration}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Modules</span>
                            <span className="font-semibold text-gray-900">{course.modules}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Étudiants</span>
                            <span className="font-semibold text-gray-900">
                              {course.students.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, course.id)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold group"
                        >
                          <ShoppingCart size={20} weight="bold" />
                          <span>Ajouter au panier</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/courses"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg group"
          >
            <span>Voir tous les cours</span>
            <ArrowRight
              size={20}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
