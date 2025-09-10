import { useState, useEffect } from 'react';
import { 
  Video, 
  DocumentText, 
  MessageQuestion,
  Box,
  Import,
  Add,
  Trash,
  Link,
  Save2,
  Eye,
  Edit,
  Play
} from 'iconsax-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import DocumentUpload, { type LocalFile, type UploadedFile } from '@/components/ui/DocumentUpload';
import RichTextEditor, { type LocalImage } from '@/components/ui/RichTextEditor';
import { toast } from 'react-hot-toast';
import { mediaService } from '@/services/mediaService';

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
    localImages?: LocalImage[]; // Images locales en attente d'upload (pour RichTextEditor)
    model3dUrl?: string;
    model3dName?: string;
    quizData?: QuizData;
    assignmentData?: AssignmentData;
  };
  resources: string[];
  isFree: boolean;
  isActive: boolean;
}

interface QuizData {
  questions: QuizQuestion[];
}

interface QuizQuestion {
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
    language: string; // 'javascript', 'python', 'java', 'css', etc.
  };
  
  // Spécifique au "Texte à trous"
  fillBlanksData?: {
    textWithBlanks: string; // Texte avec [blank] comme marqueurs
    blanks: Array<{
      id: string;
      correctAnswers: string[]; // Réponses acceptées pour ce blanc
      caseSensitive: boolean;
    }>;
  };
  
  // Spécifique au "Classement / Ordonnancement"
  orderingData?: {
    items: Array<{
      id: string;
      text: string;
      correctPosition: number; // Position correcte (0-indexed)
    }>;
  };
  
  // Spécifique au "Glisser-déposer"
  dragDropData?: {
    zones: Array<{
      id: string;
      label: string;
      acceptedItems: string[]; // IDs des items qui peuvent être déposés ici
    }>;
    items: Array<{
      id: string;
      text: string;
      correctZoneId: string;
    }>;
  };
  
  // Spécifique au quiz audio
  audioData?: {
    audioFile?: File;
    localAudioUrl?: string;
    uploadedAudioUrl?: string;
    audioName?: string;
    duration?: number;
  };
}

interface AssignmentData {
  instructions?: string;
  dueDate?: string;
  maxPoints?: number;
  title?: string;
  documentUrl?: string;
  videoUrl?: string;
  resourceLinks?: string[];
  submissionType?: string;
  acceptedFormats?: string;
  maxFileSize?: number;
  allowLateSubmission?: boolean;
  gradingType?: string;
  gradingCriteria?: string;
  autoGrade?: boolean;
  peerReview?: boolean;
}

interface Props {
  lesson: Lesson;
  onUpdateLesson: (lesson: Lesson) => void;
}

const LessonEditor = ({ lesson, onUpdateLesson }: Props) => {
  const [editedLesson, setEditedLesson] = useState<Lesson>({ ...lesson });
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  const handleSave = () => {
    onUpdateLesson(editedLesson);
    toast.success('Leçon sauvegardée avec succès');
  };

  const handleContentChange = (field: string, value: unknown) => {
    console.log('🚨🚨🚨 NOUVEAU CODE - handleContentChange appelé:', { field, value });
    console.log('📄 LessonEditor - Lesson actuel:', editedLesson);
    
    setEditedLesson(prevLesson => {
      const newLesson = {
        ...prevLesson,
        content: {
          ...prevLesson.content,
          [field]: value
        }
      };
      
      console.log('📄 LessonEditor - Nouvelle lesson créée:', newLesson);
      console.log('🔍 CONTENU de newLesson.content:', newLesson.content);
      console.log('🔍 localDocument dans newLesson:', newLesson.content.localDocument);
      
      return newLesson;
    });
    
    setRenderKey(prev => prev + 1); // Force re-render
    console.log('📄 LessonEditor - handleContentChange terminé');
  };

  const handleAddResource = () => {
    setEditedLesson({
      ...editedLesson,
      resources: [...editedLesson.resources, '']
    });
  };

  const handleResourceChange = (index: number, value: string) => {
    const newResources = [...editedLesson.resources];
    newResources[index] = value;
    setEditedLesson({
      ...editedLesson,
      resources: newResources
    });
  };

  const handleRemoveResource = (index: number) => {
    setEditedLesson({
      ...editedLesson,
      resources: editedLesson.resources.filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = async (file: File, type: 'document' | '3d' | 'image') => {
    try {
      // Validate file
      const validation = mediaService.validateFile(file, mediaService.getValidationOptions(type));
      if (!validation.valid) {
        toast.error(validation.error || 'Fichier invalide');
        return Promise.reject('Fichier invalide');
      }

      setUploadProgress(0);
      
      const uploadedFile = await mediaService.uploadFile(file, (progress) => {
        setUploadProgress(progress.progress);
      });
      
      switch (type) {
        case 'document':
          handleContentChange('documentUrl', uploadedFile.url);
          handleContentChange('documentName', uploadedFile.originalname);
          handleContentChange('documentType', uploadedFile.mimetype);
          break;
        case '3d':
          handleContentChange('model3dUrl', uploadedFile.url);
          handleContentChange('model3dName', uploadedFile.originalname);
          break;
      }
      
      toast.success(`${type === '3d' ? 'Modèle 3D' : 'Document'} téléchargé avec succès`);
      setUploadProgress(null);
      return uploadedFile.url;
    } catch (error) {
      setUploadProgress(null);
      toast.error('Erreur lors du téléchargement');
      throw error;
    }
  };

  const renderContentEditor = () => {
    switch (editedLesson.type) {
      case 'video':
        return <VideoEditor lesson={editedLesson} onChange={handleContentChange} />;
      case 'text':
        return <RichTextEditor 
          value={editedLesson.content.textContent || ''}
          onChange={(content) => handleContentChange('textContent', content)}
          onLocalImagesChange={(localImages) => handleContentChange('localImages', localImages)}
          localImages={editedLesson.content.localImages || []}
          placeholder="Rédigez votre contenu d'article..."
          label="Contenu de l'article"
        />;
      case 'quiz':
        return <QuizEditor lesson={editedLesson} onChange={handleContentChange} />;
      case '3d':
        return <Model3DEditor lesson={editedLesson} onChange={handleContentChange} onUpload={handleFileUpload} uploadProgress={uploadProgress} />;
      case 'document':
        return <DocumentEditor key={renderKey} lesson={editedLesson} onChange={handleContentChange} onUpload={handleFileUpload} />;
      case 'assignment':
        return <AssignmentEditor lesson={editedLesson} onChange={handleContentChange} />;
      default:
        return <div>Type de leçon non supporté</div>;
    }
  };

  const getLessonIcon = () => {
    switch (editedLesson.type) {
      case 'video': return <Video color="#EF4444" size={24} />;
      case 'text': return <DocumentText color="#3B82F6" size={24} />;
      case 'quiz': return <MessageQuestion color="#8B5CF6" size={24} />;
      case 'document': return <DocumentText color="#10B981" size={24} />;
      case '3d': return <Box color="#F97316" size={24} />;
      case 'assignment': return <DocumentText color="#6366F1" size={24} />;
      default: return <DocumentText color="#6B7280" size={24} />;
    }
  };

  const getTypeName = () => {
    const types = {
      video: 'Vidéo',
      text: 'Article/Texte',
      quiz: 'Quiz/QCM',
      document: 'Document',
      '3d': 'Modèle 3D',
      assignment: 'Devoir'
    };
    return types[editedLesson.type];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getLessonIcon()}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editedLesson.title}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="primary" size="sm">
                    {getTypeName()}
                  </Badge>
                  {editedLesson.isFree && (
                    <Badge variant="success" size="sm">
                      Gratuit
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                >
                {isPreview ? (
                  <Edit color="grey" size={16} className="mr-2" />
                ) : (
                  <Eye color="grey" size={16} className="mr-2" />
                )}
                {isPreview ? 'Éditer' : 'Prévisualiser'}
                </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save2 color="white" size={16} className="mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>

        {!isPreview ? (
          <>
            {/* Basic Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la leçon
                  </label>
                  <Input
                    value={editedLesson.title}
                    onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
                    placeholder="Titre de la leçon"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editedLesson.description}
                    onChange={(e) => setEditedLesson({ ...editedLesson, description: e.target.value })}
                    placeholder="Description de la leçon"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes)
                  </label>
                  <Input
                    type="number"
                    value={editedLesson.duration}
                    onChange={(e) => setEditedLesson({ ...editedLesson, duration: Number(e.target.value) })}
                    min="0"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedLesson.isFree}
                      onChange={(e) => setEditedLesson({ ...editedLesson, isFree: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Leçon gratuite (preview)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editedLesson.isActive}
                      onChange={(e) => setEditedLesson({ ...editedLesson, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Leçon active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contenu de la leçon
              </h3>
              {renderContentEditor()}
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ressources additionnelles
                </h3>
                <Button variant="outline" size="sm" onClick={handleAddResource}>
                  <Add color='grey' size={16} className="mr-2" />
                  Ajouter une ressource
                </Button>
              </div>
              
              {editedLesson.resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Link color='grey' size={32} className="mx-auto mb-2" />
                  <p>Aucune ressource ajoutée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {editedLesson.resources.map((resource, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        value={resource}
                        onChange={(e) => handleResourceChange(index, e.target.value)}
                        placeholder="URL de la ressource ou nom du fichier"
                        className="flex-1"
                      />
                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResource(index)}
                        className="text-red-600 hover:text-red-700"
                        >
                        <Trash color="#EF4444" size={16} />
                        </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <LessonPreview />
        )}
      </div>
    </div>
  );
};

// Content Editors
interface EditorProps {
  lesson: Lesson;
  onChange: (field: string, value: unknown) => void;
  onUpload?: (file: File, type: 'document' | '3d' | 'image') => Promise<string>;
  uploadProgress?: number | null;
}

const VideoEditor = ({ lesson, onChange }: EditorProps) => {
  const getVideoPreview = () => {
    const url = lesson.content.videoUrl;
    if (!url) return null;

    // YouTube URL detection
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title="Aperçu vidéo"
          />
        </div>
      );
    }

    // Vimeo URL detection
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            title="Aperçu vidéo"
          />
        </div>
      );
    }

    // Direct video URL
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <video
            src={url}
            controls
            className="w-full h-full"
            title="Aperçu vidéo"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      );
    }

    return (
      <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Video color="#9CA3AF" size={48} className="mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aperçu non disponible pour cette URL</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de la vidéo *
        </label>
        <Input
          value={lesson.content.videoUrl || ''}
          onChange={(e) => onChange('videoUrl', e.target.value)}
          placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/... ou URL directe"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports: YouTube, Vimeo, ou liens directs vers des fichiers vidéo (.mp4, .webm, .ogg)
        </p>
      </div>
      
      {lesson.content.videoUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aperçu de la vidéo
          </label>
          {getVideoPreview()}
        </div>
      )}
      
      {!lesson.content.videoUrl && (
        <div className="text-center py-8 border-2 border-dashed border-red-200 rounded-lg bg-red-50 flex flex-col items-center">
          <Play color="#F87171" size={48} className="mb-4" />
          <h4 className="font-medium text-gray-900 mb-2">Aucune vidéo configurée</h4>
          <p className="text-gray-600 mb-4">Collez l'URL de votre vidéo hébergée ci-dessus</p>
          <div className="text-xs text-gray-500">
            <p>YouTube: https://youtube.com/watch?v=...</p>
            <p>Vimeo: https://vimeo.com/...</p>
            <p>Liens directs: https://example.com/video.mp4</p>
          </div>
        </div>
      )}
    </div>
  );
};


// Fonction pour rendre le contenu spécifique de chaque type de question
const renderQuestionContent = (question: QuizQuestion, updateQuestion: (questionId: string, field: string, value: unknown) => void) => {
  switch (question.type) {
    case 'fill-blanks':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte avec espaces à compléter *
            </label>
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">
                Utilisez <code className="bg-white px-1 rounded">[blank]</code> pour marquer les espaces à compléter
              </p>
              <textarea
                value={question.fillBlanksData?.textWithBlanks || ''}
                onChange={(e) => updateQuestion(question.id, 'fillBlanksData', {
                  ...question.fillBlanksData,
                  textWithBlanks: e.target.value
                })}
                placeholder="Ex: La capitale de la France est [blank] et elle est située sur la [blank]."
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
          
          {/* Configuration des réponses pour chaque blank */}
          {question.fillBlanksData?.textWithBlanks?.match(/\[blank\]/g) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réponses acceptées pour chaque espace
              </label>
              <div className="space-y-3">
                {question.fillBlanksData.textWithBlanks.match(/\[blank\]/g)?.map((_, blankIndex) => (
                  <div key={blankIndex} className="border border-gray-200 rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-2">Espace {blankIndex + 1}</h5>
                    <input
                      type="text"
                      placeholder="Réponses séparées par des virgules (ex: Paris, paris, PARIS)"
                      value={question.fillBlanksData?.blanks?.[blankIndex]?.correctAnswers?.join(', ') || ''}
                      onChange={(e) => {
                        const answers = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                        const updatedBlanks = [...(question.fillBlanksData?.blanks || [])];
                        updatedBlanks[blankIndex] = {
                          id: `blank-${blankIndex}`,
                          correctAnswers: answers,
                          caseSensitive: updatedBlanks[blankIndex]?.caseSensitive || false
                        };
                        updateQuestion(question.id, 'fillBlanksData', {
                          ...question.fillBlanksData,
                          blanks: updatedBlanks
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <label className="flex items-center mt-2 text-sm">
                      <input
                        type="checkbox"
                        checked={question.fillBlanksData?.blanks?.[blankIndex]?.caseSensitive || false}
                        onChange={(e) => {
                          const updatedBlanks = [...(question.fillBlanksData?.blanks || [])];
                          updatedBlanks[blankIndex] = {
                            ...updatedBlanks[blankIndex],
                            id: `blank-${blankIndex}`,
                            correctAnswers: updatedBlanks[blankIndex]?.correctAnswers || [],
                            caseSensitive: e.target.checked
                          };
                          updateQuestion(question.id, 'fillBlanksData', {
                            ...question.fillBlanksData,
                            blanks: updatedBlanks
                          });
                        }}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      Sensible à la casse
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'ordering':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Éléments à classer dans l'ordre *
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Les étudiants devront remettre ces éléments dans le bon ordre
            </p>
            <div className="space-y-2">
              {question.orderingData?.items?.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updatedItems = [...(question.orderingData?.items || [])];
                      updatedItems[index] = { ...item, text: e.target.value };
                      updateQuestion(question.id, 'orderingData', {
                        ...question.orderingData,
                        items: updatedItems
                      });
                    }}
                    placeholder={`Élément ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <button
                    onClick={() => {
                      const updatedItems = question.orderingData?.items?.filter((_, i) => i !== index) || [];
                      updateQuestion(question.id, 'orderingData', {
                        ...question.orderingData,
                        items: updatedItems.map((item, i) => ({ ...item, correctPosition: i }))
                      });
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash color="#EF4444" size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const currentItems = question.orderingData?.items || [];
                const newItem = {
                  id: `item-${Date.now()}`,
                  text: '',
                  correctPosition: currentItems.length
                };
                updateQuestion(question.id, 'orderingData', {
                  ...question.orderingData,
                  items: [...currentItems, newItem]
                });
              }}
              className="mt-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
            >
              + Ajouter un élément
            </button>
          </div>
        </div>
      );

    case 'drag-drop':
      return (
        <div className="space-y-4">
          {/* Zones de dépôt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zones de dépôt
            </label>
            <div className="space-y-2">
              {question.dragDropData?.zones?.map((zone, index) => (
                <div key={zone.id} className="flex items-center space-x-3 p-3 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                  <div className="text-blue-600 font-medium text-sm">Zone {index + 1}:</div>
                  <input
                    type="text"
                    value={zone.label}
                    onChange={(e) => {
                      const updatedZones = [...(question.dragDropData?.zones || [])];
                      updatedZones[index] = { ...zone, label: e.target.value };
                      updateQuestion(question.id, 'dragDropData', {
                        ...question.dragDropData,
                        zones: updatedZones
                      });
                    }}
                    placeholder="Nom de la zone"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Éléments à glisser */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Éléments à glisser-déposer
            </label>
            <div className="space-y-2">
              {question.dragDropData?.items?.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updatedItems = [...(question.dragDropData?.items || [])];
                      updatedItems[index] = { ...item, text: e.target.value };
                      updateQuestion(question.id, 'dragDropData', {
                        ...question.dragDropData,
                        items: updatedItems
                      });
                    }}
                    placeholder="Texte de l'élément"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <select
                    value={item.correctZoneId || ''}
                    onChange={(e) => {
                      const updatedItems = [...(question.dragDropData?.items || [])];
                      updatedItems[index] = { ...item, correctZoneId: e.target.value };
                      updateQuestion(question.id, 'dragDropData', {
                        ...question.dragDropData,
                        items: updatedItems
                      });
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="">Sélectionner la zone correcte</option>
                    {question.dragDropData?.zones?.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.label || `Zone ${(question.dragDropData?.zones?.indexOf(zone) ?? -1) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'audio':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier audio de la question *
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
              {question.audioData?.localAudioUrl ? (
                <div className="space-y-3">
                  <audio 
                    controls 
                    src={question.audioData.localAudioUrl}
                    className="mx-auto"
                  >
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                  <p className="text-sm text-gray-600">
                    {question.audioData.audioName}
                  </p>
                  <button
                    onClick={() => {
                      if (question.audioData?.localAudioUrl) {
                        URL.revokeObjectURL(question.audioData.localAudioUrl);
                      }
                      updateQuestion(question.id, 'audioData', undefined);
                    }}
                    className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Supprimer l'audio
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".wav,.mp3,.m4a,.ogg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const localUrl = URL.createObjectURL(file);
                        updateQuestion(question.id, 'audioData', {
                          audioFile: file,
                          localAudioUrl: localUrl,
                          audioName: file.name
                        });
                      }
                    }}
                    className="mb-3"
                  />
                  <p className="text-sm text-gray-500">
                    Formats supportés: WAV, MP3, M4A, OGG
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const QuizEditor = ({ lesson, onChange }: EditorProps) => {
  const quizData = lesson.content.quizData || { questions: [] };
  
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      type: 'multiple',
      question: '',
      options: ['', ''], // Start with 2 options minimum
      correctAnswer: 0,
      explanation: ''
    };
    
    onChange('quizData', {
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    });
  };

  const deleteQuestion = (questionId: string) => {
    onChange('quizData', {
      ...quizData,
      questions: quizData.questions.filter((q: QuizQuestion) => q.id !== questionId)
    });
  };

  const updateQuestion = (questionId: string, field: string, value: unknown) => {
    onChange('quizData', {
      ...quizData,
      questions: quizData.questions.map((q: QuizQuestion) => {
        if (q.id === questionId) {
          const updatedQuestion = { ...q, [field]: value };
          
          // Handle type change to update correctAnswer format and initialize type-specific data
          if (field === 'type') {
            if (value === 'checkbox') {
              // Convert to array format for multiple choice
              updatedQuestion.correctAnswer = Array.isArray(q.correctAnswer) 
                ? q.correctAnswer 
                : [q.correctAnswer as number].filter(idx => idx >= 0);
            } else if (value === 'multiple') {
              // Convert to single number format for single choice
              updatedQuestion.correctAnswer = Array.isArray(q.correctAnswer) 
                ? (q.correctAnswer[0] ?? 0)
                : q.correctAnswer;
            } else if (value === 'fill-blanks') {
              // Initialize fill-blanks data
              updatedQuestion.fillBlanksData = {
                textWithBlanks: '',
                blanks: []
              };
              updatedQuestion.correctAnswer = '';
            } else if (value === 'ordering') {
              // Initialize ordering data
              updatedQuestion.orderingData = {
                items: [
                  { id: `item-${Date.now()}`, text: '', correctPosition: 0 },
                  { id: `item-${Date.now() + 1}`, text: '', correctPosition: 1 }
                ]
              };
              updatedQuestion.correctAnswer = [];
            } else if (value === 'drag-drop') {
              // Initialize drag-drop data
              updatedQuestion.dragDropData = {
                zones: [
                  { id: `zone-${Date.now()}`, label: '', acceptedItems: [] },
                  { id: `zone-${Date.now() + 1}`, label: '', acceptedItems: [] }
                ],
                items: [
                  { id: `item-${Date.now()}`, text: '', correctZoneId: '' }
                ]
              };
              updatedQuestion.correctAnswer = [];
            } else if (value === 'audio') {
              // Initialize audio data
              updatedQuestion.audioData = {
                audioFile: undefined,
                localAudioUrl: '',
                uploadedAudioUrl: '',
                audioName: '',
                duration: 0
              };
              updatedQuestion.correctAnswer = '';
            } else if (value === 'text') {
              // For free text, just use string
              updatedQuestion.correctAnswer = '';
            }
          }
          
          return updatedQuestion;
        }
        return q;
      })
    });
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    onChange('quizData', {
      ...quizData,
      questions: quizData.questions.map((q: QuizQuestion) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    });
  };

  const setCorrectAnswer = (questionId: string, optionIndex: number) => {
    const question = quizData.questions.find((q: QuizQuestion) => q.id === questionId);
    if (!question) return;

    if (question.type === 'checkbox') {
      // For multiple choice, toggle the option in the array
      const currentAnswers = Array.isArray(question.correctAnswer) 
        ? (question.correctAnswer.filter(item => typeof item === 'number') as number[])
        : [];
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter(index => index !== optionIndex)
        : [...currentAnswers, optionIndex];
      updateQuestion(questionId, 'correctAnswer', newAnswers);
    } else {
      // For single choice, set the option index
      updateQuestion(questionId, 'correctAnswer', optionIndex);
    }
  };

  const addOption = (questionId: string) => {
    onChange('quizData', {
      ...quizData,
      questions: quizData.questions.map((q: QuizQuestion) => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    onChange('quizData', {
      ...quizData,
      questions: quizData.questions.map((q: QuizQuestion) => {
        if (q.id === questionId && q.options.length > 2) { // Minimum 2 options
          const newOptions = q.options.filter((_, index) => index !== optionIndex);
          let newCorrectAnswer = q.correctAnswer;
          
          // Update correct answers when removing options
          if (q.type === 'checkbox' && Array.isArray(q.correctAnswer)) {
            newCorrectAnswer = (q.correctAnswer as number[])
              .map(idx => typeof idx === 'number' && idx > optionIndex ? idx - 1 : idx)
              .filter(idx => typeof idx === 'number' && idx !== optionIndex) as number[];
          } else if (typeof q.correctAnswer === 'number') {
            if (q.correctAnswer === optionIndex) {
              newCorrectAnswer = 0; // Reset to first option if removed option was correct
            } else if (q.correctAnswer > optionIndex) {
              newCorrectAnswer = q.correctAnswer - 1;
            }
          }
          
          return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
        }
        return q;
      })
    });
  };

  const isOptionCorrect = (question: QuizQuestion, optionIndex: number) => {
    if (question.type === 'checkbox') {
      return Array.isArray(question.correctAnswer) && 
             question.correctAnswer.some(answer => 
               typeof answer === 'number' && answer === optionIndex
             );
    } else if (question.type === 'multiple') {
      return typeof question.correctAnswer === 'number' && question.correctAnswer === optionIndex;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Questions du quiz</h4>
          <p className="text-sm text-gray-500 mt-1">Créez un quiz interactif pour vos étudiants</p>
        </div>
        <Button onClick={addQuestion} size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
          <Add color="white" size={16} className="mr-2" />
          Ajouter une question
        </Button>
      </div>
      
      {quizData.questions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50 flex flex-col items-center">
          <MessageQuestion color="#C084FC" size={48} className="mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Quiz vide</h4>
          <p className="text-gray-600 mb-4">Ajoutez votre première question pour commencer</p>
          <Button onClick={addQuestion} className="bg-purple-600 text-white hover:bg-purple-700">
            <Add color="white" size={16} className="mr-2" />
            Première question
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {quizData.questions.map((question: QuizQuestion, index: number) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <select 
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="multiple">QCM (choix unique)</option>
                        <option value="checkbox">QCM (choix multiple)</option>
                        <option value="text">Réponse libre</option>
                        <option value="fill-blanks">Texte à trous</option>
                        <option value="ordering">Classement / Ordonnancement</option>
                        <option value="drag-drop">Glisser-déposer</option>
                        <option value="audio">Quiz oral / audio</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Supprimer la question"
                >
                  <Trash color="#EF4444" size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <Input
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Saisissez votre question ici..."
                    className="text-base"
                  />
                </div>
                
                {/* Support d'image pour la question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de la question (optionnel)
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    {question.questionImage?.localUrl ? (
                      <div className="space-y-3">
                        <img 
                          src={question.questionImage.localUrl} 
                          alt="Question" 
                          className="max-w-full max-h-48 object-contain mx-auto border border-gray-200 rounded"
                        />
                        <p className="text-sm text-gray-600 text-center">
                          {question.questionImage.name}
                        </p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              if (question.questionImage?.localUrl) {
                                URL.revokeObjectURL(question.questionImage.localUrl);
                              }
                              updateQuestion(question.id, 'questionImage', undefined);
                            }}
                            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                          >
                            Supprimer l'image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const localUrl = URL.createObjectURL(file);
                              updateQuestion(question.id, 'questionImage', {
                                file,
                                localUrl,
                                name: file.name
                              });
                            }
                          }}
                          className="mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          Formats supportés: JPG, PNG, GIF, WEBP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Support de code pour la question */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={!!question.codeSnippet}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateQuestion(question.id, 'codeSnippet', {
                            code: '',
                            language: 'javascript'
                          });
                        } else {
                          updateQuestion(question.id, 'codeSnippet', undefined);
                        }
                      }}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>Inclure du code dans la question</span>
                  </label>
                  
                  {question.codeSnippet && (
                    <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Langage de programmation
                        </label>
                        <select
                          value={question.codeSnippet.language}
                          onChange={(e) => updateQuestion(question.id, 'codeSnippet', {
                            ...question.codeSnippet,
                            language: e.target.value
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                          <option value="csharp">C#</option>
                          <option value="php">PHP</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="sql">SQL</option>
                          <option value="json">JSON</option>
                          <option value="xml">XML</option>
                          <option value="bash">Bash</option>
                          <option value="typescript">TypeScript</option>
                          <option value="ruby">Ruby</option>
                          <option value="go">Go</option>
                          <option value="rust">Rust</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code
                        </label>
                        <textarea
                          value={question.codeSnippet.code}
                          onChange={(e) => updateQuestion(question.id, 'codeSnippet', {
                            ...question.codeSnippet,
                            code: e.target.value
                          })}
                          placeholder="Saisissez votre code ici..."
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono bg-white"
                          style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                        />
                      </div>
                      
                      <div className="bg-white border border-gray-300 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-2">Aperçu du code:</p>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                          <code className={`language-${question.codeSnippet.language}`}>
                            {question.codeSnippet.code || '// Votre code apparaîtra ici'}
                          </code>
                        </pre>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Le code sera affiché avec coloration syntaxique aux étudiants. 
                        Vous pouvez poser des questions sur ce code (ex: "Que retourne cette fonction?", "Quelle sera la valeur de x?", etc.).
                      </p>
                    </div>
                  )}
                </div>

                {/* Contenu spécifique par type de question */}
                {renderQuestionContent(question, updateQuestion)}

                {/* Options pour QCM (choix unique et multiple) */}
                {(question.type === 'multiple' || question.type === 'checkbox') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options de réponse *
                      </label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addOption(question.id)}
                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        <Add color="#8B5CF6" size={14} className="mr-1" />
                        Ajouter option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type={question.type === 'multiple' ? 'radio' : 'checkbox'}
                            name={`question-${question.id}`}
                            checked={isOptionCorrect(question, optionIndex)}
                            onChange={() => setCorrectAnswer(question.id, optionIndex)}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-2">
                            {isOptionCorrect(question, optionIndex) && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                {question.type === 'checkbox' ? 'Correcte' : 'Correcte'}
                              </span>
                            )}
                            {question.options.length > 2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash color="#EF4444" size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {question.type === 'checkbox' 
                        ? 'Cochez plusieurs réponses pour les questions à choix multiple' 
                        : 'Sélectionnez une seule réponse correcte'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explication (optionnel)
                  </label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                    placeholder="Expliquez pourquoi cette réponse est correcte..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center flex justify-center">
            <Button onClick={addQuestion} variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
              <Add color="#8B5CF6" size={16} className="mr-2" />
              Ajouter une autre question
            </Button>
          </div>
        </div>
      )}
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h5 className="font-medium text-purple-900 mb-2">Statistiques du quiz</h5>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-purple-700">Questions :</span>
            <span className="ml-2 font-medium">{quizData.questions.length}</span>
          </div>
          <div>
            <span className="text-purple-700">Questions complètes :</span>
            <span className="ml-2 font-medium">
              {quizData.questions.filter((q: QuizQuestion) => {
                const hasQuestion = q.question.trim();
                const hasOptions = q.type === 'text' || q.options.every((opt: string) => opt.trim());
                const hasCorrectAnswer = q.type === 'text' || 
                  (q.type === 'checkbox' ? Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0 : 
                   typeof q.correctAnswer === 'number' && q.correctAnswer >= 0);
                return hasQuestion && hasOptions && hasCorrectAnswer;
              }).length}
            </span>
          </div>
          <div>
            <span className="text-purple-700">Durée estimée :</span>
            <span className="ml-2 font-medium">{quizData.questions.length * 2} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Model3DEditor = ({ lesson, onChange, onUpload, uploadProgress }: EditorProps) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        URL du modèle 3D
      </label>
      <Input
        value={lesson.content.model3dUrl || ''}
        onChange={(e) => onChange('model3dUrl', e.target.value)}
        placeholder="https://example.com/model.gltf"
      />
    </div>
    
    <div className="text-center py-8 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 flex flex-col items-center">
      <Box color="#FB923C" size={48} className="mb-4" />
      <p className="text-gray-600 mb-4">Formats supportés: .gltf, .glb, .obj, .fbx</p>
      <input
        type="file"
        accept=".gltf,.glb,.obj,.fbx"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUpload?.(e.target.files[0], '3d');
            toast.loading('Téléchargement du modèle 3D en cours...');
          }
        }}
        className="hidden"
        id="model-upload"
      />
      <label htmlFor="model-upload">
        <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 cursor-pointer">
          <Import color="#EA580C" size={16} className="mr-2" />
          Télécharger un modèle 3D
        </Button>
      </label>
      {uploadProgress !== null && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{uploadProgress}% téléchargé</p>
        </div>
      )}
    </div>
  </div>
);

const DocumentEditor = ({ lesson, onChange }: Omit<EditorProps, 'uploadProgress'>) => {
  // Force re-render when lesson content changes
  useEffect(() => {
    console.log('📄 DocumentEditor - useEffect triggered - lesson updated:', lesson.content.localDocument ? 'FILE PRESENT' : 'NO FILE');
  }, [lesson.content.localDocument, lesson.content.documentUrl]);

  const handleFileSelect = (localFile: LocalFile | null) => {
    console.log('📄 DocumentEditor - handleFileSelect appelé avec:', localFile);
    console.log('📄 DocumentEditor - onChange function:', typeof onChange);
    
    onChange('localDocument', localFile);
    console.log('📄 DocumentEditor - localDocument mis à jour');
    
    // Effacer l'URL si on sélectionne un fichier local
    if (localFile) {
      console.log('📄 DocumentEditor - Nettoyage des anciens champs URL');
      onChange('documentUrl', '');
      onChange('documentName', '');
      onChange('documentType', '');
    }
    
    console.log('📄 DocumentEditor - handleFileSelect terminé');
  };

  const handleRemoveDocument = () => {
    // Nettoyer l'URL locale si c'est un fichier local
    if (lesson.content.localDocument) {
      URL.revokeObjectURL(lesson.content.localDocument.preview);
    }
    onChange('localDocument', null);
    onChange('documentUrl', '');
    onChange('documentName', '');
    onChange('documentType', '');
  };

  // Déterminer le fichier existant (local ou uploadé)
  const existingFile: LocalFile | UploadedFile | null = lesson.content.localDocument || 
    (lesson.content.documentUrl ? {
      url: lesson.content.documentUrl,
      name: lesson.content.documentName || 'Document',
      type: lesson.content.documentType
    } as UploadedFile : null);
  
  console.log('📄 DocumentEditor - existingFile:', existingFile);
  console.log('📄 DocumentEditor - lesson.content.localDocument:', lesson.content.localDocument);
  console.log('📄 DocumentEditor - lesson.content.documentUrl:', lesson.content.documentUrl);
  console.log('📄 DocumentEditor - lesson object complet:', lesson);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL du document (optionnel)
        </label>
        <Input
          value={lesson.content.documentUrl || ''}
          onChange={(e) => {
            onChange('documentUrl', e.target.value);
            // Si on met une URL, effacer le fichier local
            if (e.target.value && lesson.content.localDocument) {
              URL.revokeObjectURL(lesson.content.localDocument.preview);
              onChange('localDocument', null);
            }
          }}
          placeholder="https://example.com/document.pdf"
          disabled={!!lesson.content.localDocument}
        />
        <p className="text-xs text-gray-500 mt-1">
          Vous pouvez coller une URL ou télécharger un fichier ci-dessous
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Document
        </label>
        <DocumentUpload
          onFileSelect={handleFileSelect}
          onRemove={existingFile ? handleRemoveDocument : undefined}
          existingFile={existingFile}
        />
      </div>
    </div>
  );
};

const AssignmentEditor = ({ lesson, onChange }: EditorProps) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'resources' | 'submission' | 'grading'>('instructions');
  const assignmentData = lesson.content.assignmentData || {};

  const updateAssignmentData = (field: string, value: unknown) => {
    onChange('assignmentData', {
      ...assignmentData,
      [field]: value
    });
  };

  const tabs = [
    { id: 'instructions', name: 'Instructions', icon: <DocumentText color="#6366F1" size={16} /> },
    { id: 'resources', name: 'Ressources', icon: <Link color="#6366F1" size={16} /> },
    { id: 'submission', name: 'Remise', icon: <Import color="#6366F1" size={16} /> },
    { id: 'grading', name: 'Notation', icon: <MessageQuestion color="#6366F1" size={16} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'instructions' | 'resources' | 'submission' | 'grading')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'instructions' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du devoir
            </label>
            <Input
              value={assignmentData.title || ''}
              onChange={(e) => updateAssignmentData('title', e.target.value)}
              placeholder="Titre de votre devoir..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions détaillées
            </label>
            <RichTextEditor
              value={assignmentData.instructions || ''}
              onChange={(content: string) => {
                updateAssignmentData('instructions', content);
              }}
              placeholder="Décrivez clairement ce que les étudiants doivent faire, les critères d'évaluation, les livrables attendus..."
            />
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents de référence
            </label>
            <Input
              value={assignmentData.documentUrl || ''}
              onChange={(e) => updateAssignmentData('documentUrl', e.target.value)}
              placeholder="URL vers un document PDF, Word, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vidéo explicative (optionnel)
            </label>
            <Input
              value={assignmentData.videoUrl || ''}
              onChange={(e) => updateAssignmentData('videoUrl', e.target.value)}
              placeholder="URL YouTube, Vimeo ou lien direct vers une vidéo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Liens utiles
            </label>
            <div className="space-y-2">
              {(assignmentData.resourceLinks || ['']).map((link: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...(assignmentData.resourceLinks || [''])];
                      newLinks[index] = e.target.value;
                      updateAssignmentData('resourceLinks', newLinks);
                    }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newLinks = (assignmentData.resourceLinks || []).filter((_: string, i: number) => i !== index);
                        updateAssignmentData('resourceLinks', newLinks);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash color="#EF4444" size={14} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newLinks = [...(assignmentData.resourceLinks || ['']), ''];
                  updateAssignmentData('resourceLinks', newLinks);
                }}
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                <Add color="#6366F1" size={14} className="mr-2" />
                Ajouter un lien
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submission' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date limite
              </label>
              <Input
                type="datetime-local"
                value={assignmentData.dueDate || ''}
                onChange={(e) => updateAssignmentData('dueDate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de soumission
              </label>
              <select
                value={assignmentData.submissionType || 'file'}
                onChange={(e) => updateAssignmentData('submissionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="file">Fichier à télécharger</option>
                <option value="text">Texte en ligne</option>
                <option value="url">Lien URL</option>
                <option value="both">Fichier et texte</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formats de fichiers acceptés
            </label>
            <Input
              value={assignmentData.acceptedFormats || '.pdf,.doc,.docx,.txt'}
              onChange={(e) => updateAssignmentData('acceptedFormats', e.target.value)}
              placeholder=".pdf,.doc,.docx,.txt"
            />
            <p className="text-xs text-gray-500 mt-1">
              Séparez les extensions par des virgules (ex: .pdf,.doc,.docx)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taille maximale (MB)
            </label>
            <Input
              type="number"
              value={assignmentData.maxFileSize || 10}
              onChange={(e) => updateAssignmentData('maxFileSize', Number(e.target.value))}
              min="1"
              max="100"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowLateSubmission"
              checked={assignmentData.allowLateSubmission || false}
              onChange={(e) => updateAssignmentData('allowLateSubmission', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="allowLateSubmission" className="text-sm text-gray-700">
              Autoriser les soumissions en retard
            </label>
          </div>
        </div>
      )}

      {activeTab === 'grading' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points maximum
              </label>
              <Input
                type="number"
                value={assignmentData.maxPoints || 100}
                onChange={(e) => updateAssignmentData('maxPoints', Number(e.target.value))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'évaluation
              </label>
              <select
                value={assignmentData.gradingType || 'points'}
                onChange={(e) => updateAssignmentData('gradingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="points">Points numériques</option>
                <option value="letter">Notes lettres (A, B, C...)</option>
                <option value="pass_fail">Réussi/Échoué</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critères d'évaluation
            </label>
            <textarea
              value={assignmentData.gradingCriteria || ''}
              onChange={(e) => updateAssignmentData('gradingCriteria', e.target.value)}
              placeholder="Définissez les critères d'évaluation, barème, etc..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoGrade"
              checked={assignmentData.autoGrade || false}
              onChange={(e) => updateAssignmentData('autoGrade', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoGrade" className="text-sm text-gray-700">
              Évaluation automatique (pour quiz intégrés)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="peerReview"
              checked={assignmentData.peerReview || false}
              onChange={(e) => updateAssignmentData('peerReview', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="peerReview" className="text-sm text-gray-700">
              Évaluation par les pairs
            </label>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h5 className="font-medium text-indigo-900 mb-2">Résumé du devoir</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-indigo-700">Type :</span>
            <span className="ml-2 font-medium">
              {assignmentData.submissionType === 'file' ? 'Fichier' : 
               assignmentData.submissionType === 'text' ? 'Texte' :
               assignmentData.submissionType === 'url' ? 'URL' : 'Mixte'}
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Points :</span>
            <span className="ml-2 font-medium">{assignmentData.maxPoints || 100} pts</span>
          </div>
          <div>
            <span className="text-indigo-700">Deadline :</span>
            <span className="ml-2 font-medium">
              {assignmentData.dueDate ? new Date(assignmentData.dueDate).toLocaleString('fr-FR') : 'Non définie'}
            </span>
          </div>
          <div>
            <span className="text-indigo-700">Retard autorisé :</span>
            <span className="ml-2 font-medium">{assignmentData.allowLateSubmission ? 'Oui' : 'Non'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonPreview = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="text-center py-12 flex flex-col items-center">
      <Eye color="#60A5FA" size={48} className="mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Prévisualisation
      </h3>
      <p className="text-gray-500">
        La prévisualisation sera disponible après la sauvegarde
      </p>
    </div>
  </div>
);

export default LessonEditor;