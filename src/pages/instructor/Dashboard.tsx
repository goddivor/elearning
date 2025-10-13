import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book, People, Play, TrendUp, Category, Add } from "iconsax-react";
import useTitle from "@/hooks/useTitle";
import MetricCard from "@/components/ui/MetricCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { courseService, type Course } from "@/services/courseService";
import { useToast } from "@/contexts/toast-context";

interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  averageRating: number;
}

const InstructorDashboard = () => {
  useTitle("Dashboard Instructeur");
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    averageRating: 0,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, coursesData] = await Promise.all([
        courseService.getInstructorStats(),
        courseService.getCoursesByInstructor(),
      ]);

      setStats(statsData);
      // Ne garder que les 5 cours les plus récents
      setCourses(coursesData.slice(0, 5));
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
      showError(
        "Erreur de chargement",
        "Impossible de charger les données du dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const courseColumns: Column<Course>[] = [
    {
      key: "title",
      title: "Cours",
      render: (_, course) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Book size={20} color="#1D4ED8" variant="Bold" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {course.title}
            </div>
            <div className="text-sm text-gray-500">
              {course.description.length > 50
                ? `${course.description.substring(0, 50)}...`
                : course.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "isPublished",
      title: "Statut",
      render: (isPublished) => (
        <Badge
          variant={isPublished ? "success" : "warning"}
          size="sm"
        >
          {isPublished ? "Publié" : "Brouillon"}
        </Badge>
      ),
    },
    {
      key: "enrolledStudents",
      title: "Étudiants",
      render: (count) => (
        <span className="text-sm font-medium text-gray-900">
          {count} inscrits
        </span>
      ),
    },
    {
      key: "updatedAt",
      title: "Dernière MAJ",
      render: (date) => new Date(date).toLocaleDateString("fr-FR"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Category size={32} color="#1D4ED8" variant="Bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Instructeur
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos cours et suivez vos étudiants
            </p>
          </div>
        </div>
        <Button
          className="flex items-center space-x-2"
          style={{ backgroundColor: "#1D4ED8" }}
          onClick={() => navigate("/dashboard/instructor/courses")}
        >
          <Add color="white" size={20} />
          <span>Nouveau Cours</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Mes Cours"
          value={loading ? "..." : stats.totalCourses.toString()}
          change={stats.totalCourses > 0 && stats.publishedCourses > 0 ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0}
          trend="up"
          icon={<Book size={24} color="#1D4ED8" variant="Bold" />}
          description={`${stats.draftCourses || 0} brouillon${stats.draftCourses > 1 ? 's' : ''}`}
          color="#1D4ED8"
        />

        <MetricCard
          title="Cours Publiés"
          value={loading ? "..." : stats.publishedCourses.toString()}
          change={stats.totalCourses > 0 && stats.publishedCourses > 0 ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0}
          trend="up"
          icon={<Play size={24} color="#059669" variant="Bold" />}
          description="En ligne actuellement"
          color="#059669"
        />

        <MetricCard
          title="Total Étudiants"
          value={loading ? "..." : (stats.totalStudents || 0).toString()}
          change={stats.totalCourses > 0 && stats.totalStudents > 0 ? Math.round(stats.totalStudents / stats.totalCourses) : 0}
          trend="up"
          icon={<People size={24} color="#7C3AED" variant="Bold" />}
          description="Inscrits à mes cours"
          color="#7C3AED"
        />

        <MetricCard
          title="Note Moyenne"
          value={loading ? "..." : stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
          change={stats.averageRating > 0 ? Math.round((stats.averageRating / 5) * 100) : 0}
          trend="up"
          icon={<TrendUp size={24} color="#DC2626" variant="Bold" />}
          description="Sur 5 étoiles"
          color="#DC2626"
        />
      </div>

      {/* Recent Courses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mes Cours Récents
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Derniers cours créés ou modifiés
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Link
              to="/dashboard/instructor/courses"
              className="flex items-center space-x-2"
            >
              <span>Voir tous</span>
              <span>→</span>
            </Link>
          </Button>
        </div>

        <DataTable
          columns={courseColumns}
          data={courses}
          loading={loading}
          pagination={false}
          emptyState={
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun cours
              </h3>
              <p className="text-gray-500">
                Créez votre premier cours pour commencer.
              </p>
            </div>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Add size={24} color="#1D4ED8" variant="Bold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nouveau Cours
              </h3>
              <p className="text-sm text-gray-500">Créer un nouveau cours</p>
            </div>
          </div>
          <Button
            className="w-full"
            style={{ backgroundColor: "#1D4ED8" }}
            onClick={() => navigate("/dashboard/instructor/courses")}
          >
            Créer un cours
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <People size={24} color="#059669" variant="Bold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mes Étudiants
              </h3>
              <p className="text-sm text-gray-500">Voir tous mes étudiants</p>
            </div>
          </div>
          <Button
            className="w-full"
            style={{ backgroundColor: "#059669" }}
            onClick={() => navigate("/dashboard/instructor/students")}
          >
            Voir les étudiants
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendUp size={24} color="#7C3AED" variant="Bold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500">Rapports et statistiques</p>
            </div>
          </div>
          <Button
            className="w-full"
            style={{ backgroundColor: "#7C3AED" }}
            onClick={() => navigate("/dashboard/instructor/analytics")}
          >
            Voir les rapports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
