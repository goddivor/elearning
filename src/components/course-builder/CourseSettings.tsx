import { useState } from 'react';
import { Setting2, Tag, Money, Global, Eye, Image } from 'iconsax-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import ImageUpload, { type LocalImage, type UploadedImage } from '@/components/ui/ImageUpload';
import { useToast } from '@/context/toast-context';
import type { Course } from '@/services/courseService';

interface Props {
  course: Partial<Course>;
  onUpdateCourse: (course: Partial<Course>) => void;
}

const CourseSettings = ({ course, onUpdateCourse }: Props) => {
  const { error: showError } = useToast();

  const handleImageSelect = (localImage: LocalImage | null) => {
    if (localImage) {
      // Stocker l'image locale dans le cours
      onUpdateCourse({ 
        ...course, 
        localThumbnail: localImage,
        thumbnailUrl: '', // Effacer l'URL si on sélectionne une image locale
        thumbnailPreview: ''
      });
    }
  };

  const handleRemoveImage = () => {
    // Nettoyer l'URL locale si c'est une image locale
    if (course.localThumbnail) {
      URL.revokeObjectURL(course.localThumbnail.preview);
    }
    onUpdateCourse({ 
      ...course, 
      localThumbnail: null,
      thumbnailUrl: '',
      thumbnailPreview: ''
    });
  };

  // Déterminer l'image existante (locale ou uploadée)
  const existingImage: LocalImage | UploadedImage | null = course.localThumbnail || 
    (course.thumbnailUrl ? {
      url: course.thumbnailUrl,
      name: 'Image de couverture',
      type: 'image/jpeg'
    } as UploadedImage : null);

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !course.tags?.includes(tag.trim())) {
      onUpdateCourse({
        ...course,
        tags: [...(course.tags || []), tag.trim()]
      });
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onUpdateCourse({
      ...course,
      tags: course.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Setting2 size={32} color="#7C3AED" variant="Bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Paramètres du Cours
            </h1>
            <p className="text-gray-600 mt-1">
              Configurez les détails avancés de votre cours
            </p>
          </div>
        </div>

        {/* Thumbnail & Media */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Image color="#6B7280" size={20} className="mr-2" />
            Image de couverture
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <Input
                  value={course.thumbnailUrl || ''}
                  onChange={(e) => {
                    // Si on saisit une URL, on efface l'image locale
                    if (e.target.value && course.localThumbnail) {
                      URL.revokeObjectURL(course.localThumbnail.preview);
                      onUpdateCourse({ 
                        ...course, 
                        thumbnailUrl: e.target.value,
                        localThumbnail: null
                      });
                    } else {
                      onUpdateCourse({ ...course, thumbnailUrl: e.target.value });
                    }
                  }}
                  placeholder="https://example.com/image.jpg ou téléchargez ci-dessous"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez soit coller une URL, soit télécharger une image
                </p>
              </div>
              
              <ImageUpload
                onImageSelect={handleImageSelect}
                onRemove={handleRemoveImage}
                existingImage={existingImage}
                className="w-full"
                aspectRatio="video"
              />

              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Recommandations</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Format: JPG, PNG, WebP</li>
                  <li>• Taille recommandée: 1200x600 px</li>
                  <li>• Ratio: 2:1 (paysage)</li>
                  <li>• Poids max: 5 MB</li>
                </ul>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aperçu de l'image de couverture
              </label>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                  {existingImage ? (
                    <>
                      <img
                        src={'preview' in existingImage ? existingImage.preview : existingImage.url}
                        alt="Aperçu du cours"
                        className="w-full h-full object-cover"
                        onError={() => {
                          showError('Erreur d\'image', 'Impossible de charger l\'image');
                        }}
                      />
                      {'preview' in existingImage && (
                        <div className="absolute bottom-2 left-2">
                          <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs">
                            📁 Image locale (à uploader)
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Image color="#9CA3AF" size={48} className="mx-auto mb-3" />
                        <p className="text-base font-medium mb-1">Aucune image</p>
                        <p className="text-sm">L'image de couverture apparaîtra ici</p>
                      </div>
                    </div>
                  )}
                </div>

                {existingImage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Eye color="#059669" size={16} />
                      <span>Aperçu du cours avec cette image</span>
                    </div>
                    <div className="mt-2 p-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <img
                          src={'preview' in existingImage ? existingImage.preview : existingImage.url}
                          alt="Miniature cours"
                          className="w-16 h-10 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {course.title || 'Titre du cours'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {course.description || 'Description du cours...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Access */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Money color="#6B7280" size={20} className="mr-2" />
            Prix et accès
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€)
              </label>
              <Input
                type="number"
                value={course.price || 0}
                onChange={(e) => onUpdateCourse({ ...course, price: Number(e.target.value) })}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez 0 pour un cours gratuit
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau
              </label>
              <select
                value={course.level || 'beginner'}
                onChange={(e) => onUpdateCourse({ ...course, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={course.category || 'programming'}
                onChange={(e) => onUpdateCourse({ ...course, category: e.target.value as Course['category'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="programming">Programmation</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="science">Science</option>
                <option value="mathematics">Mathématiques</option>
                <option value="languages">Langues</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Tag color="#6B7280" size={20} className="mr-2" />
            Tags et mots-clés
          </h3>
          
          <div className="space-y-4">
            <div>
              <TagInput onAddTag={handleTagAdd} />
              <p className="text-xs text-gray-500 mt-2">
                Ajoutez des mots-clés pour aider les étudiants à trouver votre cours
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {course.tags?.map((tag, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  onClick={() => handleTagRemove(tag)}
                >
                  {tag} ×
                </Badge>
              )) || []}
              {(!course.tags || course.tags.length === 0) && (
                <p className="text-gray-500 text-sm">Aucun tag ajouté</p>
              )}
            </div>
          </div>
        </div>

        {/* Publication Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Global color="#6B7280" size={20} className="mr-2" />
            Publication
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Statut du cours</h4>
                <p className="text-sm text-gray-500">
                  {course.isPublished 
                    ? 'Votre cours est visible par tous les étudiants'
                    : 'Votre cours est en mode brouillon, visible seulement par vous'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge
                  variant={course.isPublished ? 'success' : 'warning'}
                  size="sm"
                >
                  {course.isPublished ? 'Publié' : 'Brouillon'}
                </Badge>
                
                <Button
                  variant={course.isPublished ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => onUpdateCourse({ 
                    ...course, 
                    isPublished: !course.isPublished 
                  })}
                  className={!course.isPublished ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                >
                  {course.isPublished ? 'Dépublier' : 'Publier'}
                </Button>
              </div>
            </div>
            
            {!course.isPublished && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Eye color="#D97706" size={20} className="mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Cours en brouillon</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Votre cours est actuellement en mode brouillon. Il ne sera visible que par vous.
                      Assurez-vous d'avoir ajouté au moins un module et une leçon avant de publier.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            SEO et référencement
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL du cours (slug)
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-2">
                  https://elearning.com/course/
                </span>
                <Input
                  value={course.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''}
                  placeholder="mon-cours-react"
                  className="flex-1"
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Généré automatiquement à partir du titre du cours
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta description
              </label>
              <textarea
                value={course.description || ''}
                readOnly
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                placeholder="Description utilisée dans les résultats de recherche..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilise automatiquement la description du cours
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Paramètres avancés
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="mr-3"
                  defaultChecked={false}
                />
                <div>
                  <p className="font-medium text-gray-900">Certificat de completion</p>
                  <p className="text-sm text-gray-500">Délivrer un certificat à la fin du cours</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="mr-3"
                  defaultChecked={true}
                />
                <div>
                  <p className="font-medium text-gray-900">Discussion et commentaires</p>
                  <p className="text-sm text-gray-500">Permettre aux étudiants de commenter</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="mr-3"
                  defaultChecked={false}
                />
                <div>
                  <p className="font-medium text-gray-900">Accès limité dans le temps</p>
                  <p className="text-sm text-gray-500">Définir une durée d'accès au cours</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="mr-3"
                  defaultChecked={true}
                />
                <div>
                  <p className="font-medium text-gray-900">Suivi des progrès</p>
                  <p className="text-sm text-gray-500">Suivre la progression des étudiants</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tag Input Component
const TagInput = ({ onAddTag }: { onAddTag: (tag: string) => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTag(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddTag(inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ajouter un tag (Entrée ou virgule pour valider)"
        className="flex-1"
      />
      <Button type="submit" size="sm" variant="outline">
        Ajouter
      </Button>
    </form>
  );
};

export default CourseSettings;