import React, { useEffect, useRef, useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * CanvasOverlay Component
 * Fullscreen interactive canvas tool overlay
 */
const CanvasOverlay = ({ isOpen, onClose, canvasId, canvasData, onSave }) => {
  const canvasRef = useRef(null);
  const [canvasContent, setCanvasContent] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Draw canvas content (grid, text, or loaded data)
  const drawCanvasContent = (canvas, ctx, hasExistingData = false) => {
    if (!hasExistingData) {
      // Set dark background
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw placeholder grid (subtle)
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 1;
      const gridSize = 20;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw welcome text only if canvas is large enough
      if (canvas.width > 400 && canvas.height > 200) {
        ctx.fillStyle = '#475569'; // slate-600
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Canvas Tool - Ready for Drawing', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#64748b'; // slate-500
        ctx.fillText('Drawing functionality coming soon', canvas.width / 2, canvas.height / 2 + 10);
      }
    }
  };

  // Lock scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Initialize canvas context (placeholder for future drawing functionality)
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Use requestAnimationFrame to ensure DOM is ready
      const initializeCanvas = () => {
        // Set canvas size
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight - 200; // Account for header/footer
        
        // Load existing canvas data if available, otherwise draw placeholder
        if (canvasData) {
          try {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.onerror = () => {
              drawCanvasContent(canvas, ctx, false);
            };
            img.src = canvasData;
          } catch (error) {
            console.error('Error loading canvas data:', error);
            drawCanvasContent(canvas, ctx, false);
          }
        } else {
          drawCanvasContent(canvas, ctx, false);
        }
      };
      
      // Small delay to ensure layout is complete
      const timeoutId = setTimeout(initializeCanvas, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, canvasData]);

  // Handle window resize
  useEffect(() => {
    if (!isOpen) return;
    
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          
          // Save current canvas state before resize
          const currentCanvasData = canvas.toDataURL();
          
          // Update canvas dimensions
          canvas.width = canvas.offsetWidth || window.innerWidth;
          canvas.height = canvas.offsetHeight || window.innerHeight - 200;
          
          const ctx = canvas.getContext('2d');
          
          // Restore canvas content - prioritize saved content, then original data, then redraw
          const dataToRestore = canvasContent || canvasData || currentCanvasData;
          if (dataToRestore && dataToRestore.startsWith('data:image')) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.onerror = () => {
              drawCanvasContent(canvas, ctx, false);
            };
            img.src = dataToRestore;
          } else {
            drawCanvasContent(canvas, ctx, false);
          }
        }
      }, 250); // Debounce resize
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, canvasContent, canvasData]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Placeholder drawing handlers (for future implementation)
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    // Future: Start drawing
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    // Future: Draw line
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    // Future: End drawing
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png');
      setCanvasContent(dataURL);
      
      if (onSave) {
        onSave({
          canvasId: canvasId || `canvas-${Date.now()}`,
          data: dataURL,
          timestamp: new Date().toISOString()
        });
      }
      
      // Show success message
      if (window.showNotification) {
        window.showNotification('Canvas content saved successfully!', 'success', 3000);
      }
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setCanvasContent(null);
    }
  };

  if (!isOpen) return null;

  return html`
    <div 
      className="fixed inset-0 z-[10000] flex flex-col animate-fadeIn"
      onClick=${(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <!-- Backdrop with blur -->
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
      
      <!-- Main overlay container -->
      <div className="relative flex flex-col w-full h-full bg-slate-900 border border-slate-800 shadow-2xl">
        <!-- Header -->
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <i className="fa-solid fa-paintbrush text-lg text-blue-400"></i>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">NovaXFinity Canvas Tool</h2>
              ${canvasId && html`
                <p className="text-xs text-slate-400 font-medium">Canvas ID: ${canvasId}</p>
              `}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <!-- Toolbar buttons -->
            <button
              onClick=${handleClear}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center space-x-2"
              title="Clear Canvas"
            >
              <i className="fa-solid fa-trash"></i>
              <span>Clear</span>
            </button>
            <button
              onClick=${handleSave}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-2"
              title="Save Canvas"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Save</span>
            </button>
            <button
              onClick=${onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all border border-slate-700"
              title="Close Canvas (ESC)"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>
        
        <!-- Canvas area -->
        <div className="flex-1 relative overflow-hidden min-h-0">
          <canvas
            ref=${canvasRef}
            onMouseDown=${handleMouseDown}
            onMouseMove=${handleMouseMove}
            onMouseUp=${handleMouseUp}
            onMouseLeave=${handleMouseUp}
            className="w-full h-full cursor-crosshair block"
            style=${{ 
              touchAction: 'none',
              minHeight: '400px',
              width: '100%',
              height: '100%'
            }}
          />
          
          <!-- Info overlay (future: can be toggled) -->
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-3 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <i className="fa-solid fa-circle-info text-blue-400"></i>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Canvas Info</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Drawing and sketching features are coming soon. This canvas is ready for future creative tools.
            </p>
            ${canvasContent && html`
              <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-xs text-green-400 font-medium">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  Content saved
                </p>
              </div>
            `}
          </div>
        </div>
        
        <!-- Footer with tools (future expansion) -->
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <span>Session started: ${new Date().toLocaleTimeString()}</span>
              ${canvasContent && html`
                <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-green-400">
                  Saved
                </span>
              `}
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 opacity-50 cursor-not-allowed"
                disabled
                title="Coming soon"
              >
                <i className="fa-solid fa-palette mr-2"></i>
                Tools
              </button>
              <button
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 opacity-50 cursor-not-allowed"
                disabled
                title="Coming soon"
              >
                <i className="fa-solid fa-layer-group mr-2"></i>
                Layers
              </button>
              <button
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700 opacity-50 cursor-not-allowed"
                disabled
                title="Coming soon"
              >
                <i className="fa-solid fa-shapes mr-2"></i>
                Shapes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default CanvasOverlay;
