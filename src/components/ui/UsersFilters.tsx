// React import removed - not needed with new JSX transform
import { SearchNormal1, CloseCircle, Filter } from 'iconsax-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface UserFilters {
  search: string;
  role: string;
  status: string;
  createdAfter: string;
  createdBefore: string;
}

interface UsersFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onClearFilters: () => void;
  isVisible: boolean;
}

export default function UsersFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isVisible,
}: UsersFiltersProps) {
  if (!isVisible) return null;

  const handleFilterChange = <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const roleOptions = [
    { label: "Tous les rôles", value: "" },
    { label: "Administrateur", value: "admin" },
    { label: "Instructeur", value: "instructor" },
    { label: "Étudiant", value: "student" },
  ];

  const statusOptions = [
    { label: "Tous les statuts", value: "" },
    { label: "Actif", value: "active" },
    { label: "Inactif", value: "inactive" },
  ];

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== ""
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} color="#6B7280" />
          <h3 className="text-lg font-medium text-gray-900">Filtres avancés</h3>
          {hasActiveFilters && (
            <Badge variant="primary" size="sm">
              Filtres actifs
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800 flex items-center space-x-1"
          >
            <CloseCircle size={16} color="currentColor" />
            <span>Réinitialiser</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Input
            label="Recherche"
            placeholder="Nom, email..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <SearchNormal1
            size={18}
            color="#6B7280"
            className="absolute right-3 top-9 transform"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôle
          </label>
          <select
            value={filters.role || ""}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filters */}
        <div>
          <Input
            type="date"
            label="Créé après"
            value={filters.createdAfter || ""}
            onChange={(e) => handleFilterChange("createdAfter", e.target.value)}
          />
        </div>

        <div>
          <Input
            type="date"
            label="Créé avant"
            value={filters.createdBefore || ""}
            onChange={(e) => handleFilterChange("createdBefore", e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Filtres rapides :
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleFilterChange("status", "active")}
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-full"
          >
            Utilisateurs actifs
          </Button>
          <Button
            onClick={() => handleFilterChange("status", "inactive")}
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-full"
          >
            Utilisateurs inactifs
          </Button>
          <Button
            onClick={() => handleFilterChange("role", "instructor")}
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full"
          >
            Instructeurs seulement
          </Button>
          <Button
            onClick={() => handleFilterChange("role", "student")}
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full"
          >
            Étudiants seulement
          </Button>
          <Button
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(
                today.getTime() - 30 * 24 * 60 * 60 * 1000
              );
              handleFilterChange(
                "createdAfter",
                lastMonth.toISOString().split("T")[0]
              );
            }}
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-full"
          >
            Créés ce mois
          </Button>
        </div>
      </div>
    </div>
  );
}