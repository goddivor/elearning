import { useState, useEffect, useCallback } from "react";
import { Book, Eye, Edit, Trash, Grid2, Category, People, Star1 } from "iconsax-react";
import useTitle from "@/hooks/useTitle";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MetricCard from "@/components/ui/MetricCard";
import { courseService, type Course, type CourseStats } from "@/services/courseService";
import { avatarService } from "@/services/avatarService";
import { useToast } from "@/contexts/toast-context";

const AdminCourses = () => {
  useTitle("Gestion des Cours");
  const { success, error: showError } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [instructorFilter, setInstructorFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesData, statsData] = await Promise.all([
        courseService.getAllCourses(),
        courseService.getCourseStats()
      ]);
      setCourses(coursesData);
      setStats(statsData);
    } catch (error) {
      showError("Erreur de chargement", "Erreur lors du chargement des cours");
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async (courseId: string) => {
    try {
      await courseService.togglePublishCourse(courseId);
      success("Statut modifié", "Statut du cours modifié avec succès");
      loadData();
    } catch (error) {
      showError("Erreur de statut", "Erreur lors de la modification du statut");
      console.error("Erreur lors de la publication/dépublication:", error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      try {
        await courseService.deleteCourse(courseId);
        success("Cours supprimé", "Cours supprimé avec succès");
        loadData();
      } catch (error) {
        showError(
          "Erreur de suppression",
          "Erreur lors de la suppression du cours"
        );
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const instructorName =
      course.instructor &&
      course.instructor.firstName &&
      course.instructor.lastName
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : "Instructeur inconnu";

    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && course.isPublished) ||
      (statusFilter === "draft" && !course.isPublished);

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;

    const matchesInstructor =
      instructorFilter === "all" || instructorName === instructorFilter;

    return (
      matchesSearch && matchesStatus && matchesCategory && matchesInstructor
    );
  });

  const categories = [...new Set(courses.map((c) => c.category))];
  const instructors = [
    ...new Set(
      courses
        .filter(
          (c) => c.instructor && c.instructor.firstName && c.instructor.lastName
        )
        .map((c) => `${c.instructor!.firstName} ${c.instructor!.lastName}`)
    ),
  ];

  const courseColumns: Column<Course>[] = [
    {
      key: "select",
      title: (
        <input
          type="checkbox"
          checked={
            selectedCourses.length > 0 &&
            selectedCourses.length === filteredCourses.length
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCourses(filteredCourses.map((c) => c.id));
            } else {
              setSelectedCourses([]);
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      width: "50px",
      render: (_, course) => (
        <input
          type="checkbox"
          checked={selectedCourses.includes(course.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCourses([...selectedCourses, course.id]);
            } else {
              setSelectedCourses(
                selectedCourses.filter((id) => id !== course.id)
              );
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      key: "title",
      title: "Cours",
      sortable: true,
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
      key: "instructor",
      title: "Instructeur",
      sortable: true,
      render: (_, course) => {
        if (
          !course.instructor ||
          !course.instructor.firstName ||
          !course.instructor.lastName
        ) {
          return (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full mr-3 overflow-hidden bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">?</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Instructeur inconnu
                </div>
                <div className="text-xs text-gray-500">-</div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full mr-3 overflow-hidden">
              {course.instructor.avatar ? (
                <img
                  src={avatarService.getAvatarUrl(course.instructor.avatar)}
                  alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {course.instructor.firstName[0]}
                    {course.instructor.lastName[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {course.instructor.firstName} {course.instructor.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {course.instructor.email || "-"}
              </div>
            </div>
          </div>
        );
      },
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
      sortable: true,
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
      key: "enrolledStudents",
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
      key: "actions",
      title: "Actions",
      width: "200px",
      render: (_, course) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setViewingCourse(course);
              setIsViewModalOpen(true);
            }}
            title="Voir détails"
          >
            <Eye size={16} color="#6B7280" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              window.open(
                `/dashboard/instructor/course-builder/${course.id}`,
                "_blank"
              )
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
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Cours
            </h1>
            <p className="text-gray-600 mt-1">
              Supervisez et gérez tous les cours de la plateforme
            </p>
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
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Cours"
          value={loading ? "..." : (stats?.totalCourses || 0).toLocaleString()}
          change={12}
          trend="up"
          icon={<Book size={24} color="#1D4ED8" variant="Bold" />}
          description={`${stats?.publishedCourses || 0} publiés`}
          color="#1D4ED8"
        />

        <MetricCard
          title="Inscriptions"
          value={loading ? "..." : (stats?.totalEnrollments || 0).toLocaleString()}
          change={8}
          trend="up"
          icon={<People size={24} color="#059669" variant="Bold" />}
          description="Total d'étudiants"
          color="#059669"
        />

        <MetricCard
          title="Note Moyenne"
          value={loading ? "..." : stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          change={stats ? Math.round((stats.averageRating / 5) * 100) : 0}
          trend="up"
          icon={<Star1 size={24} color="#7C3AED" variant="Bold" />}
          description="Sur 5 étoiles"
          color="#7C3AED"
        />

        <MetricCard
          title="Revenus"
          value={loading ? "..." : `${(stats?.totalRevenue || 0).toLocaleString()}€`}
          change={15}
          trend="up"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          description="Total généré"
          color="#DC2626"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un cours ou un instructeur..."
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les instructeurs</option>
              {instructors.map((instructor) => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedCourses.length} cours sélectionné
                {selectedCourses.length > 1 ? "s" : ""}
              </span>
              <Button
                onClick={() => setSelectedCourses([])}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Désélectionner tout
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Publier
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Brouillon
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1 border border-red-400 text-red-700 hover:bg-red-50 rounded-lg"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  categoryFilter !== "all" ||
                  instructorFilter !== "all"
                    ? "Aucun cours ne correspond à vos critères de recherche."
                    : "Aucun cours n'a encore été créé sur la plateforme."}
                </p>
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

                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 rounded-full mr-2 overflow-hidden">
                    {course.instructor && course.instructor.avatar ? (
                      <img
                        src={avatarService.getAvatarUrl(
                          course.instructor.avatar
                        )}
                        alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {course.instructor &&
                          course.instructor.firstName &&
                          course.instructor.lastName
                            ? `${course.instructor.firstName[0]}${course.instructor.lastName[0]}`
                            : "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {course.instructor &&
                    course.instructor.firstName &&
                    course.instructor.lastName
                      ? `${course.instructor.firstName} ${course.instructor.lastName}`
                      : "Instructeur inconnu"}
                  </span>
                </div>

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
                    onClick={() => {
                      setViewingCourse(course);
                      setIsViewModalOpen(true);
                    }}
                    title="Voir détails"
                  >
                    <Eye size={14} color="#6B7280" className="mr-1" />
                    Détails
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        `/dashboard/instructor/course-builder/${course.id}`,
                        "_blank"
                      )
                    }
                    title="Modifier"
                  >
                    <Edit size={14} color="#3B82F6" />
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


      {/* Course Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewingCourse?.title}
        size="lg"
      >
        {viewingCourse && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  Informations générales
                </h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <strong>Catégorie:</strong> {viewingCourse.category}
                  </div>
                  <div>
                    <strong>Niveau:</strong> {viewingCourse.level}
                  </div>
                  <div>
                    <strong>Prix:</strong>{" "}
                    {viewingCourse.price === 0
                      ? "Gratuit"
                      : `${viewingCourse.price}€`}
                  </div>
                  <div>
                    <strong>Durée:</strong>{" "}
                    {Math.floor(viewingCourse.duration / 60)}h{" "}
                    {viewingCourse.duration % 60}min
                  </div>
                  <div>
                    <strong>Leçons:</strong> {viewingCourse.totalLessons}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Statistiques</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <strong>Inscrits:</strong> {viewingCourse.enrolledStudents}
                  </div>
                  <div>
                    <strong>Note moyenne:</strong>{" "}
                    {viewingCourse.averageRating.toFixed(1)}/5
                  </div>
                  <div>
                    <strong>Avis:</strong> {viewingCourse.totalReviews}
                  </div>
                  <div>
                    <strong>Statut:</strong>{" "}
                    {viewingCourse.isPublished ? "Publié" : "Brouillon"}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="mt-2 text-sm text-gray-600">
                {viewingCourse.description}
              </p>
            </div>
            {viewingCourse.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Tags</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewingCourse.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCourses;
