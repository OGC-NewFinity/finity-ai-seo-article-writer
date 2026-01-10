import React, { useState, useRef, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Supported file types
const SUPPORTED_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
};

const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_TYPES.images,
  ...SUPPORTED_TYPES.documents
];

/**
 * FileUploadRenderer Component
 * Provides file upload UI with drag-and-drop, file picker, and preview capabilities
 */
const FileUploadRenderer = ({ message, onFilesUploaded }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Initialize files from message content when message changes
  useEffect(() => {
    if (message?.content?.files) {
      if (Array.isArray(message.content.files)) {
        setFiles(message.content.files);
      }
    } else if (message?.content?.files === null || message?.content?.files === undefined) {
      // Only clear if explicitly empty (new message)
      if (files.length > 0 && !message?.id) {
        setFiles([]);
      }
    }
    // Only sync on message ID change (new message) or when files are explicitly set to empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id]);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: File size exceeds 10MB limit`);
      return { valid: false, errors };
    }
    
    // Check file type
    const isValidType = ALL_SUPPORTED_TYPES.some(type => 
      file.type === type || 
      (type.includes('image') && file.type.startsWith('image/')) ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc') ||
      file.name.toLowerCase().endsWith('.txt')
    );
    
    if (!isValidType) {
      errors.push(`${file.name}: File type not supported. Supported: JPG, PNG, GIF, WebP, PDF, DOCX, TXT`);
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  };

  const processFiles = async (fileList) => {
    const newFiles = [];
    const validationErrors = [];
    
    for (const file of fileList) {
      const validation = validateFile(file);
      if (validation.valid) {
        const fileUrl = URL.createObjectURL(file);
        newFiles.push({
          file,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl,
          uploadedAt: new Date().toISOString(),
          previewUrl: file.type.startsWith('image/') ? fileUrl : null
        });
      } else {
        validationErrors.push(...validation.errors);
      }
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setTimeout(() => setErrors([]), 5000); // Clear errors after 5 seconds
    }
    
    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      setUploading(true);
      
      // Simulate upload delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Notify parent component
      if (onFilesUploaded) {
        onFilesUploaded(updatedFiles);
      }
      
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = files[index];
    // Revoke object URL to free memory
    if (fileToRemove.fileUrl) {
      URL.revokeObjectURL(fileToRemove.fileUrl);
    }
    if (fileToRemove.previewUrl && fileToRemove.previewUrl !== fileToRemove.fileUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    // Notify parent component with updated files array
    if (onFilesUploaded) {
      onFilesUploaded(updatedFiles);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return 'fa-image';
    if (fileType?.startsWith('video/')) return 'fa-video';
    if (fileType?.startsWith('audio/')) return 'fa-music';
    if (fileType?.includes('pdf')) return 'fa-file-pdf';
    if (fileType?.includes('word') || fileType?.includes('document')) return 'fa-file-word';
    if (fileType?.includes('text')) return 'fa-file-text';
    return 'fa-file';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const hasFiles = files.length > 0;

  return html`
    <div className="w-full">
      <!-- Errors Display -->
      ${errors.length > 0 && html`
        <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
          ${errors.map((error, idx) => html`
            <div key=${idx} className="text-xs text-red-400 mb-1 flex items-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              ${error}
            </div>
          `)}
        </div>
      `}

      <!-- Upload Zone -->
      <div
        ref=${dropZoneRef}
        className=${`relative border-2 border-dashed rounded-xl p-6 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/20'
            : hasFiles
            ? 'border-slate-600 bg-slate-800/50'
            : 'border-slate-700 bg-slate-800/30'
        }`}
        onDragEnter=${handleDragEnter}
        onDragLeave=${handleDragLeave}
        onDragOver=${handleDragOver}
        onDrop=${handleDrop}
      >
        <!-- Hidden File Input -->
        <input
          ref=${fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange=${handleFileSelect}
          className="hidden"
        />

        ${!hasFiles && !uploading && html`
          <!-- Empty State -->
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No files uploaded</h3>
            <p className="text-sm text-slate-400 mb-4">Drag and drop files here, or click to browse</p>
            <button
              onClick=${handleClickUpload}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm flex items-center space-x-2 mx-auto"
            >
              <i className="fa-solid fa-folder-open"></i>
              <span>Choose Files</span>
            </button>
            <p className="text-xs text-slate-500 mt-3">
              Supported: JPG, PNG, GIF, WebP, PDF, DOCX, TXT (Max 10MB per file)
            </p>
          </div>
        `}

        ${uploading && !hasFiles && html`
          <!-- Uploading State -->
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm font-medium text-slate-300">Uploading files...</span>
            </div>
          </div>
        `}

        ${hasFiles && html`
          <!-- Files Preview -->
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">
                ${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded
              </h3>
              <button
                onClick=${handleClickUpload}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center space-x-2"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add More</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              ${files.map((fileData, index) => html`
                <div 
                  key=${index}
                  className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all animate-fadeIn"
                >
                  <!-- File Icon/Preview -->
                  <div className="flex-shrink-0">
                    ${fileData.previewUrl && fileData.fileType?.startsWith('image/') ? html`
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600">
                        <img 
                          src=${fileData.previewUrl} 
                          alt=${fileData.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ` : html`
                      <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                        <i className=${`fa-solid ${getFileIcon(fileData.fileType)} text-xl text-blue-400`}></i>
                      </div>
                    `}
                  </div>

                  <!-- File Info -->
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white mb-1 truncate" title=${fileData.fileName}>
                          ${fileData.fileName}
                        </div>
                        <div className="text-xs text-slate-400 mb-1">
                          ${fileData.fileType || 'Unknown type'} • ${formatFileSize(fileData.fileSize)}
                        </div>
                        ${fileData.uploadedAt && html`
                          <div className="text-[10px] text-slate-500">
                            Uploaded ${new Date(fileData.uploadedAt).toLocaleTimeString()}
                          </div>
                        `}
                      </div>
                      <!-- Remove Button -->
                      <button
                        onClick=${() => handleRemoveFile(index)}
                        className="flex-shrink-0 ml-2 p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                        title="Remove file"
                      >
                        <i className="fa-solid fa-xmark text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        `}

        ${isDragging && html`
          <div className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-400 mb-2"></i>
              <p className="text-sm font-bold text-blue-300">Drop files here</p>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
};

export default FileUploadRenderer;