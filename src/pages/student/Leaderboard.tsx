/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTitle from '@/hooks/useTitle';
import { followService, type InstructorLeaderboard } from '@/services/followService';
import { useToast } from '@/contexts/toast-context';
import Button from '@/components/ui/Button';
import { Crown, Profile2User, Book1, Add, TickCircle } from 'iconsax-react';
import { getFullFileUrl } from '@/utils/fileUtils';

const Leaderboard = () => {
  useTitle('Classement des Instructeurs');
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [instructors, setInstructors] = useState<InstructorLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const [leaderboardData, followingData] = await Promise.all([
        followService.getLeaderboard(),
        followService.getMyFollowing().catch(() => [])
      ]);

      setInstructors(leaderboardData);
      setFollowingIds(new Set(followingData.map(f => f.instructorId._id)));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showError('Erreur', 'Impossible de charger le classement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (instructorId: string) => {
    try {
      await followService.followInstructor({ instructorId });
      setFollowingIds(prev => new Set([...prev, instructorId]));

      // Mettre à jour le compteur de followers localement
      setInstructors(prev => prev.map(instructor =>
        instructor._id === instructorId
          ? { ...instructor, followersCount: instructor.followersCount + 1 }
          : instructor
      ));

      success('Suivi', 'Vous suivez maintenant cet instructeur');
    } catch (error) {
      console.error('Error following instructor:', error);
      showError('Erreur', 'Impossible de suivre cet instructeur');
    }
  };

  const handleUnfollow = async (instructorId: string) => {
    try {
      await followService.unfollowInstructor(instructorId);
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(instructorId);
        return newSet;
      });

      // Mettre à jour le compteur de followers localement
      setInstructors(prev => prev.map(instructor =>
        instructor._id === instructorId
          ? { ...instructor, followersCount: Math.max(0, instructor.followersCount - 1) }
          : instructor
      ));

      success('Ne plus suivre', 'Vous ne suivez plus cet instructeur');
    } catch (error) {
      console.error('Error unfollowing instructor:', error);
      showError('Erreur', 'Impossible de ne plus suivre cet instructeur');
    }
  };

  const handleViewProfile = (instructorId: string) => {
    navigate(`/dashboard/student/instructor/${instructorId}`);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <Crown size={32} color="#3B82F6" variant="Bold" />
          <h1 className="text-2xl font-bold text-gray-900">Classement des Instructeurs</h1>
        </div>
        <p className="text-gray-600">
          Découvrez les instructeurs les plus populaires de la plateforme
        </p>
      </div>

      {/* Podium Top 3 */}
      {!isLoading && instructors.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2ème place */}
          <div className="order-1 md:order-1">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-gray-300 p-6 text-center h-full flex flex-col">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {instructors[1].avatar ? (
                    <img
                      src={getFullFileUrl(instructors[1].avatar)}
                      alt={`${instructors[1].firstName} ${instructors[1].lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                      <span className="text-2xl font-bold text-gray-600">
                        {instructors[1].firstName[0]}{instructors[1].lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {instructors[1].firstName} {instructors[1].lastName}
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Profile2User size={16} color="#6B7280" />
                  <span>{instructors[1].followersCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Book1 size={16} color="#6B7280" />
                  <span>{instructors[1].coursesCount}</span>
                </div>
              </div>
              <div className="mt-auto">
                {followingIds.has(instructors[1]._id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollow(instructors[1]._id)}
                    className="w-full"
                  >
                    <TickCircle size={16} color="#10B981" />
                    Suivi
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleFollow(instructors[1]._id)}
                    className="w-full"
                  >
                    <Add size={16} color="#FFFFFF" />
                    Suivre
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 1ère place */}
          <div className="order-first md:order-2">
            <div className="bg-gradient-to-b from-yellow-50 to-white rounded-lg border-2 border-yellow-400 p-6 text-center h-full flex flex-col transform md:scale-105">
              <Crown size={32} color="#F59E0B" variant="Bold" className="mx-auto mb-2" />
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {instructors[0].avatar ? (
                    <img
                      src={getFullFileUrl(instructors[0].avatar)}
                      alt={`${instructors[0].firstName} ${instructors[0].lastName}`}
                      className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-yellow-200 flex items-center justify-center border-4 border-yellow-400">
                      <span className="text-3xl font-bold text-yellow-700">
                        {instructors[0].firstName[0]}{instructors[0].lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {instructors[0].firstName} {instructors[0].lastName}
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Profile2User size={16} color="#6B7280" />
                  <span className="font-semibold">{instructors[0].followersCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Book1 size={16} color="#6B7280" />
                  <span className="font-semibold">{instructors[0].coursesCount}</span>
                </div>
              </div>
              <div className="mt-auto">
                {followingIds.has(instructors[0]._id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollow(instructors[0]._id)}
                    className="w-full"
                  >
                    <TickCircle size={16} color="#10B981" />
                    Suivi
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleFollow(instructors[0]._id)}
                    className="w-full"
                  >
                    <Add size={16} color="#FFFFFF" />
                    Suivre
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 3ème place */}
          <div className="order-2 md:order-3">
            <div className="bg-gradient-to-b from-orange-50 to-white rounded-lg border-2 border-orange-300 p-6 text-center h-full flex flex-col">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {instructors[2].avatar ? (
                    <img
                      src={getFullFileUrl(instructors[2].avatar)}
                      alt={`${instructors[2].firstName} ${instructors[2].lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-orange-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-orange-200 flex items-center justify-center border-4 border-orange-300">
                      <span className="text-2xl font-bold text-orange-700">
                        {instructors[2].firstName[0]}{instructors[2].lastName[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {instructors[2].firstName} {instructors[2].lastName}
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Profile2User size={16} color="#6B7280" />
                  <span>{instructors[2].followersCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Book1 size={16} color="#6B7280" />
                  <span>{instructors[2].coursesCount}</span>
                </div>
              </div>
              <div className="mt-auto">
                {followingIds.has(instructors[2]._id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollow(instructors[2]._id)}
                    className="w-full"
                  >
                    <TickCircle size={16} color="#10B981" />
                    Suivi
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleFollow(instructors[2]._id)}
                    className="w-full"
                  >
                    <Add size={16} color="#FFFFFF" />
                    Suivre
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reste du classement */}
      {!isLoading && instructors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {instructors.length >= 3 ? 'Classement complet' : 'Classement des Instructeurs'}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {(instructors.length >= 3 ? instructors.slice(3) : instructors).map((instructor, index) => {
              const rank = instructors.length >= 3 ? index + 4 : index + 1;
              return (
                <div
                  key={instructor._id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${getRankBg(rank)}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`text-2xl font-bold ${getRankColor(rank)} w-8 text-center`}>
                      {rank}
                    </div>
                    {instructor.avatar ? (
                      <img
                        src={getFullFileUrl(instructor.avatar)}
                        alt={`${instructor.firstName} ${instructor.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {instructor.firstName[0]}{instructor.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {instructor.firstName} {instructor.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Profile2User size={14} color="#6B7280" />
                          <span>{instructor.followersCount} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Book1 size={14} color="#6B7280" />
                          <span>{instructor.coursesCount} cours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProfile(instructor._id)}
                    >
                      Voir profil
                    </Button>
                    {followingIds.has(instructor._id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnfollow(instructor._id)}
                      >
                        <TickCircle size={16} color="#10B981" />
                        Suivi
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleFollow(instructor._id)}
                      >
                        <Add size={16} color="#FFFFFF" />
                        Suivre
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-24 h-9 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {!isLoading && instructors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Crown size={48} color="#9CA3AF" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun instructeur trouvé
          </h3>
          <p className="text-gray-600">
            Le classement sera disponible bientôt
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
