/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Book1 } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import DataTable, { type Column } from '@/components/ui/DataTable';
import StatsCard from '@/components/ui/StatsCard';
import Modal from '@/components/ui/Modal';
import Dropdown from '@/components/ui/Dropdown';
import { courseService, type Course, type CourseStats } from '@/services/courseService';

const AdminCourses = () => {
  useTitle("Gestion des Cours");
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, statsData] = await Promise.all([
        courseService.getAllCourses(),
        courseService.getCourseStats()
      ]);
      setCourses(coursesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId: string) => {
    try {
      await courseService.togglePublishCourse(courseId);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la publication/dépublication:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseService.deleteCourse(courseId);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses;

    // Filtrer par statut
    if (filterStatus === 'published') {
      filtered = filtered.filter(course => course.isPublished);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(course => !course.isPublished);
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(course => course.category === filterCategory);
    }

    return filtered;
  };

  const filteredCourses = getFilteredCourses();
  const categories = [...new Set(courses.map(c => c.category))];

  const courseColumns: Column<Course>[] = [
    {
      key: 'select',
      title: '',
      width: '50px',
      render: (_, course) => (
        <input
          type="checkbox"
          checked={selectedCourses.includes(course.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCourses([...selectedCourses, course.id]);
            } else {
              setSelectedCourses(selectedCourses.filter(id => id !== course.id));
            }
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'title',
      title: 'Cours',
      sortable: true,
      render: (_, course) => (
        <div className="flex items-center">
          {course.thumbnailUrl ? (
            <img 
              src={course.thumbnailUrl} 
              alt={course.title}
              className="w-12 h-12 object-cover rounded-lg mr-3"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 line-clamp-1">
              {course.title}
            </div>
            <div className="text-sm text-gray-500">{course.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'instructor',
      title: 'Instructeur',
      sortable: true,
      render: (_, course) => (
        <div>
          <div className="text-sm text-gray-900">
            {course.instructor.firstName} {course.instructor.lastName}
          </div>
          <div className="text-xs text-gray-500">{course.instructor.email}</div>
        </div>
      )
    },
    {
      key: 'level',
      title: 'Niveau',
      sortable: true,
      render: (level) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          level === 'beginner' ? 'bg-green-100 text-green-800' :
          level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {level === 'beginner' ? 'Débutant' :
           level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
        </span>
      )
    },
    {
      key: 'enrolledStudents',
      title: 'Étudiants',
      sortable: true,
      render: (count) => (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-900">{count}</span>
        </div>
      )
    },
    {
      key: 'averageRating',
      title: 'Note',
      sortable: true,
      render: (rating, course) => (
        <div className="flex items-center">
          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm text-gray-700">
            {rating.toFixed(1)} ({course.totalReviews})
          </span>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Prix',
      sortable: true,
      render: (price) => (
        <span className="text-sm font-medium text-gray-900">
          {price === 0 ? 'Gratuit' : `${price}€`}
        </span>
      )
    },
    {
      key: 'isPublished',
      title: 'Statut',
      sortable: true,
      render: (isPublished, course) => (
        <button
          onClick={() => handleTogglePublish(course.id)}
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
            isPublished ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
            'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
        >
          {isPublished ? 'Publié' : 'Brouillon'}
        </button>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, course) => (
        <Dropdown
          trigger={
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          }
          items={[
            {
              label: 'Voir détails',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ),
              onClick: () => {
                setViewingCourse(course);
                setIsViewModalOpen(true);
              }
            },
            {
              label: course.isPublished ? 'Dépublier' : 'Publier',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              onClick: () => handleTogglePublish(course.id)
            },
            {
              label: 'Supprimer',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ),
              onClick: () => handleDeleteCourse(course.id),
              destructive: true
            }
          ]}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Book1 size={32} color="#1D4ED8" variant="Bold" />
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Cours"
          value={loading ? "..." : stats?.totalCourses || 0}
          change={`${stats?.publishedCourses || 0} publiés`}
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />

        <StatsCard
          title="Inscriptions"
          value={loading ? "..." : stats?.totalEnrollments || 0}
          change="+12% ce mois"
          changeType="increase"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Note Moyenne"
          value={loading ? "..." : stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
          change="★★★★☆"
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.837-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />

        <StatsCard
          title="Revenus"
          value={loading ? "..." : `${stats?.totalRevenue || 0}€`}
          change="+8.2% ce mois"
          changeType="increase"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Tous</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Toutes</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-500">
            {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedCourses.length} cours sélectionné{selectedCourses.length > 1 ? 's' : ''}
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Publier
              </button>
              <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
                Brouillon
              </button>
              <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={courseColumns}
          data={filteredCourses}
          loading={loading}
        />
      </div>

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
                <h4 className="font-medium text-gray-900">Informations générales</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div><strong>Catégorie:</strong> {viewingCourse.category}</div>
                  <div><strong>Niveau:</strong> {viewingCourse.level}</div>
                  <div><strong>Prix:</strong> {viewingCourse.price === 0 ? 'Gratuit' : `${viewingCourse.price}€`}</div>
                  <div><strong>Durée:</strong> {Math.floor(viewingCourse.duration / 60)}h {viewingCourse.duration % 60}min</div>
                  <div><strong>Leçons:</strong> {viewingCourse.totalLessons}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Statistiques</h4>
                <div className="mt-2 space-y-2 text-sm">
                  <div><strong>Inscrits:</strong> {viewingCourse.enrolledStudents}</div>
                  <div><strong>Note moyenne:</strong> {viewingCourse.averageRating.toFixed(1)}/5</div>
                  <div><strong>Avis:</strong> {viewingCourse.totalReviews}</div>
                  <div><strong>Statut:</strong> {viewingCourse.isPublished ? 'Publié' : 'Brouillon'}</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="mt-2 text-sm text-gray-600">{viewingCourse.description}</p>
            </div>
            {viewingCourse.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Tags</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewingCourse.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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