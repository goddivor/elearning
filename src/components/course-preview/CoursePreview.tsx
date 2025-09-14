import { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Book, 
  Clock, 
  Star,
  Award,
  DocumentText,
  VideoPlay,
  Box
} from 'iconsax-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { LocalImage } from '@/components/ui/ImageUpload';

// Interfaces reprises du CourseBuilder
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
    type?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    textContent?: string;
    documentUrl?: string;
    documentName?: string;
    documentType?: string;
    model3dUrl?: string;
    quizData?: {
      questions: Array<{
        id: string;
        type: string;
        question: string;
        options: string[];
        correctAnswer: number | number[] | string | string[];
        explanation: string;
      }>;
    };
    assignmentData?: {
      description?: string;
      dueDate?: string;
      maxPoints?: number;
    };
  };
  resources: string[];
  isFree: boolean;
  isActive: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  localThumbnail?: LocalImage | null;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isPublished: boolean;
  enrolledStudents: number;
  averageRating: number;
}

interface CoursePreviewProps {
  course: Partial<Course>;
  modules: Module[];
  onClose: () => void;
}

const CoursePreview = ({ course, modules, onClose }: CoursePreviewProps) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Calcul des statistiques du cours
  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const totalDuration = modules.reduce((sum, module) => sum + module.duration, 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return 'Non défini';
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={16} className="text-red-500" />;
      case 'text':
        return <Book size={16} className="text-blue-500" />;
      case 'quiz':
        return <Award size={16} className="text-purple-500" />;
      case 'document':
        return <Book size={16} className="text-green-500" />;
      case '3d':
        return <div className="w-4 h-4 bg-orange-500 rounded"></div>;
      case 'assignment':
        return <Award size={16} className="text-yellow-500" />;
      default:
        return <Book size={16} className="text-gray-500" />;
    }
  };

  const selectedModule = modules.find(m => m.id === selectedModuleId);
  const selectedLesson = selectedModule?.lessons.find(l => l.id === selectedLessonId);

  const renderLessonContent = (lesson: Lesson) => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <VideoPlay size={48} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vidéo de cours</h3>
              <p className="text-gray-600">
                {lesson.content.videoUrl ? 'Vidéo disponible pour lecture' : 'Vidéo en cours de préparation'}
              </p>
            </div>
            
            <div className="aspect-video bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <VideoPlay size={64} className="mx-auto mb-4 text-red-600" />
                <p className="text-red-800 font-medium">Lecteur vidéo</p>
                <p className="text-sm text-red-600 mt-1">
                  (Prévisualisation - lecteur réel côté étudiant)
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button className="bg-red-600 text-white hover:bg-red-700">
                <Play size={16} className="mr-2" />
                Regarder la vidéo
              </Button>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: lesson.content.textContent || '<p class="text-gray-500">Contenu textuel non disponible</p>' 
              }}
            />
          </div>
        );

      case 'document':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <DocumentText size={32} className="text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {lesson.content.documentName || 'Document'}
                </h3>
                <p className="text-sm text-gray-500">
                  Type: {lesson.content.documentType || 'PDF'}
                </p>
              </div>
            </div>
            {lesson.content.documentUrl ? (
              <div className="space-y-4">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  <DocumentText size={16} className="mr-2" />
                  Télécharger le document
                </Button>
                {lesson.content.documentType && lesson.content.documentType.includes('pdf') && (
                  <div className="aspect-[4/3] bg-gray-100 rounded border">
                    <iframe
                      src={lesson.content.documentUrl}
                      className="w-full h-full rounded"
                      title={lesson.content.documentName || 'Document'}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Document non disponible</p>
            )}
          </div>
        );

      case 'quiz':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <Award size={48} className="mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz interactif</h3>
              <p className="text-gray-600">
                {lesson.content.quizData?.questions?.length || 0} question(s)
              </p>
            </div>
            
            {lesson.content.quizData?.questions && lesson.content.quizData.questions.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Exemple de question :
                  </h4>
                  <p className="text-blue-800">
                    {lesson.content.quizData.questions[0].question}
                  </p>
                </div>
                <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                  Commencer le quiz
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Aucune question disponible</p>
            )}
          </div>
        );

      case 'assignment':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <Award size={48} className="mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Devoir à rendre</h3>
              <p className="text-gray-600">
                {lesson.content.assignmentData?.description || 'Description du devoir'}
              </p>
            </div>
            
            <div className="space-y-4">
              {lesson.content.assignmentData?.dueDate && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-orange-500" />
                    <span className="text-orange-800 font-medium">
                      Échéance : {lesson.content.assignmentData.dueDate ? new Date(lesson.content.assignmentData.dueDate).toLocaleDateString() : 'Non définie'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Points :</strong> {lesson.content.assignmentData?.maxPoints || 'Non défini'}
                </p>
              </div>

              <Button className="w-full bg-yellow-600 text-white hover:bg-yellow-700">
                Voir le devoir complet
              </Button>
            </div>
          </div>
        );

      case '3d':
        return (
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg relative overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Box size={48} className="mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Modèle 3D interactif</h3>
                <p className="text-purple-700 mb-4">Explorez le modèle en 3 dimensions</p>
                
                {lesson.content.model3dUrl ? (
                  <div className="space-y-3">
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                      <p className="text-sm text-purple-800">
                        Modèle 3D disponible - cliquez pour interagir
                      </p>
                    </div>
                    <Button className="bg-purple-600 text-white hover:bg-purple-700">
                      Charger le modèle 3D
                    </Button>
                  </div>
                ) : (
                  <p className="text-purple-700">Modèle 3D non disponible</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              {getLessonIcon(lesson.type)}
              <p className="text-gray-500 mt-2">
                Contenu de la leçon : {lesson.type}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <ArrowLeft color="#6B7280" size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Prévisualisation : {course.title}
              </h1>
              <p className="text-sm text-orange-600">
                Mode prévisualisation - Vue étudiant
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* Vidéo/Contenu de la leçon */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              {selectedLesson ? (
                <div>
                  {/* Header de la leçon */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3 mb-2">
                      {getLessonIcon(selectedLesson.type)}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedLesson.title}
                      </h2>
                    </div>
                    <p className="text-gray-600">{selectedLesson.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {selectedLesson.duration} min
                      </span>
                      <Badge 
                        variant={selectedLesson.isFree ? 'success' : 'default'} 
                        size="sm"
                      >
                        {selectedLesson.isFree ? 'Gratuit' : 'Payant'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Contenu de la leçon */}
                  <div className="p-6">
                    {renderLessonContent(selectedLesson)}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  {course.thumbnailUrl || course.localThumbnail ? (
                    <img 
                      src={course.thumbnailUrl || (course.localThumbnail?.preview)} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Book size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Image de couverture du cours</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Informations du cours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos de ce cours</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{modules.length}</div>
                  <div className="text-sm text-gray-600">Modules</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{totalLessons}</div>
                  <div className="text-sm text-gray-600">Leçons</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{formatDuration(totalDuration)}</div>
                  <div className="text-sm text-gray-600">Durée</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{getLevelLabel(course.level)}</div>
                  <div className="text-sm text-gray-600">Niveau</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar du cours */}
          <div className="lg:col-span-1">
            {/* Informations du cours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Book size={24} color="#1D4ED8" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{course.category}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prix :</span>
                  <span className="font-medium">
                    {course.price === 0 ? 'Gratuit' : `${course.price}€`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Étudiants :</span>
                  <span className="font-medium">{course.enrolledStudents || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Note :</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">
                      {course.averageRating ? course.averageRating.toFixed(1) : 'N/A'}
                    </span>
                    {course.averageRating && <Star size={14} className="text-yellow-400" />}
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700">
                S'inscrire au cours
              </Button>
            </div>

            {/* Structure du cours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contenu du cours</h3>
              
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setSelectedModuleId(
                        selectedModuleId === module.id ? null : module.id
                      )}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">{module.title}</h4>
                        <span className="text-xs text-gray-500">
                          {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatDuration(module.duration)}</p>
                    </button>
                    
                    {selectedModuleId === module.id && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className={`w-full p-3 text-left hover:bg-gray-100 flex items-center space-x-3 ${
                              selectedLessonId === lesson.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            {getLessonIcon(lesson.type)}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {lesson.title}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center space-x-2">
                                <span>{lesson.duration} min</span>
                                {lesson.isFree && (
                                  <Badge variant="success" size="sm">Gratuit</Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;