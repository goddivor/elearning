import React, { useRef, useEffect, useState } from "react";
import { useToast } from '@/contexts/toast-context';
import { mediaService } from '@/services/mediaService';
import {
  ArrowUUpLeft,
  ArrowUUpRight,
  TextB,
  TextItalic,
  TextUnderline,
  Link,
  ListBullets,
  ListNumbers,
  Quotes,
  Code,
  TextH,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  Image as ImageIcon,
  X,
  CloudArrowUp,
  SpinnerGap,
} from '@phosphor-icons/react';

// Interface pour les images locales en attente d'upload
export interface LocalImage {
  file: File;
  localUrl: string;
  id: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  onLocalImagesChange?: (localImages: LocalImage[]) => void;
  localImages?: LocalImage[];
  placeholder?: string;
  label?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onLocalImagesChange,
  localImages = [],
  placeholder = "Commencez à écrire...",
  label,
  rows = 15,
  className = "",
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { success, error: showError } = useToast();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [isUploadingImage] = useState(false); // Garde pour l'UI mais plus utilisé car upload différé
  const [dragActive, setDragActive] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [linkInputType, setLinkInputType] = useState<'with-text' | 'without-text'>('with-text');
  const [imageWidth, setImageWidth] = useState('100');
  const [imageHeight, setImageHeight] = useState('auto');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, image: HTMLImageElement} | null>(null);

  // Toolbar configuration
  const toolbarGroups = [
    [
      { command: "undo", icon: <ArrowUUpLeft size={16} />, title: "Annuler" },
      { command: "redo", icon: <ArrowUUpRight size={16} />, title: "Rétablir" },
    ],
    [{ command: "formatBlock", icon: <TextH size={16} />, title: "Titre" }],
    [
      { command: "bold", icon: <TextB size={16} />, title: "Gras" },
      { command: "italic", icon: <TextItalic size={16} />, title: "Italique" },
      { command: "underline", icon: <TextUnderline size={16} />, title: "Souligné" },
    ],
    [
      { command: "justifyLeft", icon: <TextAlignLeft size={16} />, title: "Aligner à gauche" },
      { command: "justifyCenter", icon: <TextAlignCenter size={16} />, title: "Centrer" },
      { command: "justifyRight", icon: <TextAlignRight size={16} />, title: "Aligner à droite" },
    ],
    [
      { command: "insertUnorderedList", icon: <ListBullets size={16} />, title: "Liste à puces" },
      { command: "insertOrderedList", icon: <ListNumbers size={16} />, title: "Liste numérotée" },
    ],
    [
      { command: "uppercase", icon: <span className="text-xs font-bold">AA</span>, title: "MAJUSCULES" },
      { command: "lowercase", icon: <span className="text-xs font-bold">aa</span>, title: "minuscules" },
      { command: "capitalize", icon: <span className="text-xs font-bold">Aa</span>, title: "Capitaliser" },
    ],
    [
      { command: "createLink", icon: <Link size={16} />, title: "Insérer un lien" },
      { command: "insertImage", icon: <ImageIcon size={16} />, title: "Insérer une image" },
      { command: "formatBlock", icon: <Quotes size={16} />, title: "Citation" },
      { command: "formatBlock", icon: <Code size={16} />, title: "Code" },
    ],
  ];

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Update editor content when value changes (for editing existing content)
  useEffect(() => {
    if (
      editorRef.current &&
      isInitialized &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isInitialized]);

  // Handle content change
  const handleInput = () => {
    if (editorRef.current && !disabled) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  // Execute formatting command
  const executeCommand = (command: string, value?: string) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Insert image at cursor position
  const insertImageAtCursor = (imageUrl: string, altText: string) => {
    if (disabled) return;
    
    console.log('🖼️ RichTextEditor - insertImageAtCursor appelé', {imageUrl, altText, imageWidth, imageHeight});
    
    // Calculer les styles de taille
    let sizeStyle = '';
    if (maintainAspectRatio) {
      if (imageWidth !== '100' && imageWidth !== 'auto') {
        sizeStyle = `width: ${imageWidth}%; height: auto;`;
      } else {
        sizeStyle = 'max-width: 100%; height: auto;';
      }
    } else {
      const widthValue = imageWidth === 'auto' ? 'auto' : `${imageWidth}%`;
      const heightValue = imageHeight === 'auto' ? 'auto' : `${imageHeight}px`;
      sizeStyle = `width: ${widthValue}; height: ${heightValue};`;
    }
    
    const imgHtml = `<img src="${imageUrl}" alt="${altText}" style="${sizeStyle} margin: 1rem 0; border-radius: 0.5rem; display: block; cursor: pointer;" class="rich-editor-image" />`;

    try {
      // Restaurer la position du curseur avant l'insertion
      if (savedRange) {
        restoreCursorPosition();
        
        // Insérer l'image à la position sauvegardée
        if (document.queryCommandSupported("insertHTML")) {
          document.execCommand("insertHTML", false, imgHtml);
        } else {
          // Utiliser la range sauvegardée
          savedRange.deleteContents();
          const imgElement = document.createElement("img");
          imgElement.src = imageUrl;
          imgElement.alt = altText;
          imgElement.className = "rich-editor-image";
          imgElement.style.cssText = `${sizeStyle} margin: 1rem 0; border-radius: 0.5rem; display: block; cursor: pointer;`;
          
          savedRange.insertNode(imgElement);
          savedRange.setStartAfter(imgElement);
          savedRange.collapse(true);
          
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          }
        }
      } else {
        // Fallback si pas de position sauvegardée
        editorRef.current?.focus();
        if (document.queryCommandSupported("insertHTML")) {
          document.execCommand("insertHTML", false, imgHtml);
        } else if (editorRef.current) {
          editorRef.current.innerHTML += imgHtml;
        }
      }
      
      // Nettoyer la position sauvegardée
      setSavedRange(null);
      
    } catch (error) {
      console.warn("Failed to insert image at cursor:", error);
      // Fallback: insérer à la fin
      if (editorRef.current) {
        editorRef.current.innerHTML += imgHtml;
      }
    }

    // Trigger change event
    handleInput();
  };

  // Transform text case
  const transformTextCase = (transformation: 'uppercase' | 'lowercase' | 'capitalize') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) {
      showError('Sélection requise', 'Veuillez sélectionner du texte pour changer la casse');
      return;
    }
    
    let transformedText = '';
    switch (transformation) {
      case 'uppercase':
        transformedText = selectedText.toUpperCase();
        break;
      case 'lowercase':
        transformedText = selectedText.toLowerCase();
        break;
      case 'capitalize':
        transformedText = selectedText.replace(/\b\w/g, char => char.toUpperCase());
        break;
    }
    
    // Replace selected text with transformed text
    range.deleteContents();
    range.insertNode(document.createTextNode(transformedText));
    
    // Update the content
    handleInput();
  };
  
  // Handle special commands
  const handleSpecialCommand = (command: string) => {
    if (disabled) return;
    
    switch (command) {
      case "h1":
        executeCommand("formatBlock", "<h1>");
        break;
      case "h2":
        executeCommand("formatBlock", "<h2>");
        break;
      case "h3":
        executeCommand("formatBlock", "<h3>");
        break;
      case "p":
        executeCommand("formatBlock", "<p>");
        break;
      case "blockquote":
        executeCommand("formatBlock", "<blockquote>");
        break;
      case "code":
        executeCommand("formatBlock", "<pre>");
        break;
      case "createLink":
        handleCreateLink();
        break;
      case "insertImage":
        handleInsertImage();
        break;
      case "uppercase":
        transformTextCase('uppercase');
        break;
      case "lowercase":
        transformTextCase('lowercase');
        break;
      case "capitalize":
        transformTextCase('capitalize');
        break;
      default:
        executeCommand(command);
    }
  };

  // Handle link creation
  const handleCreateLink = () => {
    if (disabled) return;
    
    console.log('🔗 RichTextEditor - handleCreateLink appelé');
    
    // Sauvegarder la position du curseur
    saveCursorPosition();
    
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Cas avec texte sélectionné
      console.log('🔗 Texte sélectionné:', selection.toString());
      setSelectedText(selection.toString());
      setLinkInputType('with-text');
    } else {
      // Cas sans texte sélectionné
      console.log('🔗 Pas de texte sélectionné');
      setSelectedText('');
      setLinkInputType('without-text');
    }
    
    setLinkUrl('');
    setShowLinkInput(true);
  };

  // Save cursor position before opening modal
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSavedRange(range.cloneRange());
      console.log('🎯 RichTextEditor - Position du curseur sauvegardée');
    }
  };
  
  // Restore cursor position
  const restoreCursorPosition = () => {
    if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
        editorRef.current.focus();
        console.log('🎯 RichTextEditor - Position du curseur restaurée');
      }
    }
  };

  // Handle image insertion
  const handleInsertImage = () => {
    if (disabled) return;
    
    // Sauvegarder la position du curseur avant d'ouvrir le modal
    saveCursorPosition();
    
    setShowImageInput(true);
    setImageUrl("");
    setImageAlt("");
    setImageWidth('100');
    setImageHeight('auto');
    setMaintainAspectRatio(true);
  };

  // Insert link with URL
  const insertLink = () => {
    if (!linkUrl || disabled) {
      showError('URL invalide', 'Veuillez entrer une URL valide');
      return;
    }
    
    console.log('🔗 RichTextEditor - insertLink appelé', {
      linkUrl, 
      selectedText, 
      linkInputType, 
      hasSavedRange: !!savedRange
    });
    
    try {
      if (linkInputType === 'with-text' && selectedText) {
        // Cas avec texte sélectionné : remplacer par un lien
        if (savedRange) {
          restoreCursorPosition();
          const linkHtml = `<a href="${linkUrl}" style="color: #2563eb; text-decoration: underline;">${selectedText}</a>`;
          
          if (document.queryCommandSupported("insertHTML")) {
            document.execCommand("insertHTML", false, linkHtml);
          } else {
            savedRange.deleteContents();
            const linkElement = document.createElement("a");
            linkElement.href = linkUrl;
            linkElement.textContent = selectedText;
            linkElement.style.color = '#2563eb';
            linkElement.style.textDecoration = 'underline';
            savedRange.insertNode(linkElement);
          }
        } else {
          executeCommand("createLink", linkUrl);
        }
      } else {
        // Cas sans texte sélectionné : insérer un nouveau lien
        const linkText = linkUrl; // Utiliser l'URL comme texte par défaut
        const linkHtml = `<a href="${linkUrl}" style="color: #2563eb; text-decoration: underline;">${linkText}</a>`;
        
        if (savedRange) {
          restoreCursorPosition();
          if (document.queryCommandSupported("insertHTML")) {
            document.execCommand("insertHTML", false, linkHtml);
          } else {
            const linkElement = document.createElement("a");
            linkElement.href = linkUrl;
            linkElement.textContent = linkText;
            linkElement.style.color = '#2563eb';
            linkElement.style.textDecoration = 'underline';
            savedRange.insertNode(linkElement);
          }
        } else {
          // Fallback
          if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand("insertHTML", false, linkHtml);
          }
        }
      }
      
      // Nettoyer les variables
      setSavedRange(null);
      handleInput(); // Déclencher la mise à jour du contenu
      
    } catch (error) {
      console.error('🔗 Erreur lors de l\'insertion du lien:', error);
      showError('Erreur de lien', 'Erreur lors de l\'insertion du lien');
    }
    
    // Fermer le modal
    setShowLinkInput(false);
    setLinkUrl("");
    setSelectedText("");
  };

  // Insert image with URL and alt text
  const insertImage = () => {
    if (imageUrl && !disabled) {
      insertImageAtCursor(imageUrl, imageAlt || "Image");
      setShowImageInput(false);
      setImageUrl("");
      setImageAlt("");
      setImageWidth('100');
      setImageHeight('auto');
      setMaintainAspectRatio(true);
    }
  };
  
  // Handle image context menu
  const handleImageContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('rich-editor-image')) {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        image: target as HTMLImageElement
      });
    }
  };
  
  // Close context menu
  const closeContextMenu = () => {
    setContextMenu(null);
  };
  
  // Delete image
  const deleteImage = () => {
    if (contextMenu?.image) {
      contextMenu.image.remove();
      handleInput();
      closeContextMenu();
    }
  };
  
  // Resize image
  const resizeImage = (width: string) => {
    if (contextMenu?.image) {
      if (width === 'small') {
        contextMenu.image.style.width = '25%';
      } else if (width === 'medium') {
        contextMenu.image.style.width = '50%';
      } else if (width === 'large') {
        contextMenu.image.style.width = '75%';
      } else if (width === 'full') {
        contextMenu.image.style.width = '100%';
      }
      contextMenu.image.style.height = 'auto';
      handleInput();
      closeContextMenu();
    }
  };

  // Handle file upload - store locally like DocumentUpload
  const handleImageUpload = (file: File) => {
    if (disabled) return;
    
    console.log('🖼️ RichTextEditor - handleImageUpload appelé avec:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Validate file using our media service
    const validation = mediaService.validateFile(file, mediaService.getValidationOptions('image'));
    if (!validation.valid) {
      showError('Image invalide', validation.error || 'Fichier image invalide');
      return;
    }

    // Créer une URL locale pour l'image
    const localUrl = URL.createObjectURL(file);
    const imageId = Date.now().toString() + '_' + Math.random().toString(36).substring(2);
    
    const localImage: LocalImage = {
      file,
      localUrl,
      id: imageId
    };

    console.log('🖼️ RichTextEditor - Image locale créée:', localImage);
    
    // Ajouter l'image à la liste des images locales
    const updatedLocalImages = [...localImages, localImage];
    onLocalImagesChange?.(updatedLocalImages);
    
    // Utiliser l'URL locale pour l'affichage
    setImageUrl(localUrl);
    success('Image sélectionnée', 'L\'image sera uploadée à la sauvegarde');
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      console.log('🖼️ RichTextEditor - Fichier sélectionné via input:', file.name);
      handleImageUpload(file);
    }
  };

  // Handle drag events for image upload
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!disabled && e.dataTransfer.files) {
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        console.log('🖼️ RichTextEditor - Fichier droppé:', files[0].name);
        handleImageUpload(files[0]);
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          executeCommand("bold");
          break;
        case "i":
          e.preventDefault();
          executeCommand("italic");
          break;
        case "u":
          e.preventDefault();
          executeCommand("underline");
          break;
        case "k":
          e.preventDefault();
          handleCreateLink();
          break;
        case "z":
          e.preventDefault();
          executeCommand(e.shiftKey ? "redo" : "undo");
          break;
      }
    }
  };

  // Check if command is active
  const isCommandActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  // Handle heading dropdown
  const HeadingDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    const headingOptions = [
      { value: "p", label: "Paragraphe normal" },
      { value: "h1", label: "Titre 1" },
      { value: "h2", label: "Titre 2" },
      { value: "h3", label: "Titre 3" },
    ];

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Format de texte"
        >
          <TextH size={16} />
          <span className="text-xs">▼</span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
            {headingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleSpecialCommand(option.value);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${disabled ? 'opacity-50' : ''}`}>
        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-gray-50 p-2">
          <div className="flex flex-wrap items-center gap-1">
            {toolbarGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupIndex > 0 && (
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                )}

                {group.map((button, buttonIndex) => {
                  if (
                    button.command === "formatBlock" &&
                    button.title === "Titre"
                  ) {
                    return <HeadingDropdown key={buttonIndex} />;
                  }

                  if (
                    button.command === "formatBlock" &&
                    button.title === "Citation"
                  ) {
                    return (
                      <button
                        key={buttonIndex}
                        type="button"
                        onClick={() => handleSpecialCommand("blockquote")}
                        disabled={disabled}
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={button.title}
                      >
                        {button.icon}
                      </button>
                    );
                  }

                  if (
                    button.command === "formatBlock" &&
                    button.title === "Code"
                  ) {
                    return (
                      <button
                        key={buttonIndex}
                        type="button"
                        onClick={() => handleSpecialCommand("code")}
                        disabled={disabled}
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={button.title}
                      >
                        {button.icon}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={buttonIndex}
                      type="button"
                      onClick={() => handleSpecialCommand(button.command)}
                      disabled={disabled}
                      className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCommandActive(button.command)
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={button.title}
                    >
                      {button.icon}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onContextMenu={handleImageContextMenu}
          onClick={() => setContextMenu(null)} // Fermer le menu contextuel si on clique dans l'éditeur
          className={`p-4 min-h-[300px] focus:outline-none ${disabled ? 'cursor-not-allowed' : ''}`}
          style={{ minHeight: `${rows * 1.5}rem` }}
          data-placeholder={placeholder}
          suppressContentEditableWarning={true}
        />
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Insérer un lien</h3>
            {linkInputType === 'with-text' && selectedText ? (
              <p className="text-sm text-gray-600 mb-4">
                Texte sélectionné: <strong>"{selectedText}"</strong>
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Un nouveau lien sera créé à la position du curseur
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du lien *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              {linkInputType === 'without-text' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Conseil :</strong> L'URL sera utilisée comme texte du lien. 
                    Vous pouvez sélectionner du texte dans l'éditeur avant de cliquer sur l'icône lien pour personnaliser le texte affiché.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
                setSelectedText("");
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
              Annuler
              </button>
              <button
              type="button"
              onClick={insertLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
              Insérer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Input Modal */}
      {showImageInput && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Insérer une image</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImageInput(false);
                  setImageUrl("");
                  setImageAlt("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Separator */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-sm text-gray-500">ou</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${
                  isUploadingImage
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() =>
                  !isUploadingImage && fileInputRef.current?.click()
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isUploadingImage}
                />

                {isUploadingImage ? (
                  <div className="flex flex-col items-center space-y-2">
                    <SpinnerGap
                      size={32}
                      className="text-blue-600 animate-spin"
                    />
                    <p className="text-sm text-gray-600">
                      Téléchargement en cours...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <CloudArrowUp size={32} className="text-gray-400" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">
                        Cliquez pour choisir
                      </span>{" "}
                      ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WebP jusqu'à 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Image Size Controls */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Taille de l'image</h4>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="maintainAspectRatio" className="text-sm text-gray-700">
                    Conserver les proportions
                  </label>
                </div>

                {maintainAspectRatio ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Largeur (% de la largeur disponible)
                    </label>
                    <select
                      value={imageWidth}
                      onChange={(e) => setImageWidth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="25">Petite (25%)</option>
                      <option value="50">Moyenne (50%)</option>
                      <option value="75">Grande (75%)</option>
                      <option value="100">Pleine largeur (100%)</option>
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Largeur (%)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hauteur (px ou auto)
                      </label>
                      <input
                        type="text"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        placeholder="auto ou nombre en px"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte alternatif (optionnel)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description de l'image..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={imageAlt || "Aperçu"}
                    className="w-full max-h-48 object-contain rounded-lg border border-gray-200"
                    onError={() => {
                      showError('Erreur d\'image', 'Impossible de charger l\'aperçu de l\'image');
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl("");
                    setImageAlt("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  disabled={!imageUrl || isUploadingImage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insérer l'image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu for Images */}
      {contextMenu && (
        <>
          {/* Overlay to close context menu */}
          <div 
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          
          <div 
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 min-w-[180px]"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y,
              transform: 'translate(-50%, -10px)'
            }}
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Taille de l'image</span>
            </div>
            
            <button
              onClick={() => resizeImage('small')}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              🔹 Petite (25%)
            </button>
            
            <button
              onClick={() => resizeImage('medium')}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              🔸 Moyenne (50%)
            </button>
            
            <button
              onClick={() => resizeImage('large')}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              🔶 Grande (75%)
            </button>
            
            <button
              onClick={() => resizeImage('full')}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              🟫 Pleine largeur (100%)
            </button>
            
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={deleteImage}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600"
              >
                🗑️ Supprimer l'image
              </button>
            </div>
          </div>
        </>
      )}

      {/* Custom Styles */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.3;
        }
        
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #2563eb;
          margin: 1rem 0;
          padding: 0.5rem 0 0.5rem 1rem;
          background-color: #eff6ff;
          font-style: italic;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 1rem;
          margin: 1rem 0;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem !important;
          list-style-position: outside;
        }
        
        [contenteditable] ul {
          list-style-type: disc !important;
        }
        
        [contenteditable] ol {
          list-style-type: decimal !important;
        }
        
        [contenteditable] ul ul {
          list-style-type: circle !important;
        }
        
        [contenteditable] ul ul ul {
          list-style-type: square !important;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
          display: list-item !important;
          list-style: inherit !important;
        }
        
        [contenteditable] li::marker {
          color: #374151;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        [contenteditable] .rich-editor-image {
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        
        [contenteditable] .rich-editor-image:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
          transform: scale(1.02);
        }
        
        [contenteditable] .rich-editor-image:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
