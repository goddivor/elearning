/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useTitle from '@/hooks/useTitle';
import { courseService, type Course } from '@/services/courseService';
import { EnrollmentService } from '@/services/enrollmentService';
import { useToast } from '@/contexts/toast-context';
import { CourseCard } from '@/components/student/CourseCard';
import Button from '@/components/ui/Button';
import { SearchNormal1, Filter, Element3, Grid6, Sort } from 'iconsax-react';

const CourseCatalog = () => {
  useTitle('Catalogue de Cours');
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load view mode from localStorage on mount
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('catalog_view_mode');
    return (saved as 'grid' | 'list') || 'grid';
  });

  // UI States
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating' | 'price-asc' | 'price-desc'>('recent');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;

  const loadCatalogData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        courseService.getPublishedCourses(),
        courseService.getPublishedCategories(),
      ]);

      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading catalog:', error);
      showError('Erreur', 'Impossible de charger le catalogue de cours');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const applyFilters = useCallback(() => {
    let filtered = [...courses];

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Catégorie
    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    // Niveau
    if (selectedLevel) {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Prix
    if (priceFilter === 'free') {
      filtered = filtered.filter((course) => course.price === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((course) => course.price > 0);
    }

    // Tri
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
        break;
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [courses, searchQuery, selectedCategory, selectedLevel, priceFilter, sortBy]);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem('catalog_view_mode', viewMode);
  }, [viewMode]);

  const handleEnroll = async (courseId: string) => {
    try {
      await EnrollmentService.enrollInCourse({ courseId });
      success('Inscription réussie', 'Vous êtes maintenant inscrit à ce cours');
      navigate('/dashboard/student/courses');
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Impossible de s\'inscrire au cours';
      showError('Erreur d\'inscription', message);
    }
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/dashboard/student/course/${courseId}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setPriceFilter('all');
    setSortBy('recent');
  };

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedLevel ||
    priceFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
        </div>

        <div className="relative px-8 py-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-white mb-3">
              Découvrez Votre Prochain Cours
            </h1>
            <p className="text-blue-100 text-lg">
              Explorez notre collection de {filteredCourses.length} cours de qualité dispensés par des experts
            </p>
          </div>
        </div>
      </div>

      {/* Barre d'action améliorée */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Bouton Recherche */}
          <Button
            variant={showSearch ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 font-semibold"
          >
            <SearchNormal1 size={18} color={showSearch ? '#FFFFFF' : '#6B7280'} />
            Rechercher
          </Button>

          {/* Bouton Filtres */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 font-semibold relative"
          >
            <Filter size={18} color={showFilters ? '#FFFFFF' : '#6B7280'} />
            Filtres
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full shadow-lg">
                {[searchQuery, selectedCategory, selectedLevel, priceFilter !== 'all'].filter(Boolean).length}
              </span>
            )}
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sélecteur de tri */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <Sort size={18} color="#6B7280" variant="Bold" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-sm font-medium text-gray-700 border-none focus:ring-0 focus:outline-none cursor-pointer pr-8"
            >
              <option value="recent">Plus récents</option>
              <option value="popular">Plus populaires</option>
              <option value="rating">Mieux notés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {/* Toggle vue avec meilleur design */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid6 size={20} color={viewMode === 'grid' ? '#2563EB' : 'currentColor'} variant={viewMode === 'grid' ? 'Bold' : 'Outline'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Element3 size={20} color={viewMode === 'list' ? '#2563EB' : 'currentColor'} variant={viewMode === 'list' ? 'Bold' : 'Outline'} />
            </button>
          </div>
        </div>
      </div>

      {/* Panneau de recherche amélioré */}
      {showSearch && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <SearchNormal1
                size={22}
                color="#3B82F6"
                variant="Bold"
              />
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre, description, tags ou instructeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 text-lg border-2 border-blue-300 bg-white rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panneau de filtres amélioré */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter size={20} color="#3B82F6" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
              >
                Réinitialiser tout
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Niveau de difficulté
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
              >
                <option value="">Tous les niveaux</option>
                <option value="beginner">🟢 Débutant</option>
                <option value="intermediate">🟡 Intermédiaire</option>
                <option value="advanced">🔴 Avancé</option>
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Tarification
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
              >
                <option value="all">Tous les cours</option>
                <option value="free">💚 Gratuit uniquement</option>
                <option value="paid">💰 Payant uniquement</option>
              </select>
            </div>
          </div>

          {/* Résultats et filtres actifs */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {filteredCourses.length} résultat{filteredCourses.length > 1 ? 's' : ''}
                </p>
                {hasActiveFilters && (
                  <div className="flex gap-2">
                    {selectedCategory && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory('')} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {selectedLevel && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        {selectedLevel === 'beginner' ? 'Débutant' : selectedLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        <button onClick={() => setSelectedLevel('')} className="hover:text-purple-900">×</button>
                      </span>
                    )}
                    {priceFilter !== 'all' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        {priceFilter === 'free' ? 'Gratuit' : 'Payant'}
                        <button onClick={() => setPriceFilter('all')} className="hover:text-green-900">×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des cours - TODO: Ajouter CourseCard component */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : currentCourses.length === 0 ? (
        <div className="text-center py-12">
          <SearchNormal1 size={48} color="#9CA3AF" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun cours trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            Essayez de modifier vos critères de recherche
          </p>
          {hasActiveFilters && (
            <Button onClick={resetFilters}>Réinitialiser les filtres</Button>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {currentCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                onViewDetails={handleViewDetails}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCatalog;
