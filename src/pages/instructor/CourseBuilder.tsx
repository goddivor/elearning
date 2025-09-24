import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save2, 
  Eye, 
  Add, 
  Book, 
  Edit,
  Trash} from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { courseService, type Course, type CreateCourseDto } from '@/services/courseService';
import { useToast } from '@/contexts/toast-context';
import CourseBuilderSidebar from '@/components/course-builder/CourseBuilderSidebar';
import ModuleEditor from '@/components/course-builder/ModuleEditor';
import LessonEditor from '@/components/course-builder/LessonEditor';
import CourseSettings from '@/components/course-builder/CourseSettings';
import CoursePreview from '@/components/course-preview/CoursePreview';
import type { LocalFile } from '@/components/ui/DocumentUpload';
import ConfirmationModal from '@/components/modals/confirmation-modal';
import type { ModalRef } from '@/types/modal-ref';
import mediaService from '@/services/mediaService';
import moduleService from '@/services/moduleService';
import lessonService from '@/services/lessonService';

type BuilderMode = 'overview' | 'module' | 'lesson' | 'settings';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  duration: number;
  isActive: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'assignment' | '3d' | 'document';
  content: {
    type: string;
    videoUrl?: string;
    textContent?: string;
    documentUrl?: string;
    documentName?: string;
    documentType?: string;
    localDocument?: LocalFile; // Fichier local en attente d'upload
    localImages?: Array<{file: File; localUrl: string; id: string}>; // Images locales en attente d'upload (RichTextEditor)
    model3dUrl?: string;
    quizData?: {
      questions: Array<{
        id: string;
        type: 'multiple' | 'checkbox' | 'text' | 'fill-blanks' | 'ordering' | 'drag-drop' | 'audio';
        question: string;
        options: string[];
        correctAnswer: number | number[] | string | string[]; // Support different answer formats
        explanation: string;
        
        // Pour les questions avec images
        questionImage?: {
          file?: File;
          localUrl?: string;
          uploadedUrl?: string;
          name?: string;
        };
        
        // Pour le code syntax highlighting
        codeSnippet?: {
          code: string;
          language: string;
        };
        
        // Données spécifiques aux nouveaux types
        fillBlanksData?: {
          textWithBlanks: string;
          blanks: Array<{
            id: string;
            correctAnswers: string[];
            caseSensitive: boolean;
          }>;
        };
        
        orderingData?: {
          items: Array<{
            id: string;
            text: string;
            correctPosition: number;
          }>;
        };
        
        dragDropData?: {
          zones: Array<{
            id: string;
            label: string;
            acceptedItems: string[];
          }>;
          items: Array<{
            id: string;
            text: string;
            correctZoneId: string;
          }>;
        };
        
        audioData?: {
          audioFile?: File;
          localAudioUrl?: string;
          uploadedAudioUrl?: string;
          audioName?: string;
          duration?: number;
        };
      }>;
    };
    assignmentData?: {
      instructions?: string;
      dueDate?: string;
      maxPoints?: number;
      title?: string;
      instructionType?: 'text' | 'video' | 'document';
      instructionVideoUrl?: string;
      instructionDocumentUrl?: string;
      instructionDocumentName?: string;
      instructionDocumentType?: string;
      localInstructionDocument?: LocalFile;
      documentUrl?: string;
      videoUrl?: string;
      resourceLinks?: string[];
      submissionType?: 'file' | 'text' | 'url' | 'both';
      acceptedFormats?: string;
      maxFileSize?: number;
      allowLateSubmission?: boolean;
      gradingType?: 'points' | 'letter' | 'pass_fail';
      gradingCriteria?: string;
      autoGrade?: boolean;
      peerReview?: boolean;
    };
  };
  resources: string[];
  isFree: boolean;
  isActive: boolean;
}

// Course Overview Component
const CourseOverview = ({ 
  course, 
  setCourse, 
  modules,
  onAddModule,
  onEditModule,
  onDeleteModule 
}: {
  course: Partial<Course>;
  setCourse: (course: Partial<Course>) => void;
  modules: Module[];
  onAddModule: () => void;
  onEditModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
}) => {
  const totalDuration = modules.reduce((sum, module) => sum + module.duration, 0);
  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Course Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du cours
              </label>
              <Input
                value={course.title || ''}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Ex: Introduction à React.js"
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={course.description || ''}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Décrivez votre cours en quelques phrases..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
          </div>
        </div>

        {/* Course Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aperçu du contenu
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {modules.length}
              </div>
              <div className="text-sm text-gray-500">Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totalLessons}
              </div>
              <div className="text-sm text-gray-500">Leçons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}min
              </div>
              <div className="text-sm text-gray-500">Durée</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {course.enrolledStudents || 0}
              </div>
              <div className="text-sm text-gray-500">Étudiants</div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Structure du cours
            </h2>
            <Button
              onClick={onAddModule}
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white rounded"
            >
              <Add size={16} className="mr-2" color="white" />
              Ajouter un module
            </Button>
          </div>
          
          {modules.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <Book color="#9CA3AF" size={48} className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun module
              </h3>
              <p className="text-gray-500 mb-4">
              Commencez par créer votre premier module de cours.
              </p>
              <Button
                onClick={onAddModule}
                className="bg-blue-700 hover:bg-blue-800 text-white rounded"
              >
                <Add size={20} className="mr-2" color="white" />
                Créer le premier module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  onEdit={onEditModule}
                  onDelete={onDeleteModule}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Module Card Component
const ModuleCard = ({ 
  module, 
  index, 
  onEdit, 
  onDelete 
}: { 
  module: Module; 
  index: number; 
  onEdit: (moduleId: string) => void;
  onDelete: (moduleId: string) => void;
}) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
          {index + 1}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {module.title}
          </h3>
          <p className="text-sm text-gray-500">
            {module.lessons.length} leçons • {module.duration} min
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(module.id)}
          className="hover:text-blue-600"
        >
          <Edit color="#6B7280" size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDelete(module.id)}
          className="hover:text-red-600"
        >
          <Trash color="#EF4444" size={16} />
        </Button>
      </div>
    </div>
  </div>
);

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);
  const { success, error: showError, info } = useToast();
  
  useTitle(isEditing ? "Modifier le Cours" : "Créateur de Cours");

  // Helper function to calculate module duration from its lessons
  const calculateModuleDuration = (lessons: Lesson[]): number => {
    return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  };

  // Validate course prerequisites for preview
  const validateCourseForPreview = () => {
    const errors: string[] = [];
    
    // Vérifier le titre du cours
    if (!course.title || course.title.trim().length === 0) {
      errors.push('Le cours doit avoir un titre');
    }
    
    // Vérifier la description du cours
    if (!course.description || course.description.trim().length === 0) {
      errors.push('Le cours doit avoir une description');
    }
    
    // Vérifier l'image de couverture
    if (!course.thumbnailUrl && !course.localThumbnail) {
      errors.push('Le cours doit avoir une image de couverture');
    }
    
    // Vérifier qu'il y a au moins un module
    if (modules.length === 0) {
      errors.push('Le cours doit avoir au moins un module');
    } else {
      // Vérifier qu'au moins un module a au moins une leçon
      const modulesWithLessons = modules.filter(module => module.lessons.length > 0);
      if (modulesWithLessons.length === 0) {
        errors.push('Au moins un module doit contenir au moins une leçon');
      }
    }
    
    return errors;
  };

  const handlePreviewCourse = () => {
    const validationErrors = validateCourseForPreview();
    
    if (validationErrors.length > 0) {
      showError(
        'Prévisualisation impossible', 
        `Pour prévisualiser le cours, vous devez corriger les éléments suivants :\n• ${validationErrors.join('\n• ')}`
      );
      return;
    }
    
    setShowPreview(true);
  };

  // Course data
  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    price: 0,
    tags: [],
    thumbnailUrl: '',
    isPublished: false,
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [currentMode, setCurrentMode] = useState<BuilderMode>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const deleteModalRef = useRef<ModalRef>(null);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const deleteLessonModalRef = useRef<ModalRef>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const exitConfirmModalRef = useRef<ModalRef>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSave] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadModules = useCallback(async () => {
    if (!courseId) {
      // Si on est en création de cours, pas de modules à charger
      setModules([]);
      return;
    }

    try {
      // Charger les modules depuis l'API
      const moduleData = await moduleService.getModulesByCourse(courseId);

      // Pour chaque module, charger ses leçons
      const modulesWithLessons = await Promise.all(
        moduleData.map(async (module) => {
          try {
            const lessons = await lessonService.getLessonsByModule(module.id);
            return {
              ...module,
              lessons: lessons.map(lesson => ({
                ...lesson,
                id: lesson.id || (lesson as { _id?: string })._id, // Gérer les deux formats d'ID
                type: lesson.content.type as 'video' | 'text' | 'quiz' | 'assignment' | '3d' | 'document' // Ajouter la propriété type
              }))
            };
          } catch {
            // Si erreur lors du chargement des leçons, retourner le module sans leçons
            return {
              ...module,
              lessons: []
            };
          }
        })
      );

      // Transformer les IDs si nécessaire
      const transformedModules = modulesWithLessons.map(module => ({
        ...module,
        id: module.id || (module as { _id?: string })._id // Gérer les deux formats d'ID
      }));

      setModules(transformedModules as Module[]);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      // En cas d'erreur, initialiser avec un tableau vide
      setModules([]);
    }
  }, [courseId]);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      // Charger les modules et leçons depuis l'API
      await loadModules();
    } catch {
      showError('Erreur de chargement', 'Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  }, [courseId, showError, loadModules]);

  useEffect(() => {
    if (isEditing && courseId) {
      loadCourse();
    }
  }, [courseId, isEditing, loadCourse]);

  // Track changes to mark as unsaved
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [course, modules]);

  // Auto-save désactivé pour éviter les appels répétés
  // L'utilisateur doit manuellement sauvegarder son travail
  // useEffect(() => {
  //   if (!hasUnsavedChanges) return;
  //   const autoSaveInterval = setInterval(async () => {
  //     try {
  //       await handleSaveAsDraft();
  //       setLastAutoSave(new Date());
  //     } catch (error) {
  //       console.error('Auto-save failed:', error);
  //     }
  //   }, 30000);
  //   return () => clearInterval(autoSaveInterval);
  // }, [hasUnsavedChanges, course, modules]);


  const handleSaveCourse = async () => {
    try {
      setSaving(true);

      // Uploader tous les fichiers locaux d'abord
      const uploadResult = await uploadPendingFiles();

      let savedCourse: Course;

      // Préparer les données pour le backend
      const backendCourseData = {
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'other',
        level: course.level || 'beginner',
        price: course.price || 0,
        thumbnail: uploadResult.thumbnailUrl || course.thumbnailUrl || '',
        tags: course.tags || [],
        status: (course.isPublished ? 'published' : 'draft') as 'draft' | 'published' | 'archived'
      };

      if (isEditing) {
        savedCourse = await courseService.updateCourse(courseId!, backendCourseData);
        success('Cours modifié', 'Cours modifié avec succès');
      } else {
        savedCourse = await courseService.createCourse(backendCourseData as CreateCourseDto);
        success('Cours créé', 'Cours créé avec succès');
        setCourse(prevCourse => ({ ...prevCourse, id: savedCourse.id }));
      }

      // Sauvegarder les modules et leçons
      const savedCourseId = savedCourse.id || (savedCourse as { _id?: string })._id;
      console.log('🔍 CourseBuilder - savedCourse:', savedCourse);
      console.log('🔍 CourseBuilder - courseId pour modules:', savedCourseId);

      if (!savedCourseId) {
        throw new Error('ID du cours non trouvé après sauvegarde');
      }

      await saveModulesAndLessons(savedCourseId);

      setHasUnsavedChanges(false);

      if (!isEditing) {
        // Rediriger vers la liste des cours après publication
        navigate('/dashboard/instructor/courses');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showError('Erreur de sauvegarde', 'Erreur lors de la sauvegarde du cours');
    } finally {
      setSaving(false);
    }
  };

  const uploadPendingFiles = async () => {
    const uploadsPromises: Promise<void>[] = [];
    let uploadedThumbnailUrl = course.thumbnailUrl;

    // Upload de l'image de couverture si elle est locale
    if (course.localThumbnail) {
      const thumbnailUploadPromise = mediaService.uploadFile(course.localThumbnail.file)
        .then((uploadedImage) => {
          uploadedThumbnailUrl = uploadedImage.url;
          // Mettre à jour les données du cours avec l'URL de l'image uploadée
          setCourse(prevCourse => ({
            ...prevCourse,
            thumbnailUrl: uploadedImage.url,
            localThumbnail: null
          }));

          // Nettoyer l'URL locale
          URL.revokeObjectURL(course.localThumbnail!.preview);
        });
      uploadsPromises.push(thumbnailUploadPromise);
    }
    
    // Parcourir tous les modules et leçons pour trouver les fichiers locaux
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        // Upload des documents normaux
        if (lesson.content.localDocument) {
          console.log('📄 Upload document - leçon:', lesson.title, 'fichier:', lesson.content.localDocument);
          const uploadPromise = mediaService.uploadDocument(lesson.content.localDocument.file)
            .then(uploadedFile => {
              console.log('📄 Document uploadé avec succès:', uploadedFile);
              // Mettre à jour les données de la leçon avec l'URL du fichier uploadé
              lesson.content.documentUrl = uploadedFile.url;
              lesson.content.documentName = uploadedFile.originalName;
              lesson.content.documentType = uploadedFile.mimetype;

              // Nettoyer le fichier local
              URL.revokeObjectURL(lesson.content.localDocument!.preview);
              delete lesson.content.localDocument;
            })
            .catch(error => {
              console.error('❌ Erreur upload document:', error);
              throw error;
            });
          uploadsPromises.push(uploadPromise);
        }

        // Upload des documents d'instructions pour les devoirs (assignments)
        if (lesson.type === 'assignment' && lesson.content.assignmentData?.localInstructionDocument) {
          console.log('📄 Upload document devoir - leçon:', lesson.title, 'fichier:', lesson.content.assignmentData.localInstructionDocument);
          const uploadPromise = mediaService.uploadDocument(lesson.content.assignmentData.localInstructionDocument.file)
            .then(uploadedFile => {
              console.log('📄 Document devoir uploadé avec succès:', uploadedFile);
              // Mettre à jour les données du devoir avec l'URL du fichier uploadé
              if (lesson.content.assignmentData) {
                lesson.content.assignmentData.instructionDocumentUrl = uploadedFile.url;
                lesson.content.assignmentData.instructionDocumentName = uploadedFile.originalName;
                lesson.content.assignmentData.instructionDocumentType = uploadedFile.mimetype;

                // Nettoyer le fichier local
                URL.revokeObjectURL(lesson.content.assignmentData.localInstructionDocument!.preview);
                delete lesson.content.assignmentData.localInstructionDocument;
              }
            })
            .catch(error => {
              console.error('❌ Erreur upload document devoir:', error);
              throw error;
            });
          uploadsPromises.push(uploadPromise);
        }
        
        // Upload des images locales du RichTextEditor
        if (lesson.content.localImages && lesson.content.localImages.length > 0) {
          lesson.content.localImages.forEach(localImage => {
            const imageUploadPromise = mediaService.uploadFile(localImage.file)
              .then(uploadedImage => {
                console.log('🖼️ CourseBuilder - Remplacement URL dans contenu:', {
                  localUrl: localImage.localUrl,
                  uploadedUrl: uploadedImage.url
                });
                
                // Remplacer l'URL locale par l'URL uploadée dans le contenu HTML
                if (lesson.content.textContent) {
                  lesson.content.textContent = lesson.content.textContent.replace(
                    localImage.localUrl,
                    uploadedImage.url
                  );
                }
                
                // Nettoyer l'URL locale
                URL.revokeObjectURL(localImage.localUrl);
              });
            uploadsPromises.push(imageUploadPromise);
          });
          
          // Vider la liste des images locales après avoir créé les promesses d'upload
          lesson.content.localImages = [];
        }
      });
    });

    if (uploadsPromises.length > 0) {
      info('Upload en cours', `Upload de ${uploadsPromises.length} fichier(s) en cours...`);
      await Promise.all(uploadsPromises);
      success('Upload terminé', 'Fichiers uploadés avec succès');
    }

    return { thumbnailUrl: uploadedThumbnailUrl };
  };

  const saveModulesAndLessons = async (courseId: string) => {
    try {
      console.log('🎯 saveModulesAndLessons - courseId reçu:', courseId);
      console.log('🎯 saveModulesAndLessons - modules à sauvegarder:', modules.length);

      // Sauvegarder tous les modules
      const modulePromises = modules.map(async (module, index) => {
        const moduleData = {
          title: module.title,
          description: module.description,
          courseId: courseId,
          order: index,
          duration: module.duration,
          isActive: module.isActive
        };

        console.log('📦 Module à sauvegarder:', moduleData);

        let savedModule;
        if (module.id && module.id.startsWith('module-')) {
          // Nouveau module à créer
          savedModule = await moduleService.createModule(moduleData);
          console.log('📦 Nouveau module créé:', savedModule);
        } else if (module.id) {
          // Module existant à mettre à jour
          savedModule = await moduleService.updateModule(module.id, moduleData);
          console.log('📦 Module mis à jour:', savedModule);
        } else {
          // Module sans ID, créer nouveau
          savedModule = await moduleService.createModule(moduleData);
          console.log('📦 Module sans ID créé:', savedModule);
        }

        // Sauvegarder les leçons de ce module
        if (module.lessons.length > 0) {
          const lessonPromises = module.lessons.map(async (lesson, lessonIndex) => {
            console.log('🎯 Module ID pour leçons:', savedModule.id || (savedModule as { _id?: string })._id);

            const moduleId = savedModule.id || (savedModule as { _id?: string })._id;
            const lessonData = lessonService.convertToCreateDto({
              ...lesson,
              moduleId: moduleId,
              order: lessonIndex
            });

            console.log('📝 Leçon à sauvegarder:', lessonData);

            if (lesson.id && lesson.id.startsWith('lesson-')) {
              // Nouvelle leçon à créer
              return await lessonService.createLesson(lessonData);
            } else if (lesson.id) {
              // Leçon existante à mettre à jour
              return await lessonService.updateLesson(lesson.id, lessonData);
            } else {
              // Leçon sans ID, créer nouvelle
              return await lessonService.createLesson(lessonData);
            }
          });

          await Promise.all(lessonPromises);
        }

        return savedModule;
      });

      await Promise.all(modulePromises);
      info('Sauvegarde complète', 'Modules et leçons sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des modules:', error);
      showError('Erreur modules', 'Erreur lors de la sauvegarde des modules et leçons');
      throw error;
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setSaving(true);

      // Uploader tous les fichiers locaux d'abord
      const uploadResult = await uploadPendingFiles();

      // Préparer les données pour le backend (brouillon)
      const backendCourseData = {
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'other',
        level: course.level || 'beginner',
        price: course.price || 0,
        thumbnail: uploadResult.thumbnailUrl || course.thumbnailUrl || '',
        tags: course.tags || [],
        status: 'draft' as const // Toujours en brouillon
      };

      let savedCourse: Course;
      if (isEditing) {
        savedCourse = await courseService.updateCourse(courseId!, backendCourseData);
      } else {
        savedCourse = await courseService.createCourse(backendCourseData as CreateCourseDto);
        setCourse(prevCourse => ({ ...prevCourse, id: savedCourse.id }));
      }

      // Sauvegarder les modules et leçons
      const savedCourseId = savedCourse.id || (savedCourse as { _id?: string })._id;
      console.log('🔍 CourseBuilder DRAFT - savedCourse:', savedCourse);
      console.log('🔍 CourseBuilder DRAFT - courseId pour modules:', savedCourseId);

      if (!savedCourseId) {
        throw new Error('ID du cours non trouvé après sauvegarde (draft)');
      }

      await saveModulesAndLessons(savedCourseId);

      setHasUnsavedChanges(false);
      success('Brouillon sauvegardé', 'Brouillon sauvegardé avec modules et leçons');
      return true;
    } catch (error) {
      console.error('Draft save failed:', error);
      showError('Erreur de brouillon', 'Erreur lors de la sauvegarde du brouillon');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleExitWithConfirmation = () => {
    if (hasUnsavedChanges) {
      exitConfirmModalRef.current?.open();
    } else {
      navigate('/dashboard/instructor/courses');
    }
  };

  const handleConfirmExit = async () => {
    // Try to save as draft before exiting
    const saved = await handleSaveAsDraft();
    if (saved) {
      success('Sauvegarde auto', 'Brouillon sauvegardé automatiquement');
    }
    navigate('/dashboard/instructor/courses');
  };

  const handleCancelExit = () => {
    // Just close the modal, stay on the page
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: 'Nouveau Module',
      description: 'Description du module',
      order: modules.length + 1,
      duration: 0,
      isActive: true,
      lessons: []
    };
    
    setModules([...modules, newModule]);
    setSelectedModuleId(newModule.id);
    setCurrentMode('module');
  };

  const handleAddLesson = (moduleId: string, lessonType?: string) => {
    const type = lessonType || 'video';
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'Nouvelle Leçon',
      description: 'Description de la leçon',
      order: 1,
      duration: 0,
      type: type as 'video' | 'text' | 'quiz' | 'assignment' | '3d' | 'document',
      content: {
        type: type
      },
      resources: [],
      isFree: false,
      isActive: true
    };

    setModules(modules.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = [...module.lessons, newLesson];
        return {
          ...module,
          lessons: updatedLessons,
          duration: calculateModuleDuration(updatedLessons) // Recalculate module duration
        };
      }
      return module;
    }));

    setSelectedModuleId(moduleId);
    setSelectedLessonId(newLesson.id);
    setCurrentMode('lesson');
  };

  const handleEditModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setCurrentMode('module');
  };

  const handleDeleteModule = (moduleId: string) => {
    setModuleToDelete(moduleId);
    deleteModalRef.current?.open();
  };

  const confirmDeleteModule = () => {
    if (moduleToDelete) {
      setModules(modules.filter(m => m.id !== moduleToDelete));
      if (selectedModuleId === moduleToDelete) {
        setSelectedModuleId(null);
        setCurrentMode('overview');
      }
      success('Module supprimé', 'Module supprimé avec succès');
      setModuleToDelete(null);
    }
  };

  const cancelDeleteModule = () => {
    setModuleToDelete(null);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setLessonToDelete({ moduleId, lessonId });
    deleteLessonModalRef.current?.open();
  };

  const confirmDeleteLesson = () => {
    if (lessonToDelete) {
      const { moduleId, lessonId } = lessonToDelete;
      
      setModules(modules.map(module => {
        if (module.id === moduleId) {
          const updatedLessons = module.lessons.filter(l => l.id !== lessonId);
          return {
            ...module,
            lessons: updatedLessons,
            duration: calculateModuleDuration(updatedLessons) // Recalculate module duration
          };
        }
        return module;
      }));

      if (selectedLessonId === lessonId) {
        setSelectedLessonId(null);
        setCurrentMode('module');
      }
      
      success('Leçon supprimée', 'Leçon supprimée avec succès');
      setLessonToDelete(null);
    }
  };

  const cancelDeleteLesson = () => {
    setLessonToDelete(null);
  };

  const getCurrentContent = () => {
    switch (currentMode) {
      case 'overview':
        return (
          <CourseOverview 
            course={course} 
            setCourse={setCourse}
            modules={modules}
            onAddModule={handleAddModule}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
          />
        );
      case 'module': {
        const selectedModule = modules.find(m => m.id === selectedModuleId);
        return selectedModule ? (
          <ModuleEditor
            module={selectedModule}
            onUpdateModule={(updatedModule) => {
              setModules(modules.map(m => m.id === updatedModule.id ? updatedModule as Module : m));
            }}
            onAddLesson={handleAddLesson}
            onDeleteLesson={handleDeleteLesson}
            onSelectLesson={(lessonId) => {
              setSelectedLessonId(lessonId);
              setCurrentMode('lesson');
            }}
          />
        ) : null;
      }
      case 'lesson': {
        const module = modules.find(m => m.id === selectedModuleId);
        const lesson = module?.lessons.find(l => l.id === selectedLessonId);
        return lesson && module ? (
          <LessonEditor
            key={`lesson-${selectedLessonId}`} // Force re-mount when lesson changes
            lesson={lesson}
            onUpdateLesson={(updatedLesson) => {
              setModules(modules.map(m => {
                if (m.id === module.id) {
                  const updatedLessons = m.lessons.map(l => l.id === updatedLesson.id ? updatedLesson as Lesson : l);
                  return {
                    ...m,
                    lessons: updatedLessons,
                    duration: calculateModuleDuration(updatedLessons) // Recalculate module duration
                  };
                }
                return m;
              }));
            }}
          />
        ) : null;
      }
      case 'settings':
        return (
          <CourseSettings
            course={course}
            onUpdateCourse={setCourse}
          />
        );
      default:
        return null;
    }
  };

  const getBreadcrumb = () => {
    const parts = ['Créateur de Cours'];
    
    if (currentMode === 'module' && selectedModuleId) {
      const module = modules.find(m => m.id === selectedModuleId);
      if (module) parts.push(module.title);
    }
    
    if (currentMode === 'lesson' && selectedLessonId) {
      const module = modules.find(m => m.id === selectedModuleId);
      const lesson = module?.lessons.find(l => l.id === selectedLessonId);
      if (lesson) parts.push(lesson.title);
    }
    
    if (currentMode === 'settings') parts.push('Paramètres');
    
    return parts.join(' / ');
  };

  // Render course preview if preview mode is active
  if (showPreview) {
    return (
      <CoursePreview 
        course={course}
        modules={modules}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <CourseBuilderSidebar
          modules={modules}
          selectedModuleId={selectedModuleId}
          selectedLessonId={selectedLessonId}
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onModuleSelect={setSelectedModuleId}
          onLessonSelect={setSelectedLessonId}
          onAddModule={handleAddModule}
          onDeleteModule={handleDeleteModule}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExitWithConfirmation}
                >
                  <ArrowLeft color="#6B7280" size={20} />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {course.title || 'Nouveau Cours'}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {getBreadcrumb()}
                    </p>
                    {hasUnsavedChanges && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        Non sauvegardé
                      </span>
                    )}
                    {lastAutoSave && (
                      <span className="text-xs text-gray-400">
                        Brouillon: {lastAutoSave.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge
                  variant={course.isPublished ? 'success' : 'warning'}
                  size="sm"
                >
                  {course.isPublished ? 'Publié' : 'Brouillon'}
                </Badge>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviewCourse}
                >
                  <Eye color="#6B7280" size={16} className="mr-2" />
                  Prévisualiser
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsDraft}
                  disabled={saving}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Save2 size={16} className="mr-2" color="#B45309" />
                  Brouillon
                </Button>
                
                <Button
                  onClick={handleSaveCourse}
                  disabled={saving}
                  className="bg-blue-700 hover:bg-blue-800 text-white rounded"
                >
                  <Save2 size={16} className="mr-2" color="white" />
                  {saving ? 'Sauvegarde...' : 'Publier'}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement...</p>
                </div>
              </div>
            ) : (
              getCurrentContent()
            )}
          </div>
        </div>

        {/* Delete Module Confirmation Modal */}
        <ConfirmationModal
          ref={deleteModalRef}
          title="Supprimer le module"
          message="Cette action ne peut pas être annulée."
          description="Êtes-vous sûr de vouloir supprimer ce module ? Toutes les leçons qu'il contient seront également supprimées."
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
          onConfirm={confirmDeleteModule}
          onCancel={cancelDeleteModule}
        />

        {/* Delete Lesson Confirmation Modal */}
        <ConfirmationModal
          ref={deleteLessonModalRef}
          title="Supprimer la leçon"
          message="Cette action ne peut pas être annulée."
          description="Êtes-vous sûr de vouloir supprimer cette leçon ? Tout son contenu sera définitivement perdu."
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
          onConfirm={confirmDeleteLesson}
          onCancel={cancelDeleteLesson}
        />

        {/* Exit Confirmation Modal */}
        <ConfirmationModal
          ref={exitConfirmModalRef}
          title="Quitter l'éditeur"
          message="Vous avez des modifications non sauvegardées."
          description="Voulez-vous sauvegarder automatiquement en brouillon avant de quitter ? Vos modifications ne seront pas perdues."
          confirmText="Sauvegarder et quitter"
          cancelText="Rester ici"
          type="warning"
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      </div>
    </>
  );
};

export default CourseBuilder;