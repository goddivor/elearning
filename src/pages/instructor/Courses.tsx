import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Book,
  Add,
  Edit,
  Eye,
  Trash,
  Grid2,
  Category,
} from "iconsax-react";
import useTitle from "@/hooks/useTitle";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { courseService, type Course } from "@/services/courseService";
import { useToast } from '@/contexts/toast-context';

const InstructorCourses = () => {
  useTitle("Mes Cours");
  const { success, error: showError } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await courseService.getCoursesByInstructor();
      setCourses(data);
    } catch {
      showError("Erreur de chargement", "Erreur lors du chargement des cours");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      success("Cours supprimé", "Cours supprimé avec succès");
      loadCourses();
    } catch {
      showError("Erreur de suppression", "Erreur lors de la suppression du cours");
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    try {
      await courseService.togglePublishCourse(courseId);
      success("Statut modifié", "Statut du cours modifié avec succès");
      loadCourses();
    } catch {
      showError("Erreur de statut", "Erreur lors de la modification du statut");
    }
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && course.isPublished) ||
      (statusFilter === "draft" && !course.isPublished);

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const courseColumns: Column<Course>[] = [
    {
      key: "title",
      title: "Cours",
      render: (_, course) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Book size={20} color="#1D4ED8" variant="Bold" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {course.title}
            </div>
            <div className="text-sm text-gray-500">
              {course.description.substring(0, 60)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: "Catégorie",
      render: (category) => (
        <span className="text-sm text-gray-600 capitalize">{category}</span>
      ),
    },
    {
      key: "level",
      title: "Niveau",
      render: (level) => (
        <Badge
          variant={
            level === "beginner"
              ? "success"
              : level === "intermediate"
              ? "warning"
              : "danger"
          }
          size="sm"
        >
          {level === "beginner"
            ? "Débutant"
            : level === "intermediate"
            ? "Intermédiaire"
            : "Avancé"}
        </Badge>
      ),
    },
    {
      key: "isPublished",
      title: "Statut",
      render: (isPublished, course) => (
        <button
          onClick={() => handleTogglePublish(course.id)}
          className="focus:outline-none"
        >
          <Badge variant={isPublished ? "success" : "warning"} size="sm">
            {isPublished ? "Publié" : "Brouillon"}
          </Badge>
        </button>
      ),
    },
    {
      key: "enrolledCount",
      title: "Étudiants",
      render: (count) => (
        <span className="text-sm font-medium text-gray-900">{count || 0}</span>
      ),
    },
    {
      key: "price",
      title: "Prix",
      render: (price) => (
        <span className="text-sm font-medium text-gray-900">
          {price === 0 ? "Gratuit" : `${price}€`}
        </span>
      ),
    },
    {
      key: "averageRating",
      title: "Note",
      render: (rating) => (
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {rating > 0 ? rating.toFixed(1) : "N/A"}
          </span>
          {rating > 0 && <span className="text-yellow-400 ml-1">★</span>}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, course) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(`/dashboard/instructor/course/${course.id}`, "_blank")}
            title="Prévisualiser"
          >
            <Eye size={16} color="#6B7280" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              window.open(`/dashboard/instructor/course-builder/${course.id}`, "_blank")
            }
            title="Modifier"
          >
            <Edit size={16} color="#3B82F6" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteCourse(course.id)}
            className="text-red-600 hover:text-red-700"
            title="Supprimer"
          >
            <Trash size={16} color="#EF4444" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Book size={32} color="#1D4ED8" variant="Bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
            <p className="text-gray-600 mt-1">Gérez et organisez vos cours</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
              onClick={() => setViewMode("table")}
              title="Vue tableau"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table" ? "bg-white shadow-sm" : ""
              }`}
              >
              <Category
                size={18}
                color={viewMode === "table" ? "#2563eb" : "#6b7280"}
              />
              </button>
              <button
              onClick={() => setViewMode("grid")}
              title="Vue grille"
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              }`}
              >
              <Grid2
                size={18}
                color={viewMode === "grid" ? "#2563eb" : "#6b7280"}
              />
              </button>
            </div>

          <Button className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Link
              to="/dashboard/instructor/course-builder"
              className="flex items-center space-x-2"
            >
              <Add color="white" size={20} />
              <span>Nouveau Cours</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="programming">Programmation</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="business">Business</option>
              <option value="science">Science</option>
              <option value="mathematics">Mathématiques</option>
              <option value="languages">Langues</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <DataTable
            columns={courseColumns}
            data={filteredCourses}
            loading={loading}
            emptyState={
                <div className="text-center py-12 flex flex-col items-center">
                <Book size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun cours trouvé
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  categoryFilter !== "all"
                  ? "Aucun cours ne correspond à vos critères de recherche."
                  : "Vous n'avez pas encore créé de cours."}
                </p>
                <div className="flex justify-center">
                  <Button className="bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Link
                    to="/dashboard/instructor/course-builder"
                    className="flex items-center space-x-2"
                  >
                    <Add size={20} color="white" />
                    <span>Créer mon premier cours</span>
                  </Link>
                  </Button>
                </div>
                </div>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-200 relative">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Book size={40} color="#9CA3AF" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={course.isPublished ? "success" : "warning"}
                    size="sm"
                  >
                    {course.isPublished ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{course.enrolledStudents || 0} étudiants</span>
                  <span>
                    {course.price === 0 ? "Gratuit" : `${course.price}€`}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/dashboard/instructor/course-builder/${course.id}`, "_blank")}
                    title="Modifier"
                  >
                    <Edit size={14} color="#3B82F6" className="mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/dashboard/instructor/course/${course.id}`, "_blank")}
                    title="Prévisualiser"
                  >
                    <Eye size={14} color="#6B7280" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCourse(course.id)}
                    title="Supprimer"
                    className="hover:text-red-600"
                  >
                    <Trash size={14} color="#EF4444" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
