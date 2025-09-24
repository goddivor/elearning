import { forwardRef, useImperativeHandle, useState } from 'react';
import type { User } from '@/services/userService';
import type { ModalRef } from '@/types/modal-ref';
import { exportUsersToCSV, type ExportOptions } from '@/utils/csv-export';
import Button from '@/components/ui/Button';
import { X, Download, UserCheck } from '@phosphor-icons/react';
import { useToast } from '@/contexts/toast-context';

interface CsvExportModalProps {
  users: User[];
  onClose?: () => void;
}

const CsvExportModal = forwardRef<ModalRef, CsvExportModalProps>(
  ({ users, onClose }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const toast = useToast();
    
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
      includePersonalInfo: true,
      includeContactInfo: true,
      includeRoleSpecific: true,
      includeTimestamps: true,
      selectedRoles: ['all'],
      dateRange: undefined,
    });

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    const handleClose = () => {
      onClose?.();
      setIsOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    };

    const handleRoleChange = (role: string) => {
      if (role === 'all') {
        setExportOptions(prev => ({ ...prev, selectedRoles: ['all'] }));
      } else {
        setExportOptions(prev => {
          const newRoles = prev.selectedRoles.includes('all') 
            ? [role]
            : prev.selectedRoles.includes(role)
              ? prev.selectedRoles.filter(r => r !== role)
              : [...prev.selectedRoles.filter(r => r !== 'all'), role];
          return { ...prev, selectedRoles: newRoles.length === 0 ? ['all'] : newRoles };
        });
      }
    };

    const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
      setExportOptions(prev => ({
        ...prev,
        dateRange: prev.dateRange 
          ? { ...prev.dateRange, [field]: value }
          : { start: field === 'start' ? value : '', end: field === 'end' ? value : '' }
      }));
    };

    const clearDateRange = () => {
      setExportOptions(prev => ({ ...prev, dateRange: undefined }));
    };

    const getFilteredUsersCount = (): number => {
      let filtered = users;
      
      if (!exportOptions.selectedRoles.includes('all')) {
        filtered = filtered.filter(user => exportOptions.selectedRoles.includes(user.role));
      }
      
      if (exportOptions.dateRange?.start && exportOptions.dateRange?.end) {
        const startDate = new Date(exportOptions.dateRange.start);
        const endDate = new Date(exportOptions.dateRange.end);
        filtered = filtered.filter(user => {
          const createdDate = new Date(user.createdAt);
          return createdDate >= startDate && createdDate <= endDate;
        });
      }
      
      return filtered.length;
    };

    const handleExport = async () => {
      setIsExporting(true);
      try {
        const exportedCount = exportUsersToCSV(users, exportOptions);
        toast.success(
          'Export réussi',
          `${exportedCount} utilisateur${exportedCount > 1 ? 's exportés' : ' exporté'} avec succès`
        );
        handleClose();
      } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        toast.error('Erreur d\'export', 'Une erreur est survenue lors de l\'export');
      } finally {
        setIsExporting(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download size={24} color="#059669" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Exporter les utilisateurs
                </h2>
                <p className="text-sm text-gray-500">
                  Configurer et exporter les données utilisateurs en CSV
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} color="#6B7280" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Filtrer par rôle</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRoleChange('all')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      exportOptions.selectedRoles.includes('all')
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous les rôles
                  </button>
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      exportOptions.selectedRoles.includes('admin')
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Administrateurs
                  </button>
                  <button
                    onClick={() => handleRoleChange('instructor')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      exportOptions.selectedRoles.includes('instructor')
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Instructeurs
                  </button>
                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      exportOptions.selectedRoles.includes('student')
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Étudiants
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Filtrer par date de création</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={exportOptions.dateRange?.start || ''}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={exportOptions.dateRange?.end || ''}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {exportOptions.dateRange && (
                    <div className="flex items-end">
                      <Button
                        onClick={clearDateRange}
                        variant="outline"
                        size="sm"
                        className="mb-0"
                      >
                        Effacer
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Colonnes à inclure</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includePersonalInfo}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includePersonalInfo: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Informations personnelles</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeContactInfo}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeContactInfo: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Informations de contact</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeRoleSpecific}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeRoleSpecific: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Rôle et statut</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTimestamps}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeTimestamps: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Horodatage</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck size={20} color="#1D4ED8" />
                  <span className="text-sm font-medium text-blue-900">
                    Aperçu: {getFilteredUsersCount()} utilisateur{getFilteredUsersCount() > 1 ? 's' : ''} seront exportés
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || getFilteredUsersCount() === 0}
              className="flex items-center space-x-2"
            >
              <Download size={16} color="white" />
              <span>{isExporting ? 'Export en cours...' : 'Exporter CSV'}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

CsvExportModal.displayName = 'CsvExportModal';

export default CsvExportModal;