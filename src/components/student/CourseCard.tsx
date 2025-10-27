import { Star1, People, Book1, Clock, Heart, Eye, UserAdd, UserRemove } from 'iconsax-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getFullFileUrl } from '@/utils/fileUtils';
import type { Course } from '@/services/courseService';

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  onUnenroll?: (courseId: string) => void;
  onViewDetails: (courseId: string) => void;
  viewMode?: 'grid' | 'list';
  isEnrolled?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (courseId: string) => void;
}

export const CourseCard = ({
  course,
  onEnroll,
  onUnenroll,
  onViewDetails,
  viewMode = 'grid',
  isEnrolled = false,
  isFavorite = false,
  onToggleFavorite,
}: CourseCardProps) => {
  const thumbnailUrl = course.thumbnailUrl
    ? getFullFileUrl(course.thumbnailUrl)
    : 'https://via.placeholder.com/400x250?text=Course';

  const instructorAvatarUrl = course.instructor?.avatar
    ? getFullFileUrl(course.instructor.avatar)
    : null;

  const levelLabels: Record<Course['level'], string> = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
  };

  const levelColors: Record<Course['level'], 'success' | 'warning' | 'danger'> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  };

  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 p-5">
        <div className="flex gap-6">
          {/* Image */}
          <div
            className="relative w-64 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 cursor-pointer"
            onClick={() => onViewDetails(course.id)}
          >
            <img
              src={thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              {course.price === 0 && (
                <Badge variant="success" size="sm" className="shadow-lg">
                  Gratuit
                </Badge>
              )}
              <div className="flex-1" />
              <Badge variant={levelColors[course.level]} size="sm" className="shadow-lg">
                {levelLabels[course.level]}
              </Badge>
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(course.id);
                }}
                className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <Heart
                  size={16}
                  color={isFavorite ? "#EF4444" : "#6B7280"}
                  variant={isFavorite ? "Bold" : "Outline"}
                />
              </button>
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 pr-4">
                <h3
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2 mb-2"
                  onClick={() => onViewDetails(course.id)}
                >
                  {course.title}
                </h3>
                {course.instructor && (
                  <div className="flex items-center gap-2 mb-2 group/instructor cursor-pointer">
                    {instructorAvatarUrl ? (
                      <img
                        src={instructorAvatarUrl}
                        alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                        className="w-6 h-6 rounded-full object-cover border-2 border-gray-100 group-hover/instructor:border-blue-400 transition-colors"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-100 group-hover/instructor:border-blue-400 transition-colors">
                        <span className="text-xs font-bold text-white">
                          {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 group-hover/instructor:text-blue-600 font-medium transition-colors">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center gap-5 text-sm mb-4">
              <div className="flex items-center gap-1.5">
                <Star1 size={16} color="#F59E0B" variant="Bold" />
                <span className="font-bold text-gray-900">{course.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({course.totalReviews})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <People size={16} color="#8B5CF6" variant="Bold" />
                <span className="text-gray-700 font-medium">{(course.enrolledStudents || 0).toLocaleString()} étudiants</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Book1 size={16} color="#3B82F6" variant="Bold" />
                <span className="text-gray-700 font-medium">{course.totalLessons} leçons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} color="#10B981" variant="Bold" />
                <span className="text-gray-700 font-medium">{Math.floor(course.duration / 60)}h</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div>
                {course.price === 0 ? (
                  <span className="text-2xl font-bold text-green-600">Gratuit</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {course.price.toFixed(2)} €
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {/* Voir détails */}
                <button
                  onClick={() => onViewDetails(course.id)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Voir les détails"
                >
                  <Eye size={20} color="#374151" variant="Bold" />
                </button>

                {/* S'inscrire / Se désinscrire */}
                {!isEnrolled ? (
                  <button
                    onClick={() => onEnroll(course.id)}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="S'inscrire au cours"
                  >
                    <UserAdd size={20} color="#FFFFFF" variant="Bold" />
                  </button>
                ) : (
                  <button
                    onClick={() => onUnenroll?.(course.id)}
                    className="p-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    title="Se désinscrire du cours"
                  >
                    <UserRemove size={20} color="#FFFFFF" variant="Bold" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue grille
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
      {/* Image */}
      <div
        className="relative h-48 bg-gray-200 cursor-pointer overflow-hidden"
        onClick={() => onViewDetails(course.id)}
      >
        <img
          src={thumbnailUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {course.price === 0 && (
            <Badge
              variant="success"
              size="sm"
              className="shadow-lg"
            >
              Gratuit
            </Badge>
          )}
          <div className="flex-1" />
          <Badge
            variant={levelColors[course.level]}
            size="sm"
            className="shadow-lg"
          >
            {levelLabels[course.level]}
          </Badge>
        </div>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(course.id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            style={{ marginTop: '32px' }}
          >
            <Heart
              size={18}
              color={isFavorite ? "#EF4444" : "#6B7280"}
              variant={isFavorite ? "Bold" : "Outline"}
            />
          </button>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Button
            size="sm"
            className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(course.id);
            }}
          >
            Voir les détails
          </Button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* Titre */}
        <h3
          className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2 mb-3 min-h-[56px]"
          onClick={() => onViewDetails(course.id)}
        >
          {course.title}
        </h3>

        {/* Instructeur */}
        {course.instructor && (
          <div className="flex items-center gap-2 mb-3 group/instructor cursor-pointer">
            {instructorAvatarUrl ? (
              <img
                src={instructorAvatarUrl}
                alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                className="w-7 h-7 rounded-full object-cover border-2 border-gray-100 group-hover/instructor:border-blue-400 transition-colors"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-100 group-hover/instructor:border-blue-400 transition-colors">
                <span className="text-xs font-bold text-white">
                  {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600 group-hover/instructor:text-blue-600 font-medium transition-colors">
              {course.instructor.firstName} {course.instructor.lastName}
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {course.description}
        </p>

        {/* Stats avec icônes colorées */}
        <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <Star1 size={16} color="#F59E0B" variant="Bold" />
            <span className="font-bold text-gray-900">{course.averageRating.toFixed(1)}</span>
            <span className="text-gray-400">({course.totalReviews})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <People size={16} color="#8B5CF6" variant="Bold" />
            <span className="text-gray-700 font-medium">{(course.enrolledStudents || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Book1 size={16} color="#3B82F6" variant="Bold" />
            <span className="text-gray-700 font-medium">{course.totalLessons}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} color="#10B981" variant="Bold" />
            <span className="text-gray-700 font-medium">{Math.floor(course.duration / 60)}h</span>
          </div>
        </div>

        {/* Prix et Action */}
        <div className="flex items-center justify-between">
          <div>
            {course.price === 0 ? (
              <span className="text-2xl font-bold text-green-600">Gratuit</span>
            ) : (
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  {course.price.toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {/* Voir détails */}
            <button
              onClick={() => onViewDetails(course.id)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Voir les détails"
            >
              <Eye size={20} color="#374151" variant="Bold" />
            </button>

            {/* S'inscrire / Se désinscrire */}
            {!isEnrolled ? (
              <button
                onClick={() => onEnroll(course.id)}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="S'inscrire au cours"
              >
                <UserAdd size={20} color="#FFFFFF" variant="Bold" />
              </button>
            ) : (
              <button
                onClick={() => onUnenroll?.(course.id)}
                className="p-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="Se désinscrire du cours"
              >
                <UserRemove size={20} color="#FFFFFF" variant="Bold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
