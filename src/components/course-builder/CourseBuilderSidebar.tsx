import { 
  Book, 
  Add, 
  Video, 
  DocumentText, 
  MessageQuestion,
  Box,
  Setting2,
  ArrowDown2,
  ArrowRight2,
  Trash
} from 'iconsax-react';
import Button from '@/components/ui/Button';

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
  content: Record<string, unknown>;
  resources: string[];
  isFree: boolean;
  isActive: boolean;
}

type BuilderMode = 'overview' | 'module' | 'lesson' | 'settings';

interface Props {
  modules: Module[];
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  currentMode: BuilderMode;
  onModeChange: (mode: BuilderMode) => void;
  onModuleSelect: (moduleId: string | null) => void;
  onLessonSelect: (lessonId: string | null) => void;
  onAddModule: () => void;
  onDeleteModule: (moduleId: string) => void;
}

const CourseBuilderSidebar = ({
  modules,
  selectedModuleId,
  selectedLessonId,
  currentMode,
  onModeChange,
  onModuleSelect,
  onLessonSelect,
  onAddModule,
  onDeleteModule
}: Props) => {
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video color="#EF4444" size={16} />;
      case 'text': return <DocumentText color="#3B82F6" size={16} />;
      case 'quiz': return <MessageQuestion color="#8B5CF6" size={16} />;
      case 'document': return <DocumentText color="#10B981" size={16} />;
      case '3d': return <Box color="#F97316" size={16} />;
      case 'assignment': return <DocumentText color="#6366F1" size={16} />;
      default: return <DocumentText color="#6B7280" size={16} />;
    }
  };

  const handleModuleClick = (moduleId: string) => {
    onModuleSelect(moduleId);
    onModeChange('module');
  };

  const handleLessonClick = (lessonId: string, moduleId: string) => {
    // S'assurer que le module correct est sélectionné d'abord
    if (selectedModuleId !== moduleId) {
      onModuleSelect(moduleId);
    }
    onLessonSelect(lessonId);
    onModeChange('lesson');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Structure du cours</h2>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Overview */}
            <button
            onClick={() => onModeChange('overview')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              currentMode === 'overview'
              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
            }`}
            >
            <div className="flex items-center space-x-3">
              <Book color={currentMode === 'overview' ? '#3B82F6' : '#6B7280'} size={20} />
              <span className="font-medium">Vue d'ensemble</span>
            </div>
            </button>

          {/* Modules */}
          <div className="space-y-1">
            {modules.map((module, index) => {
              const isModuleSelected = selectedModuleId === module.id;
              const isExpanded = isModuleSelected;

              return (
                <div key={module.id}>
                  {/* Module Header */}
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isModuleSelected && currentMode === 'module'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div 
                      className="flex items-center space-x-3 flex-1"
                      onClick={() => handleModuleClick(module.id)}
                    >
                      <div className="flex items-center space-x-2">
                        {module.lessons.length > 0 ? (
                          isExpanded ? <ArrowDown2 color="#6B7280" size={16} /> : <ArrowRight2 color="#6B7280" size={16} />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{module.title}</p>
                        <p className="text-xs text-gray-500">
                          {module.lessons.length} leçons
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteModule(module.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    >
                      <Trash color="#9CA3AF" size={14} />
                    </button>
                  </div>

                  {/* Module Lessons */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson.id, module.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedLessonId === lesson.id && currentMode === 'lesson'
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getLessonIcon(lesson.type)}
                              <span className="text-xs text-gray-400">
                                {lessonIndex + 1}.
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{lesson.title}</p>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <span>{lesson.duration} min</span>
                                {lesson.isFree && (
                                  <span className="px-1 bg-green-100 text-green-600 rounded">
                                    Gratuit
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Module Button */}
          <Button
            onClick={onAddModule}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            <Add color="#6B7280" size={16} className="mr-2" />
            Ajouter un module
          </Button>

          {/* Settings */}
            <button
            onClick={() => onModeChange('settings')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors mt-4 ${
              currentMode === 'settings'
              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
            }`}
            >
            <div className="flex items-center space-x-3">
              <Setting2 color={currentMode === 'settings' ? '#3B82F6' : '#6B7280'} size={20} />
              <span className="font-medium">Paramètres</span>
            </div>
            </button>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Modules:</span>
            <span className="font-medium">{modules.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Leçons:</span>
            <span className="font-medium">
              {modules.reduce((sum, m) => sum + m.lessons.length, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Durée totale:</span>
            <span className="font-medium">
              {Math.floor(modules.reduce((sum, m) => sum + m.duration, 0) / 60)}h{' '}
              {modules.reduce((sum, m) => sum + m.duration, 0) % 60}min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderSidebar;