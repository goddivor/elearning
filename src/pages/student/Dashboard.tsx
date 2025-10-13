import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useTitle from '@/hooks/useTitle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/toast-context';
import { EnrollmentService, type Enrollment, type EnrollmentStats } from '@/services/enrollmentService';
import { followService, type Follow } from '@/services/followService';
import { StudentStatsCards } from '@/components/student/StudentStatsCards';
import { EnrolledCourseCard } from '@/components/student/EnrolledCourseCard';
import { InstructorCard } from '@/components/student/InstructorCard';
import Button from '@/components/ui/Button';
import { ArrowRight, Book1, SearchNormal1, People } from 'iconsax-react';

const StudentDashboard = () => {
  useTitle("Dashboard Étudiant");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [stats, setStats] = useState<EnrollmentStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    averageProgress: 0
  });
  const [recentCourses, setRecentCourses] = useState<Enrollment[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<Enrollment[]>([]);
  const [followedInstructors, setFollowedInstructors] = useState<Follow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les statistiques, cours et instructeurs en parallèle
      const [statsData, recentData, inProgressData, followsData] = await Promise.all([
        EnrollmentService.getEnrollmentStats(),
        EnrollmentService.getRecentCourses(),
        EnrollmentService.getInProgressCourses(),
        followService.getMyFollowing().catch(() => []) // Ne pas échouer si pas d'instructeurs
      ]);

      setStats(statsData);
      setRecentCourses(recentData);
      setInProgressCourses(inProgressData);
      setFollowedInstructors(followsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollowInstructor = async (instructorId: string) => {
    try {
      await followService.unfollowInstructor(instructorId);
      setFollowedInstructors(prev => prev.filter(f => f.instructorId._id !== instructorId));
      success('Ne plus suivre', 'Vous ne suivez plus cet instructeur');
    } catch (err) {
      console.error('Error unfollowing instructor:', err);
      showError('Erreur', 'Impossible de ne plus suivre cet instructeur');
    }
  };

  const handleViewInstructorProfile = (instructorId: string) => {
    navigate(`/dashboard/student/instructor/${instructorId}`);
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/learn`);
  };

  const handleViewCourseDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleBrowseCourses = () => {
    navigate('/dashboard/student/catalog');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-red-500 mb-4">
          <Book1 size={48} color="#EF4444" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.firstName} !
        </h1>
        <p className="text-gray-600">
          Continuez votre parcours d'apprentissage et découvrez de nouveaux cours.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <StudentStatsCards stats={stats} isLoading={isLoading} />

      {/* Cours en cours */}
      {inProgressCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Cours en cours</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/student/courses')}
              className="flex items-center gap-2"
            >
              Voir tout
              <ArrowRight size={16} color="#6B7280" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((enrollment) => (
                <EnrolledCourseCard
                  key={enrollment._id}
                  enrollment={enrollment}
                  onContinue={handleContinueCourse}
                  onViewDetails={handleViewCourseDetails}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cours récents */}
      {recentCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Récemment consultés</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
                  <div className="h-32 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentCourses.slice(0, 4).map((enrollment) => (
                <EnrolledCourseCard
                  key={enrollment._id}
                  enrollment={enrollment}
                  onContinue={handleContinueCourse}
                  onViewDetails={handleViewCourseDetails}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* État vide - Aucun cours inscrit */}
      {!isLoading && stats.totalCourses === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <SearchNormal1 className="text-gray-400" size={32} color="#9CA3AF" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun cours inscrit
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Commencez votre parcours d'apprentissage en explorant nos cours disponibles.
          </p>
          <Button onClick={handleBrowseCourses} className="flex items-center gap-2 mx-auto">
            <Book1 size={20} color="#FFFFFF" />
            Explorer les cours
          </Button>
        </div>
      )}

      {/* Instructeurs suivis */}
      {followedInstructors.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <People size={24} color="#6366F1" variant="Bold" />
              <h2 className="text-xl font-semibold text-gray-900">
                Instructeurs suivis
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/student/instructors')}
              className="flex items-center gap-2"
            >
              Voir tout
              <ArrowRight size={16} color="#6B7280" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedInstructors.slice(0, 6).map((follow) => (
                <InstructorCard
                  key={follow._id}
                  instructor={follow.instructorId}
                  onUnfollow={handleUnfollowInstructor}
                  onViewProfile={handleViewInstructorProfile}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Actions rapides */}
      {stats.totalCourses > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/student/courses')}
              className="flex items-center gap-2 justify-center"
            >
              <Book1 size={20} color="#6B7280" />
              Mes cours
            </Button>
            <Button
              variant="outline"
              onClick={handleBrowseCourses}
              className="flex items-center gap-2 justify-center"
            >
              <SearchNormal1 size={20} color="#6B7280" />
              Découvrir
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/student/progress')}
              className="flex items-center gap-2 justify-center"
            >
              <ArrowRight size={20} color="#6B7280" />
              Ma progression
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;