import {
  Profile,
  People,
  UserTag,
  Add,
  Import,
  Export,
  Filter,
} from "iconsax-react";
import Button from "@/components/ui/Button";

type UserRole = "admin" | "instructor" | "student";

interface RoleTabsProps {
  activeRole: UserRole | "all";
  onRoleChange: (role: UserRole | "all") => void;
  counts: {
    all: number;
    admin: number;
    instructor: number;
    student: number;
  };
  onCreateUser: () => void;
  onImportUsers: () => void;
  onExportUsers: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

const roleConfig = {
  all: {
    label: "Tous",
    icon: People,
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  admin: {
    label: "Administrateurs",
    icon: Profile,
    color: "#DC2626",
    bgColor: "#FEF2F2",
  },
  instructor: {
    label: "Instructeurs",
    icon: UserTag,
    color: "#059669",
    bgColor: "#F0FDF4",
  },
  student: {
    label: "Étudiants",
    icon: People,
    color: "#1D4ED8",
    bgColor: "#EFF6FF",
  },
};

export default function UsersRoleTabs({
  activeRole,
  onRoleChange,
  counts,
  onCreateUser,
  onImportUsers,
  onExportUsers,
  onToggleFilters,
  showFilters,
}: RoleTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header with Actions */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Gestion des Utilisateurs
        </h2>
        <div className="flex items-center space-x-3">
          <Button
            onClick={onToggleFilters}
            size="sm"
            variant={showFilters ? "default" : "outline"}
            className="px-4 py-2 border rounded-lg flex items-center space-x-2"
          >
            <Filter size={16} color="currentColor" />
            <span className="ml-2">Filtres</span>
          </Button>

          <Button
            onClick={onExportUsers}
            variant="outline"
            size="sm"
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Export size={16} color="#6B7280" />
            <span className="ml-2">Exporter</span>
          </Button>

          <Button
            onClick={onImportUsers}
            size="sm"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
          >
            <Import size={16} color="white" />
            <span className="ml-2">Importer</span>
          </Button>

          <Button
            onClick={onCreateUser}
            size="sm"
            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg"
          >
            <Add size={16} color="white" />
            <span className="ml-2">Créer</span>
          </Button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="px-6">
        <div className="flex space-x-1 py-4">
          {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map(
            (role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              const isActive = activeRole === role;
              const count = counts[role as keyof typeof counts];

              return (
                <button
                  key={role}
                  onClick={() => onRoleChange(role as UserRole | "all")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `text-gray-900 border-2`
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent"
                  }`}
                  style={{
                    backgroundColor: isActive ? config.bgColor : "transparent",
                    borderColor: isActive ? config.color : "transparent",
                  }}
                >
                  <Icon
                    size={18}
                    color={isActive ? config.color : "#6B7280"}
                    variant={isActive ? "Bold" : "Outline"}
                  />
                  <span>{config.label}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      isActive ? "text-white" : "bg-gray-100 text-gray-600"
                    }`}
                    style={{
                      backgroundColor: isActive ? config.color : undefined,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
