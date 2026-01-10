import React from 'react';
import htm from 'htm';
import { SmartTagGroup } from '@/components/common/SmartTagPill.js';

const html = htm.bind(React.createElement);

/**
 * FilePreview Component
 * Displays file preview and download option
 * Supports both single files and multiple files
 */
const FilePreview = ({ message, onRemove }) => {
  // Handle both object content and direct file properties
  const content = typeof message.content === 'object' && message.content !== null
    ? message.content
    : { file: message.content };
    
  // Support both single file and multiple files
  const files = content.files && Array.isArray(content.files) 
    ? content.files 
    : content.file || content.fileName 
      ? [{ file: content.file, fileName: content.fileName, fileType: content.fileType, fileSize: content.fileSize, fileUrl: content.fileUrl, uploadedAt: content.uploadedAt }]
      : [];
    
  const { _fileRemoved, _hasFile } = content;

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'fa-image';
    if (type?.startsWith('video/')) return 'fa-video';
    if (type?.startsWith('audio/')) return 'fa-music';
    if (type?.includes('pdf')) return 'fa-file-pdf';
    if (type?.includes('word') || type?.includes('document')) return 'fa-file-word';
    if (type?.includes('text')) return 'fa-file-text';
    return 'fa-file';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = (fileData) => {
    const { fileUrl, file, fileName } = fileData;
    
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else if (file) {
      // Create download link for file object
      if (file instanceof File || file instanceof Blob) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || file.name || 'file';
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleRemove = (index) => {
    if (onRemove) {
      onRemove(index);
    }
  };
  
  // If no files available, show placeholder
  if (files.length === 0 || (_fileRemoved && files.every(f => !f.file && !f.fileUrl))) {
    return html`
      <div className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
        <div className="flex-shrink-0 w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-file text-xl text-slate-400"></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-slate-400 mb-1 truncate">
            File (no longer available)
          </div>
          <div className="text-xs text-slate-500 mb-2">
            File was removed from session storage. Please upload again.
          </div>
        </div>
      </div>
    `;
  }

  // Multiple files view
  if (files.length > 1) {
    return html`
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ${files.length} Files
          </div>
          ${message.tags && Array.isArray(message.tags) && message.tags.length > 0 && html`
            <${SmartTagGroup} 
              tags=${message.tags} 
              variant="file"
              maxTags=${6}
              showTooltip=${true}
            />
          `}
        </div>
        <div className="space-y-2">
          ${files.map((fileData, index) => {
            const displayFileName = fileData.fileName || (fileData.file instanceof File ? fileData.file.name : 'Uploaded File');
            const displayFileType = fileData.fileType || (fileData.file instanceof File ? fileData.file.type : '');
            const displayFileSize = fileData.fileSize || (fileData.file instanceof File ? fileData.file.size : null);
            const previewUrl = fileData.fileUrl || fileData.previewUrl || (fileData.file instanceof File && fileData.file.type.startsWith('image/') ? URL.createObjectURL(fileData.file) : null);
            
            return html`
              <div 
                key=${index}
                className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all"
              >
                <!-- File Icon/Preview -->
                <div className="flex-shrink-0">
                  ${previewUrl && fileData.fileType?.startsWith('image/') ? html`
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600">
                      <img 
                        src=${previewUrl} 
                        alt=${displayFileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ` : html`
                    <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                      <i className=${`fa-solid ${getFileIcon(displayFileType)} text-xl text-blue-400`}></i>
                    </div>
                  `}
                </div>

                <!-- File Info -->
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white mb-1 truncate" title=${displayFileName}>
                    ${displayFileName}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    ${displayFileType || 'Unknown type'} • ${formatFileSize(displayFileSize)}
                  </div>
                  ${fileData.uploadedAt && html`
                    <div className="text-[10px] text-slate-500 mb-2">
                      Uploaded ${new Date(fileData.uploadedAt).toLocaleTimeString()}
                    </div>
                  `}
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick=${() => handleDownload(fileData)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center space-x-2"
                    >
                      <i className="fa-solid fa-download"></i>
                      <span>Open</span>
                    </button>
                    ${onRemove && html`
                      <button
                        onClick=${() => handleRemove(index)}
                        className="px-3 py-1.5 bg-slate-600 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold rounded-lg transition-all flex items-center space-x-2"
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Remove</span>
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  // Single file view (backward compatibility)
  const fileData = files[0];
  const displayFileName = fileData.fileName || (fileData.file instanceof File ? fileData.file.name : 'Uploaded File');
  const displayFileType = fileData.fileType || (fileData.file instanceof File ? fileData.file.type : '');
  const displayFileSize = fileData.fileSize || (fileData.file instanceof File ? fileData.file.size : null);
  const previewUrl = fileData.fileUrl || fileData.previewUrl || (fileData.file instanceof File && fileData.file.type.startsWith('image/') ? URL.createObjectURL(fileData.file) : null);

  return html`
    <div className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
      <div className="flex-shrink-0">
        ${previewUrl && displayFileType?.startsWith('image/') ? html`
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-600">
            <img 
              src=${previewUrl} 
              alt=${displayFileName}
              className="w-full h-full object-cover"
            />
          </div>
        ` : html`
          <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center">
            <i className=${`fa-solid ${getFileIcon(displayFileType)} text-xl text-blue-400`}></i>
          </div>
        `}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-white mb-1 truncate" title=${displayFileName}>
          ${displayFileName}
        </div>
        ${displayFileType && html`
          <div className="text-xs text-slate-400 mb-2">${displayFileType}</div>
        `}
        ${displayFileSize && html`
          <div className="text-xs text-slate-400 mb-2">${formatFileSize(displayFileSize)}</div>
        `}
                  ${fileData.uploadedAt && html`
                    <div className="text-[10px] text-slate-500 mb-2">
                      Uploaded ${new Date(fileData.uploadedAt).toLocaleTimeString()}
                    </div>
                  `}
                  <div className="flex items-center space-x-2 mt-2">
          <button
            onClick=${() => handleDownload(fileData)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center space-x-2"
          >
            <i className="fa-solid fa-download"></i>
            <span>Open</span>
          </button>
          ${onRemove && html`
            <button
              onClick=${() => handleRemove(0)}
              className="px-3 py-1.5 bg-slate-600 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold rounded-lg transition-all flex items-center space-x-2"
            >
              <i className="fa-solid fa-trash"></i>
              <span>Remove</span>
            </button>
          `}
        </div>
        ${displayFileType?.startsWith('image/') && previewUrl && html`
          <div className="mt-3 rounded-lg overflow-hidden border border-slate-600">
            <img src=${previewUrl} alt=${displayFileName} className="max-w-full h-auto" />
          </div>
        `}
      </div>
    </div>
  `;
};

export default FilePreview;
