import { Link } from 'react-router-dom';
import { Star, Clock, Users, ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
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
}

const featuredCourses: Course[] = [
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
    category: '3D Modeling',
    level: 'Débutant',
  },
  {
    id: '2',
    title: 'Animation 3D & Cinéma 4D - Techniques avancées',
    instructor: 'Sophie Leroux',
    rating: 4.9,
    students: 8932,
    duration: '28h',
    price: 59.99,
    originalPrice: 119.99,
    thumbnail: 'https://picsum.photos/seed/course2/400/225',
    category: 'Animation',
    level: 'Intermédiaire',
  },
  {
    id: '3',
    title: 'Rendu réaliste avec V-Ray & Corona',
    instructor: 'Marc Dubois',
    rating: 4.7,
    students: 6721,
    duration: '24h',
    price: 44.99,
    originalPrice: 89.99,
    thumbnail: 'https://picsum.photos/seed/course3/400/225',
    category: 'Rendu',
    level: 'Avancé',
  },
  {
    id: '4',
    title: 'Design de personnages 3D pour jeux vidéo',
    instructor: 'Laura Bernard',
    rating: 4.9,
    students: 15234,
    duration: '40h',
    price: 69.99,
    originalPrice: 139.99,
    thumbnail: 'https://picsum.photos/seed/course4/400/225',
    category: 'Game Design',
    level: 'Intermédiaire',
  },
];

export const FeaturedCourses = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
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

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredCourses.map((course, index) => (
            <AnimatedSection key={course.id} delay={index * 0.1}>
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="aspect-video w-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white text-gray-900 text-xs font-semibold rounded-full">
                    {course.category}
                  </span>
                </div>
                {course.originalPrice && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
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
                    <Users size={16} />
                    <span>{course.level}</span>
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
            </AnimatedSection>
          ))}
        </div>

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
