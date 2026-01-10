import React, { useEffect, useRef, useState, useCallback } from 'react';

// Session storage key prefix for notebook notes
const NOTE_STORAGE_PREFIX = 'notebook-note-';

/**
 * NotebookPanel Component
 * Side panel notebook editor with markdown support and auto-save
 */
const NotebookPanel = ({ isOpen, onClose, noteId, initialTitle, initialContent, onSave }) => {
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const textareaRef = useRef(null);
  const titleInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const hasUnsavedChangesRef = useRef(false);

  // Load note from sessionStorage on mount or when noteId changes
  useEffect(() => {
    if (!isOpen || !noteId) return;

    const storageKey = `${NOTE_STORAGE_PREFIX}${noteId}`;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNoteContent(parsed.content || initialContent || '');
        setNoteTitle(parsed.title || initialTitle || '');
        setLastSavedTime(parsed.lastSavedAt ? new Date(parsed.lastSavedAt) : null);
        setSaveStatus('saved');
        hasUnsavedChangesRef.current = false;
      } else {
        // New note
        setNoteContent(initialContent || '');
        setNoteTitle(initialTitle || '');
        setLastSavedTime(null);
        setSaveStatus(initialContent ? 'unsaved' : 'saved');
        hasUnsavedChangesRef.current = !!initialContent;
      }
    } catch (error) {
      console.error('Error loading note from storage:', error);
      setNoteContent(initialContent || '');
      setNoteTitle(initialTitle || '');
      setLastSavedTime(null);
      setSaveStatus('saved');
      hasUnsavedChangesRef.current = false;
    }
  }, [isOpen, noteId, initialContent, initialTitle]);

  // Auto-save function with debouncing
  const saveNote = useCallback(() => {
    if (!noteId) return;

    setSaveStatus('saving');
    
    const storageKey = `${NOTE_STORAGE_PREFIX}${noteId}`;
    const saveData = {
      noteId,
      title: noteTitle || 'Untitled Note',
      content: noteContent,
      lastSavedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSavedTime(new Date());
      setSaveStatus('saved');
      hasUnsavedChangesRef.current = false;
      
      // Notify parent component of save
      if (onSave) {
        onSave(saveData);
      }
    } catch (error) {
      console.error('Error saving note to storage:', error);
      setSaveStatus('unsaved');
    }
  }, [noteId, noteTitle, noteContent, onSave]);

  // Debounced auto-save on content change
  useEffect(() => {
    if (!isOpen || !noteId || !hasUnsavedChangesRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (1 second debounce)
    saveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChangesRef.current) {
        saveNote();
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [noteContent, noteTitle, isOpen, noteId, saveNote]);

  // Handle content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setNoteContent(newContent);
    if (saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
    hasUnsavedChangesRef.current = true;
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 600) + 'px';
    }
  };

  // Handle title change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setNoteTitle(newTitle);
    if (saveStatus === 'saved') {
      setSaveStatus('unsaved');
    }
    hasUnsavedChangesRef.current = true;
  };

  // Manual save button
  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    hasUnsavedChangesRef.current = true;
    saveNote();
  };

  // Handle keyboard shortcuts (ESC to close, Ctrl+S to save)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        hasUnsavedChangesRef.current = true;
        saveNote();
        return;
      }
      
      // ESC to close (but not if user is typing in textarea or input)
      if (e.key === 'Escape' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement === textareaRef.current || document.activeElement === titleInputRef.current) {
          // Allow ESC to blur the input/textarea, but don't close panel
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, saveNote]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay to ensure panel animation is complete
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Lock body scroll when panel is open (but allow panel scroll)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSavedTime) return 'Never saved';
    
    const now = new Date();
    const diffMs = now - lastSavedTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    
    return lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex justify-end animate-fadeIn"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Side Panel */}
      <div 
        className="relative flex flex-col w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 flex-shrink-0">
              <i className="fa-solid fa-book text-lg text-blue-400"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white mb-1">NovaX Notebook</h2>
              <div className="flex items-center space-x-3">
                {/* Save Status Indicator */}
                <div className="flex items-center space-x-2 text-xs">
                  {saveStatus === 'saved' && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <i className="fa-solid fa-check-circle"></i>
                      <span className="font-medium">Saved</span>
                    </div>
                  )}
                  {saveStatus === 'saving' && (
                    <div className="flex items-center space-x-1 text-blue-400">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span className="font-medium">Saving...</span>
                    </div>
                  )}
                  {saveStatus === 'unsaved' && (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <i className="fa-solid fa-circle-dot"></i>
                      <span className="font-medium">Unsaved changes</span>
                    </div>
                  )}
                  {lastSavedTime && saveStatus === 'saved' && (
                    <span className="text-slate-400 font-medium">• {formatLastSaved()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            {/* Action Buttons */}
            <button
              onClick={handleManualSave}
              disabled={saveStatus === 'saving'}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-2"
              title="Save manually (Ctrl+S or Cmd+S)"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Save</span>
            </button>
            <button
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 opacity-50 cursor-not-allowed flex items-center space-x-2"
              disabled
              title="Export (Coming soon)"
            >
              <i className="fa-solid fa-download"></i>
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700"
              title="Close Notebook (ESC)"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Note Title
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={noteTitle}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm"
            />
          </div>

          {/* Editor Textarea */}
          <div className="flex-1 min-h-[400px]">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Content (Markdown supported)
            </label>
            <textarea
              ref={textareaRef}
              value={noteContent}
              onChange={handleContentChange}
              placeholder={`Start writing your notes here...

Markdown formatting is supported:
• Use **bold** for bold text
• Use *italic* for italic text
• Use # for headings
• Use - or * for lists
• Use \`\`\` for code blocks`}
              className="w-full h-full min-h-[400px] max-h-[600px] px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y font-mono text-sm leading-relaxed overflow-auto"
            />
          </div>

          {/* Markdown Tips (Collapsible) */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fa-solid fa-circle-info text-blue-400"></i>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Markdown Tips</span>
            </div>
            <div className="text-xs text-slate-400 font-medium space-y-1">
              <div>• <code className="bg-slate-900 px-1 py-0.5 rounded">**bold**</code> or <code className="bg-slate-900 px-1 py-0.5 rounded">__bold__</code> for bold text</div>
              <div>• <code className="bg-slate-900 px-1 py-0.5 rounded">*italic*</code> or <code className="bg-slate-900 px-1 py-0.5 rounded">_italic_</code> for italic text</div>
              <div>• <code className="bg-slate-900 px-1 py-0.5 rounded"># Heading</code> for headings (use more # for smaller headings)</div>
              <div>• <code className="bg-slate-900 px-1 py-0.5 rounded">-</code> or <code className="bg-slate-900 px-1 py-0.5 rounded">*</code> for bullet lists</div>
              <div>• <code className="bg-slate-900 px-1 py-0.5 rounded">```</code> for code blocks</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <span>Character count: {noteContent.length}</span>
              {noteContent.length > 0 && (
                <>
                  <span>•</span>
                  <span>Words: {noteContent.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                </>
              )}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold">ESC</kbd> to close, <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold">Ctrl+S</kbd> to save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotebookPanel;