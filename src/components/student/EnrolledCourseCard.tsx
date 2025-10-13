import { Play, Calendar, User, Book1, Eye, UserRemove } from "iconsax-react";
import type { Enrollment } from "@/services/enrollmentService";

interface EnrolledCourseCardProps {
  enrollment: Enrollment;
  onContinue?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
  onUnenroll?: (courseId: string) => void;
}

export const EnrolledCourseCard = ({
  enrollment,
  onContinue,
  onViewDetails,
  onUnenroll
}: EnrolledCourseCardProps) => {
  const { course, progress, enrolledAt, completedAt } = enrollment;

  if (!course) {
    return null;
  }

  const progressPercentage = Math.round(progress);
  const isCompleted = completedAt !== undefined;
  const enrolledDate = new Date(enrolledAt).toLocaleDateString('fr-FR');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image du cours */}
      <div className="relative h-48 bg-gray-100">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
            <Book1 className="text-blue-400" size={48} color="#60A5FA" />
          </div>
        )}

        {/* Badge de progression */}
        <div className="absolute top-3 right-3">
          {isCompleted ? (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Terminé
            </span>
          ) : (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {progressPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {/* Titre et description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {course.description}
          </p>
        </div>

        {/* Informations du cours */}
        <div className="space-y-2 mb-4">
          {course.instructor && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} color="#6B7280" />
              <span>
                {course.instructor.firstName} {course.instructor.lastName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} color="#6B7280" />
            <span>Inscrit le {enrolledDate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.level === 'beginner'
                  ? 'bg-green-100 text-green-800'
                  : course.level === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {course.level === 'beginner' ? 'Débutant' :
               course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{course.category}</span>
          </div>
        </div>

        {/* Barre de progression */}
        {!isCompleted && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progression</span>
              <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {/* Continuer/Revoir */}
          <button
            onClick={() => onContinue?.(course._id)}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title={isCompleted ? 'Revoir le cours' : 'Continuer le cours'}
          >
            <Play size={18} color="#FFFFFF" variant="Bold" />
            <span className="text-white text-sm font-medium">
              {isCompleted ? 'Revoir' : 'Continuer'}
            </span>
          </button>

          {/* Voir détails */}
          <button
            onClick={() => onViewDetails?.(course._id)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Voir les détails"
          >
            <Eye size={20} color="#374151" variant="Bold" />
          </button>

          {/* Se désinscrire */}
          <button
            onClick={() => onUnenroll?.(course._id)}
            className="p-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title="Se désinscrire du cours"
          >
            <UserRemove size={20} color="#FFFFFF" variant="Bold" />
          </button>
        </div>
      </div>
    </div>
  );
};