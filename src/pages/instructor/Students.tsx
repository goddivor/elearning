import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { People, Book1, TrendUp, Medal, Eye } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import { EnrollmentService, type InstructorStudent } from '@/services/enrollmentService';
import { useToast } from '@/contexts/toast-context';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { getFullFileUrl } from '@/utils/fileUtils';

const InstructorStudents = () => {
  useTitle('Mes Étudiants');
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await EnrollmentService.getInstructorStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
      showError('Erreur', 'Impossible de charger la liste des étudiants');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 20) return 'text-orange-600';
    return 'text-gray-600';
  };

  const studentColumns: Column<InstructorStudent>[] = [
    {
      key: 'firstName',
      title: 'Étudiant',
      render: (_, student) => (
        <div className="flex items-center gap-3">
          {student.avatar ? (
            <img
              src={getFullFileUrl(student.avatar)}
              alt={`${student.firstName} ${student.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {student.firstName[0]}{student.lastName[0]}
              </span>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">{student.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalCourses',
      title: 'Cours inscrits',
      render: (count) => (
        <div className="flex items-center gap-2">
          <Book1 size={16} color="#3B82F6" />
          <span className="text-sm font-medium text-gray-900">{count}</span>
        </div>
      ),
    },
    {
      key: 'completedCourses',
      title: 'Cours terminés',
      render: (count) => (
        <div className="flex items-center gap-2">
          <Medal size={16} color="#10B981" />
          <span className="text-sm font-medium text-gray-900">{count}</span>
        </div>
      ),
    },
    {
      key: 'averageProgress',
      title: 'Progression moyenne',
      render: (progress) => (
        <div className="flex items-center gap-2">
          <TrendUp size={16} color="#F59E0B" />
          <span className={`text-sm font-semibold ${getProgressColor(progress)}`}>
            {progress}%
          </span>
        </div>
      ),
    },
    {
      key: 'enrollments',
      title: 'Status',
      render: (enrollments: InstructorStudent['enrollments']) => {
        const hasActive = enrollments.some(e => e.status === 'active');
        const allCompleted = enrollments.every(e => e.status === 'completed');

        if (allCompleted) {
          return <Badge variant="success" size="sm">Tous terminés</Badge>;
        }
        if (hasActive) {
          return <Badge variant="primary" size="sm">En cours</Badge>;
        }
        return <Badge variant="default" size="sm">Inscrit</Badge>;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, student) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/dashboard/instructor/student/${student.studentId}`)}
          title="Voir le profil"
        >
          <Eye size={16} color="#6B7280" />
        </Button>
      ),
    },
  ];

  // Calcul des statistiques
  const totalStudents = students.length;
  const totalEnrollments = students.reduce((sum, s) => sum + s.totalCourses, 0);
  const averageProgress = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length)
    : 0;
  const activeStudents = students.filter(s =>
    s.enrollments.some(e => e.status === 'active')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <People size={32} color="#3B82F6" variant="Bold" />
          <h1 className="text-2xl font-bold text-gray-900">Mes Étudiants</h1>
        </div>
        <p className="text-gray-600">
          Suivez la progression et les performances de vos étudiants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Étudiants</h3>
            <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-100">
              <People size={20} color="#3B82F6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          <p className="text-sm text-gray-600 mt-1">Étudiants uniques</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Inscriptions</h3>
            <div className="p-2 rounded-lg border bg-green-50 text-green-600 border-green-100">
              <Book1 size={20} color="#10B981" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
          <p className="text-sm text-gray-600 mt-1">Total des inscriptions</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Progression Moyenne</h3>
            <div className="p-2 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">
              <TrendUp size={20} color="#F59E0B" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
          <p className="text-sm text-gray-600 mt-1">Performance globale</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Étudiants Actifs</h3>
            <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-100">
              <Medal size={20} color="#8B5CF6" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
          <p className="text-sm text-gray-600 mt-1">En cours d'apprentissage</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={studentColumns}
          data={filteredStudents}
          loading={loading}
          emptyState={
            <div className="text-center py-12 flex flex-col items-center">
              <People size={48} color="#9CA3AF" className="mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun étudiant trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Aucun étudiant ne correspond à votre recherche.'
                  : "Aucun étudiant n'est inscrit à vos cours pour le moment."}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default InstructorStudents;
