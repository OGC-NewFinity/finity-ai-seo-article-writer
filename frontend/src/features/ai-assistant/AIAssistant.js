import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import api from '@/services/api.js';
import { useAuth } from '@/hooks';
import OnboardingBanner from '@/components/common/OnboardingBanner.js';
import { Helmet } from 'react-helmet-async';
import ChatTopBar from './components/ChatTopBar.js';
import ToolsDropdown from './components/ToolsDropdown.js';
import MessageBubble from './components/MessageBubble.js';
import CanvasOverlay from './components/CanvasOverlay.js';
import NotebookPanel from './components/NotebookPanel.jsx';
import TokenTracker from './components/TokenTracker.js';
import { generateTagsFromText, generateTagsFromFile } from '@/utils/smartTagService.js';

const html = htm.bind(React.createElement);

// Session storage key for conversation history
const STORAGE_KEY = 'ai-assistant-conversation';
const SESSION_TOKENS_KEY = 'ai-assistant-session-tokens';

/**
 * Estimate token count from text
 * Rough estimation: ~4 characters per token for English text
 * This is a client-side approximation; actual usage is tracked server-side
 */
const estimateTokenCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  // Rough estimate: ~4 characters per token for English
  // Add overhead for special characters, formatting, etc.
  const baseEstimate = Math.ceil(text.length / 4);
  // Add overhead for system prompts, formatting tokens, etc.
  const overhead = Math.ceil(baseEstimate * 0.2); // 20% overhead
  return baseEstimate + overhead;
};

/**
 * Estimate tokens from message content
 */
const estimateMessageTokens = (message) => {
  if (!message) return 0;
  
  let tokens = 0;
  
  // Estimate tokens from text content
  if (typeof message.content === 'string') {
    tokens += estimateTokenCount(message.content);
  } else if (message.content && typeof message.content === 'object') {
    // Handle structured content
    if (message.content.summary) {
      tokens += estimateTokenCount(message.content.summary);
    }
    if (message.content.result) {
      tokens += estimateTokenCount(String(message.content.result));
    }
    if (message.content.content) {
      tokens += estimateTokenCount(String(message.content.content));
    }
    // For tool results, estimate based on data structure
    if (message.content.data) {
      tokens += estimateTokenCount(JSON.stringify(message.content.data).substring(0, 5000));
    }
  }
  
  // Add overhead for tool context
  if (message.toolContext) {
    tokens += 50; // Overhead for tool metadata
  }
  
  // Add overhead for file uploads
  if (message.type === 'file' && message.content?.files) {
    tokens += message.content.files.length * 200; // Rough estimate per file
  }
  
  // Minimum token count for any message
  return Math.max(50, tokens);
};

// Tool routing configuration
const TOOL_ROUTES = {
  'deep-research': '/api/tools/deep-research',
  'shopping-research': '/api/tools/shopping-research',
  'web-search': '/api/research/query',
  'novax-agent': '/api/research/query', // Default to research for now
  'notebook': '/api/tools/notebook',
  'study': '/api/tools/study',
  'canvas': '/api/tools/canvas'
};

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // Track active tool context
  const [selectedModel, setSelectedModel] = useState('naxf-0.1'); // Model context
  const [canvasOverlayOpen, setCanvasOverlayOpen] = useState(false);
  const [currentCanvasId, setCurrentCanvasId] = useState(null);
  const [currentCanvasData, setCurrentCanvasData] = useState(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [currentNoteTitle, setCurrentNoteTitle] = useState(null);
  const [currentNoteContent, setCurrentNoteContent] = useState(null);
  const [sessionTokens, setSessionTokens] = useState(0); // Track tokens used in this session
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const inputContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation and session tokens from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects and handle file messages
        const messagesWithDates = parsedMessages.map(msg => {
          const restored = {
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          };
          
          // For file messages that had File objects, show placeholder
          if (msg.type === 'file' && msg.content?._hasFile && !msg.content?.fileUrl) {
            restored.content = {
              ...restored.content,
              _fileRemoved: true,
              _hasFile: true
            };
          }
          
          return restored;
        });
        setMessages(messagesWithDates);
        
        // Calculate session tokens from restored messages
        const totalTokens = messagesWithDates.reduce((sum, msg) => {
          return sum + estimateMessageTokens(msg);
        }, 0);
        setSessionTokens(totalTokens);
      }
      
      // Try to load session tokens directly from storage
      const storedTokens = sessionStorage.getItem(SESSION_TOKENS_KEY);
      if (storedTokens) {
        const parsedTokens = parseInt(storedTokens, 10);
        if (!isNaN(parsedTokens)) {
          setSessionTokens(parsedTokens);
        }
      }
    } catch (error) {
      console.error('Error loading conversation from storage:', error);
      // Clear corrupted storage
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
    }
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Save conversation to sessionStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Serialize messages, excluding File objects which can't be serialized
        const serializableMessages = messages.map(msg => {
          const serialized = { ...msg };
          
          // Handle file content - exclude File objects but keep metadata
          if (serialized.type === 'file' && serialized.content && serialized.content.file instanceof File) {
            serialized.content = {
              ...serialized.content,
              file: null, // Remove File object, keep other metadata
              _hasFile: true // Flag to indicate file was present
            };
          }
          
          return serialized;
        });
        
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializableMessages));
      } catch (error) {
        console.error('Error saving conversation to storage:', error);
        // If serialization fails (e.g., due to File objects), try to save without file data
        try {
          const messagesWithoutFiles = messages.map(msg => {
            if (msg.type === 'file' && msg.content?.file instanceof File) {
              return {
                ...msg,
                content: {
                  ...msg.content,
                  file: null,
                  _hasFile: true
                }
              };
            }
            return msg;
          });
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messagesWithoutFiles));
        } catch (fallbackError) {
          console.error('Error saving conversation (fallback):', fallbackError);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Route request based on tool context
  const routeRequest = async (content, toolContext, messageContext = []) => {
    if (toolContext) {
      const endpoint = TOOL_ROUTES[toolContext.id] || '/api/research/query';
      
      // Handle canvas tool
      if (toolContext.id === 'canvas') {
        return await handleCanvasRequest(content, messageContext);
      }
      
      // Handle notebook tool
      if (toolContext.id === 'notebook') {
        return await handleNotebookRequest(content, messageContext);
      }
      
      // Handle deep research tool
      if (toolContext.id === 'deep-research') {
        return await handleDeepResearchRequest(content, messageContext);
      }
      
      // Handle shopping research tool
      if (toolContext.id === 'shopping-research') {
        return await handleShoppingResearchRequest(content, messageContext);
      }
      
      // Handle tool-specific requests
      if (endpoint.startsWith('/api/tools/')) {
        try {
          const response = await api.post(endpoint, {
            query: content,
            tool: toolContext.id,
            context: messageContext.slice(-5) // Include last 5 messages for context
          });
          return {
            type: 'tool',
            content: {
              toolName: toolContext.id,
              toolLabel: toolContext.label,
              result: response.data.data?.result || response.data.data,
              summary: response.data.data?.summary,
              sources: response.data.data?.sources,
              data: response.data.data
            },
            toolLabel: toolContext.label,
            metadata: {
              model: selectedModel,
              tool: toolContext.id
            }
          };
        } catch (error) {
          throw error;
        }
      }
      
      // Handle research queries (shopping-research, web-search)
      if (endpoint === '/api/research/query') {
        const response = await api.post(endpoint, {
          query: content,
          type: toolContext.id,
          context: messageContext.slice(-5)
        });
        
        return {
          type: 'tool',
          content: {
            toolName: toolContext.id,
            toolLabel: toolContext.label,
            summary: response.data.data?.summary,
            sources: response.data.data?.sources || [],
            data: response.data.data
          },
          toolLabel: toolContext.label,
          metadata: {
            model: selectedModel,
            tool: toolContext.id
          }
        };
      }
    }
    
    // Default: standard chat/research query
    const response = await api.post('/api/research/query', {
      query: content,
      context: messageContext.slice(-5)
    });
    
    return {
      type: 'text',
      content: response.data.data?.summary || response.data.data?.message || response.data.data?.content || 'I received your message but couldn\'t generate a response.',
      metadata: {
        model: selectedModel
      }
    };
  };

  // Handle file uploads
  const handleFileUpload = async (content, files) => {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }
    
    // Create file preview locally (backend upload can be added later)
    const file = files[0];
    const fileUrl = URL.createObjectURL(file);
    
    // Generate tags from file
    let tags = [];
    try {
      tags = await generateTagsFromFile(file);
    } catch (error) {
      console.warn('Error generating tags from file:', error);
      // Continue with empty tags
    }
    
    // Also generate tags from content text if provided
    let contentTags = [];
    if (content && typeof content === 'string' && content.trim().length > 0) {
      contentTags = generateTagsFromText(content);
    }
    
    // Merge file and content tags
    const allTags = [...tags, ...contentTags].filter((tag, index, self) => 
      self.indexOf(tag) === index
    ).slice(0, 8); // Limit to 8 tags
    
    // Try to upload to backend if endpoint exists
    try {
      const formData = new FormData();
      files.forEach((f) => {
        formData.append('files', f);
      });
      if (content) {
        formData.append('query', content);
      }
      
      const response = await api.post('/api/tools/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Use backend URL if provided
      const finalFileUrl = response.data.data?.fileUrl || fileUrl;
      
      return {
        type: 'file',
        content: {
          file: file,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: finalFileUrl,
          uploadedAt: new Date().toISOString()
        },
        metadata: {
          model: selectedModel,
          uploadedAt: new Date().toISOString()
        },
        tags: allTags.length > 0 ? allTags : undefined
      };
    } catch (error) {
      // If upload endpoint doesn't exist, still show file preview locally
      if (error.response?.status === 404) {
        return {
          type: 'file',
          content: {
            file: file,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileUrl: fileUrl,
            uploadedAt: new Date().toISOString()
          },
          metadata: {
            model: selectedModel,
            uploadedAt: new Date().toISOString()
          },
          tags: allTags.length > 0 ? allTags : ['Local Preview']
        };
      }
      throw error;
    }
  };

  // Handle canvas requests
  const handleCanvasRequest = async (content, messageContext = []) => {
    const canvasId = `canvas-${Date.now()}`;
    const sessionStart = new Date().toISOString();
    
    try {
      const response = await api.post('/api/tools/canvas', {
        query: content,
        context: messageContext.slice(-5)
      });
      
      return {
        type: 'canvas',
        content: {
          canvasId: response.data.data?.canvasId || canvasId,
          canvasData: response.data.data?.canvasData || null,
          preview: response.data.data?.preview || null
        },
        toolLabel: 'Canvas',
        metadata: {
          model: selectedModel,
          tool: 'canvas',
          canvasSession: {
            canvasId: response.data.data?.canvasId || canvasId,
            startedAt: sessionStart,
            status: 'ready'
          }
        },
        tags: ['Canvas', 'Interactive']
      };
    } catch (error) {
      // If endpoint doesn't exist yet, return placeholder with session tracking
      return {
        type: 'canvas',
        content: {
          canvasId: canvasId,
          canvasData: null,
          preview: null
        },
        toolLabel: 'Canvas',
        metadata: {
          model: selectedModel,
          tool: 'canvas',
          canvasSession: {
            canvasId: canvasId,
            startedAt: sessionStart,
            status: 'ready'
          }
        },
        tags: ['Canvas', 'Interactive']
      };
    }
  };

  // Handle deep research requests
  const handleDeepResearchRequest = async (content, messageContext = []) => {
    try {
      const response = await api.post('/api/tools/deep-research', {
        query: content,
        context: messageContext.slice(-5),
        tool: 'deep-research'
      });
      
      const data = response.data.data || response.data;
      const timestamp = data.timestamp || new Date().toISOString();
      
      return {
        type: 'tool',
        content: {
          toolName: 'deep-research',
          toolLabel: 'Deep Research',
          summary: data.summary || data.result || '',
          sources: data.sources || [],
          tags: data.tags || ['research'],
          timestamp: timestamp
        },
        toolLabel: 'Deep Research',
        metadata: {
          model: selectedModel,
          tool: 'deep-research',
          timestamp: timestamp,
          receivedAt: new Date().toISOString()
        },
        tags: data.tags || ['research']
      };
    } catch (error) {
      // If endpoint doesn't exist yet, throw error to show error message
      throw error;
    }
  };

  // Handle shopping research requests
  const handleShoppingResearchRequest = async (content, messageContext = []) => {
    try {
      const response = await api.post('/api/tools/shopping-research', {
        query: content,
        context: messageContext.slice(-5),
        tool: 'shopping-research'
      });
      
      const data = response.data.data || response.data;
      const timestamp = data.timestamp || new Date().toISOString();
      const results = data.results || data.products || [];
      
      return {
        type: 'shopping',
        content: {
          toolName: 'shopping-research',
          toolLabel: 'Shopping Research',
          results: results,
          tags: data.tags || ['shopping'],
          timestamp: timestamp
        },
        toolLabel: 'Shopping Research',
        metadata: {
          model: selectedModel,
          tool: 'shopping-research',
          timestamp: timestamp,
          receivedAt: new Date().toISOString()
        },
        tags: data.tags || ['shopping']
      };
    } catch (error) {
      // If endpoint doesn't exist yet, throw error to show error message
      throw error;
    }
  };

  // Handle notebook requests
  const handleNotebookRequest = async (content, messageContext = []) => {
    const noteId = `notebook-${Date.now()}`;
    const sessionStart = new Date().toISOString();
    
    try {
      const response = await api.post('/api/tools/notebook', {
        query: content,
        context: messageContext.slice(-5)
      });
      
      return {
        type: 'notebook',
        content: {
          noteId: response.data.data?.noteId || noteId,
          noteTitle: response.data.data?.noteTitle || content.substring(0, 50) || 'Untitled Note',
          content: response.data.data?.content || '',
          hasContent: !!response.data.data?.content,
          lastSavedAt: response.data.data?.lastSavedAt || null
        },
        toolLabel: 'Notebook',
        metadata: {
          model: selectedModel,
          tool: 'notebook',
          notebookSession: {
            noteId: response.data.data?.noteId || noteId,
            startedAt: sessionStart,
            status: 'ready'
          }
        },
        tags: ['Notebook', 'Editor']
      };
    } catch (error) {
      // If endpoint doesn't exist yet, return notebook trigger with placeholder
      return {
        type: 'notebook',
        content: {
          noteId: noteId,
          noteTitle: content.substring(0, 50) || 'Untitled Note',
          content: '',
          hasContent: false,
          lastSavedAt: null
        },
        toolLabel: 'Notebook',
        metadata: {
          model: selectedModel,
          tool: 'notebook',
          notebookSession: {
            noteId: noteId,
            startedAt: sessionStart,
            status: 'ready'
          }
        },
        tags: ['Notebook', 'Editor']
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const currentTool = activeTool;
    const userContent = input.trim();
    
    // Generate tags from text input
    const tags = generateTagsFromText(userContent);
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userContent,
      type: 'text',
      toolContext: currentTool ? {
        id: currentTool.id,
        label: currentTool.label
      } : null,
      timestamp: new Date().toISOString(),
      metadata: {
        model: selectedModel
      },
      tags: tags.length > 0 ? tags : undefined
    };

    // Calculate message context BEFORE updating state
    const messageContext = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      timestamp: msg.timestamp
    }));
    
    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setActiveTool(null); // Reset tool context after sending

    // Add placeholder assistant message for streaming
    const assistantMessageId = Date.now() + 1;
    const messageType = currentTool?.id === 'deep-research' || currentTool?.id === 'shopping-research' ? 
      (currentTool.id === 'shopping-research' ? 'shopping' : 'tool') : 'text';
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      type: messageType,
      loading: true,
      timestamp: new Date().toISOString(),
      toolLabel: currentTool?.label || null,
      toolContext: currentTool ? {
        id: currentTool.id,
        label: currentTool.label
      } : null
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await routeRequest(userContent, currentTool, messageContext);
      
      // Update assistant message with response
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              ...response,
              loading: false,
              timestamp: new Date().toISOString()
            }
          : msg
      ));
      
      // Update session tokens: add tokens for user message and assistant response
      const userTokens = estimateMessageTokens(userMessage);
      const assistantTokens = estimateMessageTokens({ ...response, role: 'assistant' });
      setSessionTokens(prev => {
        const newTotal = prev + userTokens + assistantTokens;
        try {
          sessionStorage.setItem(SESSION_TOKENS_KEY, newTotal.toString());
        } catch (storageError) {
          console.error('Error saving session tokens:', storageError);
        }
        return newTotal;
      });
    } catch (error) {
      console.error('Chat error:', error);
      // Update assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              type: 'alert',
              content: {
                alertType: 'error',
                title: 'Error',
                content: error.response?.data?.error?.message || error.message || 'Sorry, I encountered an error. Please try again.',
                retryable: true
              },
              loading: false,
              error: true,
              retryData: {
                content: userContent,
                toolContext: currentTool,
                messageContext: messageContext
              }
            }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  // Handle retry for failed requests
  const handleRetry = async (message) => {
    if (!message.retryData) return;
    
    const { content, toolContext, messageContext } = message.retryData;
    const messageId = message.id;
    
    // Determine correct message type based on tool context
    const messageType = toolContext?.id === 'shopping-research' ? 'shopping' :
                       toolContext?.id === 'deep-research' ? 'tool' : 'text';
    
    // Update message to loading state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            type: messageType,
            loading: true,
            error: false,
            content: {},
            toolLabel: toolContext?.label || null,
            toolContext: toolContext ? {
              id: toolContext.id,
              label: toolContext.label
            } : null
          }
        : msg
    ));
    
    setLoading(true);
    
    try {
      const response = await routeRequest(content, toolContext, messageContext);
      
      // Update message with successful response
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              ...response,
              loading: false,
              timestamp: new Date().toISOString(),
              error: false
            }
          : msg
      ));
      
      // Update session tokens for retry (estimate tokens for the response)
      const retryTokens = estimateMessageTokens({ ...response, role: 'assistant' });
      setSessionTokens(prev => {
        const newTotal = prev + retryTokens;
        try {
          sessionStorage.setItem(SESSION_TOKENS_KEY, newTotal.toString());
        } catch (storageError) {
          console.error('Error saving session tokens:', storageError);
        }
        return newTotal;
      });
    } catch (error) {
      console.error('Retry error:', error);
      // Update message with error again
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              type: 'alert',
              content: {
                alertType: 'error',
                title: 'Error',
                content: error.response?.data?.error?.message || error.message || 'Sorry, I encountered an error. Please try again.',
                retryable: true
              },
              loading: false,
              error: true,
              retryData: message.retryData
            }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setActiveTool(null);
    setSessionTokens(0);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_TOKENS_KEY);
    inputRef.current?.focus();
  };

  const handleToolSelect = (tool) => {
    // Handle upload tool - create upload UI message
    if (tool.id === 'upload' || tool.action === 'upload') {
      // Check if there's already an upload message in the chat
      setMessages(prev => {
        const existingUpload = prev.find(msg => 
          msg.type === 'upload' && msg.role === 'user' && !msg.content?.files?.length
        );
        
        if (existingUpload) {
          // Focus on existing upload message instead of creating duplicate
          return prev;
        }
        
        // Create new upload message with upload UI
        const uploadMessage = {
          id: Date.now(),
          role: 'user',
          content: {
            files: []
          },
          type: 'upload',
          timestamp: new Date().toISOString(),
          toolContext: {
            id: tool.id,
            label: tool.label
          },
          toolLabel: tool.label,
          metadata: {
            model: selectedModel,
            tool: 'upload'
          },
          tags: ['Upload', 'Files']
        };
        return [...prev, uploadMessage];
      });
      return;
    }
    
    // Set active tool context for other tools
    setActiveTool(tool);
    
    // For notebook, create a notebook trigger message immediately
    if (tool.id === 'notebook') {
      const sessionStart = new Date().toISOString();
      
      // Check if there's an existing notebook message in the chat
      setMessages(prev => {
        const existingNotebook = prev.find(msg => msg.type === 'notebook' && msg.role === 'assistant');
        
        if (existingNotebook) {
          // Don't create duplicate notebook triggers - user can use existing one
          return prev;
        }
        
        // Create new notebook trigger
        const noteId = `notebook-${Date.now()}`;
        const notebookMessage = {
          id: Date.now(),
          role: 'assistant',
          content: {
            noteId: noteId,
            noteTitle: 'Untitled Note',
            content: '',
            hasContent: false,
            lastSavedAt: null
          },
          type: 'notebook',
          timestamp: new Date().toISOString(),
          toolLabel: tool.label,
          metadata: {
            model: selectedModel,
            tool: 'notebook',
            notebookSession: {
              noteId: noteId,
              startedAt: sessionStart,
              status: 'ready'
            }
          },
          tags: ['Notebook', 'Editor']
        };
        return [...prev, notebookMessage];
      });
      return; // Don't add alert message for notebook
    }
    
    // For canvas, show a placeholder message
    if (tool.id === 'canvas') {
      const systemMessage = {
        id: Date.now(),
        role: 'assistant',
        content: {
          alertType: 'info',
          title: `${tool.label} Tool Activated`,
          content: `The ${tool.label} tool is now active. Your next message will be processed using this tool.`
        },
        type: 'alert',
        timestamp: new Date().toISOString(),
        toolLabel: tool.label
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  };

  // Handle files uploaded from FileUploadRenderer
  const handleFilesUploaded = async (messageId, uploadedFiles) => {
    // Generate tags for uploaded files
    let allTags = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        const fileObjects = uploadedFiles.map(f => f.file || f).filter(Boolean);
        const tagPromises = fileObjects.map(file => generateTagsFromFile(file).catch(() => []));
        const tagArrays = await Promise.all(tagPromises);
        allTags = tagArrays.flat().filter((tag, index, self) => self.indexOf(tag) === index).slice(0, 8);
      } catch (error) {
        console.warn('Error generating tags for uploaded files:', error);
      }
    }
    
    // Update the upload message with files (even if empty array - allows clearing)
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && (msg.type === 'upload' || msg.type === 'file')) {
        // If files array is empty, keep as upload type (allows re-upload)
        // If files exist, update content
        const updatedContent = {
          ...msg.content,
          files: uploadedFiles || []
        };
        
        // If files were added and message is still upload type, keep it as upload
        // User can continue adding files or the message can be converted later
        return {
          ...msg,
          content: updatedContent,
          tags: allTags.length > 0 ? allTags : msg.tags,
          // Don't auto-convert to 'file' type - let user continue adding files
          // Type conversion can happen when user sends message or explicitly confirms
        };
      }
      return msg;
    }));
    
    // If files were successfully uploaded, optionally process them
    if (uploadedFiles && uploadedFiles.length > 0) {
      setLoading(true);
      
      try {
        // Process files - could send to backend for analysis, etc.
        const fileObjects = uploadedFiles.map(f => f.file || f).filter(Boolean);
        
        if (fileObjects.length > 0) {
          // Try to upload to backend if endpoint exists (optional)
          // For now, we keep files as local previews
          // Backend upload can be added later if needed
          try {
            await handleFileUpload('', fileObjects);
            // If backend upload succeeds, could update message with server URLs
          } catch (backendError) {
            // Backend upload is optional - files are already available locally
            console.log('Backend upload optional - using local previews');
          }
        }
      } catch (error) {
        console.error('File processing error:', error);
        // Keep files in upload message even if processing fails
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle file removal from FilePreview or FileUploadRenderer
  const handleFileRemove = (messageId, fileIndex) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && (msg.type === 'upload' || msg.type === 'file')) {
        const files = msg.content?.files || [];
        
        // Revoke object URL to free memory
        if (files[fileIndex]?.fileUrl) {
          URL.revokeObjectURL(files[fileIndex].fileUrl);
        }
        if (files[fileIndex]?.previewUrl && files[fileIndex].previewUrl !== files[fileIndex].fileUrl) {
          URL.revokeObjectURL(files[fileIndex].previewUrl);
        }
        
        const updatedFiles = files.filter((_, i) => i !== fileIndex);
        
        // If no files left and it's an upload message, remove the message or reset it
        if (updatedFiles.length === 0 && msg.type === 'upload') {
          return {
            ...msg,
            content: {
              files: []
            }
          };
        }
        
        return {
          ...msg,
          content: {
            ...msg.content,
            files: updatedFiles
          }
        };
      }
      return msg;
    }));
  };

  // Legacy handleFileSelect - kept for backward compatibility (drag-drop, etc.)
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    // Generate tags for files
    let allTags = [];
    try {
      const tagPromises = Array.from(files).map(file => generateTagsFromFile(file).catch(() => []));
      const tagArrays = await Promise.all(tagPromises);
      allTags = tagArrays.flat().filter((tag, index, self) => self.indexOf(tag) === index).slice(0, 8);
    } catch (error) {
      console.warn('Error generating tags for files:', error);
    }
    
    // Process files similar to upload renderer
    const processedFiles = files.map(file => ({
      file,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    // Create user message for file upload
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: {
        files: processedFiles
      },
      type: 'file',
      timestamp: new Date().toISOString(),
      metadata: {
        model: selectedModel
      },
      tags: allTags.length > 0 ? allTags : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Update session tokens for file upload
    const fileUploadTokens = estimateMessageTokens(userMessage);
    setSessionTokens(prev => {
      const newTotal = prev + fileUploadTokens;
      try {
        sessionStorage.setItem(SESSION_TOKENS_KEY, newTotal.toString());
      } catch (storageError) {
        console.error('Error saving session tokens:', storageError);
      }
      return newTotal;
    });
    
    // Optionally create assistant response
    setLoading(true);
    try {
      const response = await handleFileUpload('', files);
      
      // Add assistant message with confirmation
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: {
          alertType: 'success',
          title: 'Files Uploaded',
          content: `Successfully uploaded ${files.length} ${files.length === 1 ? 'file' : 'files'}.`
        },
        type: 'alert',
        timestamp: new Date().toISOString(),
        metadata: {
          model: selectedModel
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update session tokens for assistant response
      const assistantTokens = estimateMessageTokens(assistantMessage);
      setSessionTokens(prev => {
        const newTotal = prev + assistantTokens;
        try {
          sessionStorage.setItem(SESSION_TOKENS_KEY, newTotal.toString());
        } catch (storageError) {
          console.error('Error saving session tokens:', storageError);
        }
        return newTotal;
      });
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCanvasOpen = (canvasId, canvasData) => {
    // Open canvas overlay
    setCurrentCanvasId(canvasId || `canvas-${Date.now()}`);
    setCurrentCanvasData(canvasData || null);
    setCanvasOverlayOpen(true);
  };

  const handleCanvasClose = () => {
    setCanvasOverlayOpen(false);
    // Keep canvas ID and data for future reopening
  };

  const handleCanvasSave = (savedData) => {
    // Update the canvas message with saved content
    setMessages(prev => prev.map(msg => {
      if (msg.type === 'canvas' && msg.content?.canvasId === savedData.canvasId) {
        return {
          ...msg,
          content: {
            ...msg.content,
            canvasData: savedData.data,
            preview: savedData.data, // Use data URL as preview
            savedAt: savedData.timestamp
          },
          metadata: {
            ...msg.metadata,
            canvasSession: {
              savedAt: savedData.timestamp,
              canvasId: savedData.canvasId
            }
          }
        };
      }
      return msg;
    }));

    // Optionally save to localStorage for persistence
    try {
      const canvasStorageKey = `canvas-${savedData.canvasId}`;
      localStorage.setItem(canvasStorageKey, JSON.stringify({
        canvasId: savedData.canvasId,
        data: savedData.data,
        timestamp: savedData.timestamp
      }));
    } catch (error) {
      console.error('Error saving canvas to localStorage:', error);
    }
  };

  // Notebook handlers
  const handleNotebookOpen = (noteId) => {
    if (!noteId) {
      noteId = `notebook-${Date.now()}`;
    }
    
    // Load note data from sessionStorage first (most up-to-date)
    const storageKey = `notebook-note-${noteId}`;
    let title = null;
    let content = null;
    
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        title = parsed.title;
        content = parsed.content;
      }
    } catch (error) {
      console.error('Error loading notebook data from storage:', error);
    }
    
    // Fallback to message data if not in storage
    if (!title && !content) {
      const noteMessage = messages.find(msg => 
        msg.type === 'notebook' && msg.content?.noteId === noteId
      );
      if (noteMessage) {
        title = noteMessage.content?.noteTitle;
        content = noteMessage.content?.content;
      }
    }
    
    setCurrentNoteId(noteId);
    setCurrentNoteTitle(title || 'Untitled Note');
    setCurrentNoteContent(content || '');
    setNotebookOpen(true);
  };

  const handleNotebookClose = () => {
    setNotebookOpen(false);
    // Keep note ID and data for future reopening
  };

  const handleNotebookSave = (savedData) => {
    // Update the notebook message with saved content
    setMessages(prev => prev.map(msg => {
      if (msg.type === 'notebook' && msg.content?.noteId === savedData.noteId) {
        return {
          ...msg,
          content: {
            ...msg.content,
            noteTitle: savedData.title || msg.content.noteTitle || 'Untitled Note',
            content: savedData.content || '',
            hasContent: !!(savedData.content && savedData.content.trim().length > 0),
            lastSavedAt: savedData.lastSavedAt
          },
          metadata: {
            ...msg.metadata,
            notebookSession: {
              ...msg.metadata?.notebookSession,
              savedAt: savedData.lastSavedAt,
              noteId: savedData.noteId
            }
          }
        };
      }
      return msg;
    }));
    
    // Update current note state
    if (savedData.noteId === currentNoteId) {
      setCurrentNoteTitle(savedData.title || currentNoteTitle);
      setCurrentNoteContent(savedData.content || currentNoteContent);
    }
  };

  // Drag and drop handlers
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  return html`
    <${Helmet}>
      <title>AI Assistant - Nova‑XFinity</title>
    </${Helmet}>
    
    <div className="flex flex-col animate-fadeIn">
      <!-- Top Bar with Model Switcher and Account Menu -->
      <${ChatTopBar} />

      <${OnboardingBanner}
        id="ai-assistant-welcome"
        title="Welcome to your AI Assistant!"
        message="Ask me anything! I can help with research, content ideas, analysis, and more. Just type your question below and press Enter."
        icon="fa-comments"
        type="info"
      />

      <!-- Messages Container -->
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col mb-6" style=${{ maxHeight: 'calc(100vh - 450px)', minHeight: '400px' }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          ${messages.length === 0 ? html`
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
                <i className="fa-solid fa-comments text-3xl text-blue-400"></i>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Start a conversation</h3>
              <p className="text-slate-400 font-medium max-w-md">Ask me anything! I'm here to help with research, content ideas, analysis, and more.</p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                ${[
                  { icon: 'fa-lightbulb', text: 'Generate content ideas for a blog post about...' },
                  { icon: 'fa-magnifying-glass', text: 'Research the latest trends in...' },
                  { icon: 'fa-chart-line', text: 'Analyze the SEO strategy for...' },
                  { icon: 'fa-question', text: 'Explain how to improve content quality...' }
                ].map((suggestion, i) => html`
                  <button
                    key=${i}
                    onClick=${() => {
                      setInput(suggestion.text);
                      inputRef.current?.focus();
                    }}
                    className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-left hover:bg-slate-800 hover:border-blue-500/50 transition-all group"
                  >
                    <i className=${`fa-solid ${suggestion.icon} text-blue-400 mb-2 group-hover:scale-110 transition-transform`}></i>
                    <p className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">${suggestion.text}</p>
                  </button>
                `)}
              </div>
            </div>
          ` : html`
            ${messages.map((msg) => html`
              <${MessageBubble} 
                key=${msg.id} 
                message=${msg} 
                onOpenCanvas=${handleCanvasOpen}
                onOpenNotebook=${handleNotebookOpen}
                onRetry=${handleRetry}
                onFilesUploaded=${(files) => handleFilesUploaded(msg.id, files)}
                onFileRemove=${(index) => handleFileRemove(msg.id, index)}
              />
            `)}
            <div ref=${messagesEndRef} />
          `}
        </div>

        ${messages.length > 0 && html`
          <div className="border-t border-slate-800 p-4 flex justify-between items-center bg-slate-950/50">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                ${messages.length} ${messages.length === 1 ? 'message' : 'messages'}
              </span>
              ${activeTool && html`
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                  <i className=${`fa-solid ${activeTool.icon} mr-2`}></i>
                  ${activeTool.label}
                </span>
              `}
            </div>
            <button
              onClick=${handleClear}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
            >
              <i className="fa-solid fa-trash mr-2"></i>Clear Chat
            </button>
          </div>
        `}
      </div>

      <!-- Input Area -->
      <div className="relative">
        <div 
          ref=${inputContainerRef}
          className=${`flex items-end space-x-3 bg-slate-900 rounded-2xl border transition-all p-4 shadow-lg ${
            isDragging 
              ? 'border-blue-500 border-2 bg-blue-900/20' 
              : 'border-slate-800'
          }`}
          onDragEnter=${handleDragEnter}
          onDragLeave=${handleDragLeave}
          onDragOver=${handleDragOver}
          onDrop=${handleDrop}
        >
          <!-- Tools Dropdown -->
          <${ToolsDropdown} 
            onToolSelect=${handleToolSelect} 
            onFileSelect=${handleFileSelect}
          />
          
          <textarea
            ref=${inputRef}
            value=${input}
            onChange=${e => setInput(e.target.value)}
            onKeyDown=${handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            disabled=${loading}
            rows="1"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-medium text-sm min-h-[48px] max-h-[200px]"
            style=${{ 
              resize: 'none',
              overflow: 'auto',
              height: 'auto'
            }}
            onInput=${e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
          />
          <button
            onClick=${handleSend}
            disabled=${loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex items-center space-x-2 min-w-[100px] justify-center"
          >
            ${loading ? html`
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Sending...</span>
            ` : html`
              <i className="fa-solid fa-paper-plane"></i>
              <span>Send</span>
            `}
          </button>
        </div>
        ${isDragging && html`
          <div className="absolute inset-0 bg-blue-500/10 rounded-2xl border-2 border-blue-500 border-dashed flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <i className="fa-solid fa-cloud-arrow-up text-4xl text-blue-400 mb-2"></i>
              <p className="text-sm font-bold text-blue-300">Drop files here to upload</p>
            </div>
          </div>
        `}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
          <p className="text-[9px] text-slate-500 ml-2 hidden sm:block">
            <i className="fa-solid fa-circle-info mr-1"></i>
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[8px] font-bold">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[8px] font-bold">Shift+Enter</kbd> for new line
          </p>
          <!-- Token Tracker (always visible, bottom-right on desktop, bottom-center on mobile) -->
          <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto">
            <${TokenTracker} 
              sessionTokens=${sessionTokens}
            />
          </div>
        </div>
      </div>

      <!-- Canvas Overlay -->
      <${CanvasOverlay}
        isOpen=${canvasOverlayOpen}
        onClose=${handleCanvasClose}
        canvasId=${currentCanvasId}
        canvasData=${currentCanvasData}
        onSave=${handleCanvasSave}
      />

      <!-- Notebook Panel -->
      <${NotebookPanel}
        isOpen=${notebookOpen}
        onClose=${handleNotebookClose}
        noteId=${currentNoteId}
        initialTitle=${currentNoteTitle}
        initialContent=${currentNoteContent}
        onSave=${handleNotebookSave}
      />
    </div>
  `;
};

export default AIAssistant;
