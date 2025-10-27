import { useState } from "react";
import {
  Add,
  Video,
  DocumentText,
  MessageQuestion,
  Box,
  Edit,
  Trash,
  Menu,
} from "iconsax-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { X } from "@phosphor-icons/react";

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
  type: "video" | "text" | "quiz" | "assignment" | "3d" | "document";
  content: Record<string, unknown>;
  resources: string[];
  isFree: boolean;
  isActive: boolean;
}

interface Props {
  module: Module;
  onUpdateModule: (module: Module) => void;
  onAddLesson: (moduleId: string, lessonType?: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

const ModuleEditor = ({
  module,
  onUpdateModule,
  onAddLesson,
  onDeleteLesson,
  onSelectLesson,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleSaveModule = () => {
    onUpdateModule({
      ...module,
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(module.title);
    setEditDescription(module.description);
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent, lessonId: string) => {
    setDraggedLessonId(lessonId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', lessonId);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(targetIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedLessonId) return;
    
    const draggedIndex = module.lessons.findIndex(lesson => lesson.id === draggedLessonId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) {
      setDraggedLessonId(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedLessons = [...module.lessons];
    const [movedLesson] = reorderedLessons.splice(draggedIndex, 1);
    reorderedLessons.splice(targetIndex, 0, movedLesson);

    // Update order property for all lessons
    const updatedLessons = reorderedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    onUpdateModule({
      ...module,
      lessons: updatedLessons
    });

    setDraggedLessonId(null);
    setDragOverIndex(null);
  };

  const getLessonIcon = (type: string, size = 20) => {
    switch (type) {
      case "video":
        return <Video color="#EF4444" size={size} />;
      case "text":
        return <DocumentText color="#3B82F6" size={size} />;
      case "quiz":
        return <MessageQuestion color="#8B5CF6" size={size} />;
      case "document":
        return <DocumentText color="#10B981" size={size} />;
      case "3d":
        return <Box color="#F97316" size={size} />;
      case "assignment":
        return <DocumentText color="#6366F1" size={size} />;
      default:
        return <DocumentText color="#6B7280" size={size} />;
    }
  };

  const getLessonTypeName = (type: string) => {
    const types = {
      video: "Vidéo",
      text: "Texte",
      quiz: "Quiz",
      document: "Document",
      "3d": "Modèle 3D",
      assignment: "Devoir",
    };
    return types[type as keyof typeof types] || "Leçon";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Module Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Module: {module.title}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X color="#6B7280" size={16} className="mr-2" />
                  Annuler
                </>
              ) : (
                <>
                  <Edit color="#6B7280" size={16} className="mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du module
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Titre du module"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description du module"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveModule}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">{module.description}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Leçons:</span>
                  <span className="ml-2 font-medium">
                    {module.lessons.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Durée:</span>
                  <span className="ml-2 font-medium">
                    {module.duration} min
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Statut:</span>
                  <Badge
                    variant={module.isActive ? "success" : "default"}
                    size="sm"
                    className="ml-2"
                  >
                    {module.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Leçons du module
            </h3>
            <LessonTypeSelector onSelect={(type) => onAddLesson(module.id, type)} />
          </div>

          {module.lessons.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center">
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Video color="#F87171" size={32} />
                  <DocumentText color="#60A5FA" size={32} />
                  <MessageQuestion color="#A78BFA" size={32} />
                  <Box color="#FB923C" size={32} />
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune leçon
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Commencez par ajouter votre première leçon à ce module.
                  </p>
                  <LessonTypeSelector onSelect={(type) => onAddLesson(module.id, type)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {module.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, index) => (
                  <div
                    key={lesson.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lesson.id)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors cursor-pointer group ${
                      draggedLessonId === lesson.id
                        ? 'border-blue-500 bg-blue-50 opacity-50'
                        : dragOverIndex === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onSelectLesson(lesson.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <Menu
                          color="#6B7280"
                          size={16}
                          className="opacity-60 group-hover:opacity-100 cursor-move hover:text-blue-600 transition-colors"
                        />
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        {getLessonIcon(lesson.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">
                            {lesson.title}
                          </h4>
                          <Badge
                            variant={
                              lesson.type === "video"
                                ? "danger"
                                : lesson.type === "quiz"
                                ? "primary"
                                : lesson.type === "3d"
                                ? "warning"
                                : "default"
                            }
                            size="sm"
                          >
                            {getLessonTypeName(lesson.type)}
                          </Badge>
                          {lesson.isFree && (
                            <Badge variant="success" size="sm">
                              Gratuit
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {lesson.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>{lesson.duration} min</span>
                          <span>•</span>
                          <span>{lesson.resources.length} ressources</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLesson(lesson.id);
                        }}
                      >
                        <Edit color="#6B7280" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLesson(module.id, lesson.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash color="#EF4444" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Lesson Type Selector Component
const LessonTypeSelector = ({
  onSelect,
}: {
  onSelect: (type: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const lessonTypes = [
    {
      type: "video",
      name: "Vidéo",
      icon: <Video color="#EF4444" size={20} />,
      color: "text-red-500",
      description: "Contenu vidéo",
    },
    {
      type: "text",
      name: "Article/Texte",
      icon: <DocumentText color="#3B82F6" size={20} />,
      color: "text-blue-500",
      description: "Contenu textuel",
    },
    {
      type: "quiz",
      name: "Quiz/QCM",
      icon: <MessageQuestion color="#8B5CF6" size={20} />,
      color: "text-purple-500",
      description: "Questions interactives",
    },
    {
      type: "3d",
      name: "Modèle 3D",
      icon: <Box color="#F97316" size={20} />,
      color: "text-orange-500",
      description: "Contenu 3D interactif",
    },
    {
      type: "document",
      name: "Document",
      icon: <DocumentText color="#10B981" size={20} />,
      color: "text-green-500",
      description: "PDF, images, etc.",
    },
    {
      type: "assignment",
      name: "Devoir",
      icon: <DocumentText color="#6366F1" size={20} />,
      color: "text-indigo-500",
      description: "Exercice à rendre",
    },
  ];

  const handleSelect = (_type: string) => {
    onSelect(_type);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
      >
        <Add size={16} color="white" className="mr-2" />
        Ajouter une leçon
      </Button>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-96">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">
            Choisir le type de leçon
          </h4>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {lessonTypes.map((lessonType) => (
            <button
              key={lessonType.type}
              onClick={() => handleSelect(lessonType.type)}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className={lessonType.color}>{lessonType.icon}</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {lessonType.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {lessonType.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleEditor;
