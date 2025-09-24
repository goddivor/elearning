/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import type { ModalRef } from '@/types/modal-ref';
import { parseCSV, generateCSVTemplate, type ImportedUser, type ImportResult } from '@/utils/csv-import';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { X, Upload, Download, FileText, CheckCircle, XCircle, Eye, Question } from '@phosphor-icons/react';
import { useToast } from '@/contexts/toast-context';

interface CsvImportModalProps {
  onImport?: (users: ImportedUser[]) => void;
  onClose?: () => void;
}

type ImportStep = 'upload' | 'preview' | 'confirm';

const CsvImportModal = forwardRef<ModalRef, CsvImportModalProps>(
  ({ onImport, onClose }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        setCurrentStep('upload');
        setImportResult(null);
      },
      close: () => setIsOpen(false),
    }));

    const handleClose = () => {
      onClose?.();
      setIsOpen(false);
      setCurrentStep('upload');
      setImportResult(null);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    };

    const handleFileSelect = (file: File) => {
      if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        toast.error('Fichier invalide', 'Veuillez sélectionner un fichier CSV');
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const result = parseCSV(csvText);
          setImportResult(result);
          setCurrentStep('preview');
        } catch (error: any) {
          toast.error('Erreur de parsing', error.message);
          console.error('Erreur lors du parsing CSV:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Erreur de lecture', 'Impossible de lire le fichier');
        setIsProcessing(false);
      };
      
      reader.readAsText(file, 'utf-8');
    };

    const handleFileDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    };

    const handleImportConfirm = () => {
      if (!importResult) return;
      
      const validUsers = importResult.users.filter(user => user.isValid);
      if (validUsers.length === 0) {
        toast.error('Aucun utilisateur valide', 'Corrigez les erreurs avant d\'importer');
        return;
      }
      
      onImport?.(validUsers);
      toast.success(
        'Import réussi',
        `${validUsers.length} utilisateur${validUsers.length > 1 ? 's importés' : ' importé'} avec succès`
      );
      handleClose();
    };

    const getRoleBadge = (role: string) => {
      switch (role) {
        case 'admin': return <Badge variant="danger" size="sm">Administrateur</Badge>;
        case 'instructor': return <Badge variant="primary" size="sm">Instructeur</Badge>;
        case 'student': return <Badge variant="success" size="sm">Étudiant</Badge>;
        default: return <Badge variant="default" size="sm">{role}</Badge>;
      }
    };

    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload size={24} color="#1D4ED8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Importer des utilisateurs
                </h2>
                <p className="text-sm text-gray-500">
                  {currentStep === 'upload' && 'Téléchargez un fichier CSV'}
                  {currentStep === 'preview' && 'Vérifiez les données importées'}
                  {currentStep === 'confirm' && 'Confirmez l\'importation'}
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

          {/* Steps Indicator */}
          <div className="flex items-center justify-center p-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                currentStep === 'upload' ? 'text-blue-600' : 'text-green-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'upload' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {currentStep === 'upload' ? '1' : <CheckCircle size={16} />}
                </div>
                <span className="text-sm font-medium">Téléchargement</span>
              </div>
              <div className={`w-8 h-0.5 ${
                ['preview', 'confirm'].includes(currentStep) ? 'bg-green-300' : 'bg-gray-300'
              }`} />
              <div className={`flex items-center space-x-2 ${
                currentStep === 'preview' 
                  ? 'text-blue-600' 
                  : currentStep === 'confirm' 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'preview' 
                    ? 'bg-blue-100 text-blue-600'
                    : currentStep === 'confirm'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep === 'confirm' ? <CheckCircle size={16} /> : '2'}
                </div>
                <span className="text-sm font-medium">Aperçu</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Upload Step */}
            {currentStep === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
                      dragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleFileDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                  >
                    <div className="flex flex-col items-center">
                      <FileText size={48} color="#6B7280" className="mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                        Glissez-déposez votre fichier CSV
                      </h3>
                      <p className="text-gray-500 mb-4 text-center">
                        ou cliquez pour sélectionner un fichier
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Traitement...' : 'Sélectionner un fichier'}
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Download size={20} color="#D97706" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Besoin d'un modèle ?
                      </p>
                      <p className="text-xs text-yellow-600">
                        Téléchargez le modèle CSV avec les colonnes requises
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateCSVTemplate}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Télécharger le modèle
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">Format requis :</h4>
                    <Tooltip
                      content={
                        <div>
                          <p className="font-medium mb-1">Mot de passe par défaut :</p>
                          <p className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">TempPass123!</p>
                          <p className="text-xs mt-1 text-gray-300">
                            Tous les comptes créés utiliseront ce mot de passe temporaire
                          </p>
                        </div>
                      }
                      position="top"
                    >
                      <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors cursor-help">
                        <Question size={12} weight="bold" />
                      </div>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Colonnes requises :</h5>
                      <ul className="space-y-1 text-gray-600">
                        <li>• firstName (Prénom)</li>
                        <li>• lastName (Nom)</li>
                        <li>• email (Adresse email)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Colonnes optionnelles :</h5>
                      <ul className="space-y-1 text-gray-600">
                        <li>• role (admin, instructor, student)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {currentStep === 'preview' && importResult && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Eye size={20} color="#1D4ED8" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Total
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {importResult.users.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={20} color="#059669" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Valides
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {importResult.validCount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle size={20} color="#DC2626" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Erreurs
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {importResult.invalidCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nom complet
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Erreurs
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importResult.users.map((user, index) => (
                          <tr key={index} className={user.isValid ? '' : 'bg-red-50'}>
                            <td className="px-4 py-3">
                              {user.isValid ? (
                                <CheckCircle size={16} color="#059669" />
                              ) : (
                                <XCircle size={16} color="#DC2626" />
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-4 py-3">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-4 py-3">
                              {user.errors.length > 0 && (
                                <div className="text-xs text-red-600">
                                  {user.errors.join(', ')}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              {currentStep === 'preview' && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                >
                  Retour
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Annuler
              </Button>
              {currentStep === 'preview' && importResult && (
                <Button
                  onClick={handleImportConfirm}
                  disabled={importResult.validCount === 0}
                  className="flex items-center space-x-2"
                >
                  <Upload size={16} color="white" />
                  <span>
                    Importer {importResult.validCount} utilisateur{importResult.validCount > 1 ? 's' : ''}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CsvImportModal.displayName = 'CsvImportModal';

export default CsvImportModal;