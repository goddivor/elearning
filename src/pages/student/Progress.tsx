import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useTitle from '@/hooks/useTitle';
import { EnrollmentService, type Enrollment } from '@/services/enrollmentService';
import Button from '@/components/ui/Button';
import SpinLoader from '@/components/ui/SpinLoader';
import { Chart, Medal, Clock, Book1 } from 'iconsax-react';

const Progress = () => {
  useTitle("Ma Progression");
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await EnrollmentService.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('Impossible de charger les données de progression');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressStats = () => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.completedAt).length;
    const inProgress = enrollments.filter(e => !e.completedAt && e.progress > 0).length;
    const notStarted = enrollments.filter(e => e.progress === 0).length;

    const averageProgress = total > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / total)
      : 0;

    const totalHours = enrollments.reduce((sum, e) => {
      return sum + (e.progress / 100) * 2; // Estimation: 2h par cours
    }, 0);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      averageProgress,
      totalHours: Math.round(totalHours * 10) / 10
    };
  };

  const stats = getProgressStats();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-red-500 mb-4">
          <Chart size={48} color="#EF4444" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadProgressData}>Réessayer</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <SpinLoader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ma Progression</h1>
        <p className="text-gray-600 mt-1">
          Suivez votre avancement dans vos cours
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Progression Moyenne</h3>
            <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-100">
              <Chart size={20} color="#3B82F6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
            <p className="text-sm text-gray-600">Sur {stats.total} cours</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Cours Terminés</h3>
            <div className="p-2 rounded-lg border bg-green-50 text-green-600 border-green-100">
              <Medal size={20} color="#10B981" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-600">{stats.inProgress} en cours</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Temps d'Étude</h3>
            <div className="p-2 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">
              <Clock size={20} color="#F59E0B" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
            <p className="text-sm text-gray-600">Temps investi</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Non Démarrés</h3>
            <div className="p-2 rounded-lg border bg-gray-50 text-gray-600 border-gray-100">
              <Book1 size={20} color="#6B7280" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{stats.notStarted}</p>
            <p className="text-sm text-gray-600">À commencer</p>
          </div>
        </div>
      </div>

      {/* Liste détaillée des cours */}
      {enrollments.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Détail par Cours</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {enrollments.map((enrollment) => {
              const { course, progress, completedAt, enrolledAt } = enrollment;

              if (!course) return null;

              const progressPercentage = Math.round(progress);
              const isCompleted = completedAt !== undefined;

              return (
                <div key={enrollment._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </h3>
                        {isCompleted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Medal size={12} className="mr-1" color="#10B981" />
                            Terminé
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Inscrit le {new Date(enrolledAt).toLocaleDateString('fr-FR')}</span>
                        {completedAt && (
                          <span>Terminé le {new Date(completedAt).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {progressPercentage}%
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="whitespace-nowrap"
                      >
                        {isCompleted ? 'Revoir' : 'Continuer'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Chart className="text-gray-400" size={32} color="#9CA3AF" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Aucune progression à afficher
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Inscrivez-vous à des cours pour commencer à suivre votre progression !
          </p>
          <Button onClick={() => navigate('/courses')} className="flex items-center gap-2 mx-auto">
            <Book1 size={20} color="#FFFFFF" />
            Découvrir des cours
          </Button>
        </div>
      )}
    </div>
  );
};

export default Progress;