import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import useTitle from '@/hooks/useTitle';
import { EnrollmentService, type Enrollment } from '@/services/enrollmentService';
import { EnrolledCourseCard } from '@/components/student/EnrolledCourseCard';
import Button from '@/components/ui/Button';
import { Book1, SearchNormal1, Filter } from 'iconsax-react';

type FilterType = 'all' | 'in-progress' | 'completed';

const MyCourses = () => {
  useTitle("Mes Cours");
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const loadEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await EnrollmentService.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      setError('Impossible de charger vos cours');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...enrollments];

    // Filtrer par statut
    if (filterType === 'completed') {
      filtered = filtered.filter(e => e.completedAt);
    } else if (filterType === 'in-progress') {
      filtered = filtered.filter(e => !e.completedAt);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(enrollment =>
        enrollment.course?.title.toLowerCase().includes(query) ||
        enrollment.course?.description.toLowerCase().includes(query) ||
        enrollment.course?.category.toLowerCase().includes(query) ||
        `${enrollment.course?.instructor.firstName} ${enrollment.course?.instructor.lastName}`.toLowerCase().includes(query)
      );
    }

    setFilteredEnrollments(filtered);
  }, [enrollments, searchQuery, filterType]);

  useEffect(() => {
    loadEnrollments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleContinueCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/learn`);
  };

  const handleViewCourseDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  const getFilterStats = () => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.completedAt).length;
    const inProgress = total - completed;

    return {
      all: total,
      'in-progress': inProgress,
      completed: completed
    };
  };

  const filterStats = getFilterStats();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-red-500 mb-4">
          <Book1 size={48} color="#EF4444" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadEnrollments}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
          <p className="text-gray-600 mt-1">
            Gérez et continuez vos cours inscrits
          </p>
        </div>

        <Button onClick={handleBrowseCourses} className="flex items-center gap-2">
          <SearchNormal1 size={20} color="#FFFFFF" />
          Découvrir des cours
        </Button>
      </div>

      {/* Statistiques rapides */}
      {!isLoading && enrollments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{filterStats.all}</div>
            <div className="text-sm text-gray-600">Total inscrits</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{filterStats['in-progress']}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{filterStats.completed}</div>
            <div className="text-sm text-gray-600">Terminés</div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      {!isLoading && enrollments.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <SearchNormal1 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} color="#9CA3AF" />
                <input
                  type="text"
                  placeholder="Rechercher dans mes cours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} color="#9CA3AF" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous ({filterStats.all})</option>
                <option value="in-progress">En cours ({filterStats['in-progress']})</option>
                <option value="completed">Terminés ({filterStats.completed})</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des cours */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <EnrolledCourseCard
              key={enrollment._id}
              enrollment={enrollment}
              onContinue={handleContinueCourse}
              onViewDetails={handleViewCourseDetails}
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        /* État vide - Aucun cours */
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Book1 className="text-gray-400" size={32} color="#9CA3AF" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun cours inscrit
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Vous n'êtes inscrit à aucun cours pour le moment. Explorez notre catalogue pour commencer votre apprentissage !
          </p>
          <Button onClick={handleBrowseCourses} className="flex items-center gap-2 mx-auto">
            <Book1 size={20} color="#FFFFFF" />
            Explorer les cours
          </Button>
        </div>
      ) : (
        /* Aucun résultat de recherche */
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <SearchNormal1 className="text-gray-400" size={32} color="#9CA3AF" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Aucun cours ne correspond à vos critères de recherche. Essayez avec d'autres mots-clés ou filtres.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}>
              Effacer les filtres
            </Button>
            <Button onClick={handleBrowseCourses}>
              Découvrir d'autres cours
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;