/**
 * Feedback Widget Component
 * Reusable component for collecting user feedback on AI-generated content
 * 
 * Supports both star ratings (1-5) and thumbs up/down
 */

import React, { useState } from 'react';
import htm from 'htm';
import { submitFeedback } from '@/services/feedbackService.js';

const html = htm.bind(React.createElement);

const FeedbackWidget = ({
  contentType,
  provider,
  model,
  contentId,
  metadata,
  onFeedbackSubmitted,
  variant = 'stars', // 'stars' or 'thumbs'
  showComment = true,
  className = ''
}) => {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);

  const handleSubmit = async () => {
    if (!rating) return;

    setSubmitting(true);
    try {
      await submitFeedback({
        contentType,
        provider,
        model,
        rating,
        comment: comment.trim() || null,
        contentId,
        metadata
      });

      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted({ rating, comment });
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setRating(null);
        setComment('');
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const { showError } = await import('../../utils/errorHandler.js');
      showError(error, 'NETWORK_ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return html`
      <div className="flex items-center space-x-2 text-emerald-600 ${className}">
        <i className="fa-solid fa-check-circle"></i>
        <span className="text-sm font-medium">Thank you for your feedback!</span>
      </div>
    `;
  }

  if (variant === 'thumbs') {
    return html`
      <div className="flex flex-col space-y-3 ${className}">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-600">Rate this content:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick=${() => setRating(1)}
              disabled=${submitting}
              className=${`p-2 rounded-lg transition-all ${
                rating === 1
                  ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border-2 border-transparent'
              } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title="Thumbs up"
            >
              <i className="fa-solid fa-thumbs-up text-lg"></i>
            </button>
            <button
              onClick=${() => setRating(-1)}
              disabled=${submitting}
              className=${`p-2 rounded-lg transition-all ${
                rating === -1
                  ? 'bg-red-100 text-red-600 border-2 border-red-500'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border-2 border-transparent'
              } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title="Thumbs down"
            >
              <i className="fa-solid fa-thumbs-down text-lg"></i>
            </button>
          </div>
        </div>

        ${showComment && html`
          <div className="flex flex-col space-y-2">
            <textarea
              value=${comment}
              onChange=${(e) => setComment(e.target.value)}
              placeholder="Optional: Tell us what you think..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
              disabled=${submitting}
            />
          </div>
        `}

        <button
          onClick=${handleSubmit}
          disabled=${!rating || submitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ${submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    `;
  }

  // Stars variant (default)
  return html`
    <div className="flex flex-col space-y-3 ${className}">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-600">Rate this content:</span>
        <div className="flex items-center space-x-1">
          ${[1, 2, 3, 4, 5].map((star) => html`
            <button
              key=${star}
              onClick=${() => setRating(star)}
              onMouseEnter=${() => setHoveredStar(star)}
              onMouseLeave=${() => setHoveredStar(null)}
              disabled=${submitting}
              className=${`transition-all ${
                (hoveredStar !== null && star <= hoveredStar) || (rating !== null && star <= rating)
                  ? 'text-yellow-400 scale-110'
                  : 'text-slate-300 hover:text-yellow-300'
              } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title="${star} star${star !== 1 ? 's' : ''}"
            >
              <i className="fa-solid fa-star text-xl"></i>
            </button>
          `)}
        </div>
        ${rating && html`
          <span className="text-sm text-slate-500 ml-2">${rating} / 5</span>
        `}
      </div>

      ${showComment && html`
        <div className="flex flex-col space-y-2">
          <textarea
            value=${comment}
            onChange=${(e) => setComment(e.target.value)}
            placeholder="Optional: Tell us what you think..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="2"
            disabled=${submitting}
          />
        </div>
      `}

      <button
        onClick=${handleSubmit}
        disabled=${!rating || submitting}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ${submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  `;
};

export default FeedbackWidget;
