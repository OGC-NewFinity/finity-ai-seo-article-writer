import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * ComparisonCard Component
 * Displays a single product card with image, price, rating, specs, and source link
 */
const ComparisonCard = ({ product }) => {
  const [imageError, setImageError] = React.useState(false);
  
  const {
    title,
    price,
    rating,
    source,
    image,
    specs = [],
    availability
  } = product;

  // Format rating stars
  const renderRating = (ratingValue) => {
    if (!ratingValue) return null;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return html`
      <div className="flex items-center space-x-1">
        ${Array.from({ length: fullStars }).map((_, i) => html`
          <i key=${i} className="fa-solid fa-star text-yellow-400 text-xs"></i>
        `)}
        ${hasHalfStar && html`
          <i className="fa-solid fa-star-half-stroke text-yellow-400 text-xs"></i>
        `}
        ${Array.from({ length: emptyStars }).map((_, i) => html`
          <i key=${i} className="fa-regular fa-star text-yellow-400 text-xs"></i>
        `)}
        <span className="text-xs text-slate-400 font-medium ml-1">${ratingValue.toFixed(1)}</span>
      </div>
    `;
  };

  // Get availability badge color
  const getAvailabilityColor = (avail) => {
    if (!avail) return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
    const lower = avail.toLowerCase();
    if (lower.includes('stock') || lower.includes('available')) {
      return 'bg-green-500/20 border-green-500/30 text-green-400';
    }
    if (lower.includes('pre-order') || lower.includes('backorder')) {
      return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    }
    if (lower.includes('out') || lower.includes('unavailable')) {
      return 'bg-red-500/20 border-red-500/30 text-red-400';
    }
    return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
  };

  return html`
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors flex flex-col">
      <!-- Product Image -->
      ${image && !imageError && html`
        <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
          <img
            src=${image}
            alt=${title || 'Product image'}
            className="w-full h-full object-cover"
            onError=${() => setImageError(true)}
          />
        </div>
      `}
      ${image && imageError && html`
        <div className="w-full aspect-square bg-slate-800 flex items-center justify-center">
          <i className="fa-solid fa-image text-4xl text-slate-600"></i>
        </div>
      `}

      <!-- Product Info -->
      <div className="p-4 flex-1 flex flex-col">
        <!-- Title and Source -->
        <div className="mb-3">
          ${title && html`
            <h3 className="font-bold text-sm text-white mb-1 line-clamp-2 min-h-[2.5rem]">
              ${title}
            </h3>
          `}
          ${source && source.name && html`
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <i className="fa-solid fa-store text-xs"></i>
              ${source.url ? html`
                <a
                  href=${source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors font-medium"
                  onClick=${(e) => e.stopPropagation()}
                >
                  ${source.name}
                  <i className="fa-solid fa-external-link ml-1 text-[10px]"></i>
                </a>
              ` : html`
                <span>${source.name}</span>
              `}
            </div>
          `}
        </div>

        <!-- Price and Rating -->
        <div className="flex items-center justify-between mb-3">
          ${price && html`
            <div className="font-black text-lg text-blue-400">
              ${price}
            </div>
          `}
          ${rating && renderRating(rating)}
        </div>

        <!-- Specs -->
        ${specs && Array.isArray(specs) && specs.length > 0 && html`
          <div className="mb-3 flex-1">
            <div className="flex flex-wrap gap-1.5">
              ${specs.slice(0, 4).map((spec, idx) => html`
                <span
                  key=${idx}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-[10px] text-slate-300 font-medium"
                >
                  ${spec}
                </span>
              `)}
              ${specs.length > 4 && html`
                <span className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-[10px] text-slate-400 font-medium">
                  +${specs.length - 4} more
                </span>
              `}
            </div>
          </div>
        `}

        <!-- Availability -->
        ${availability && html`
          <div className="mt-auto pt-2 border-t border-slate-700">
            <span className=${`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getAvailabilityColor(availability)}`}>
              <i className="fa-solid fa-circle-dot mr-1 text-[8px]"></i>
              ${availability}
            </span>
          </div>
        `}

        <!-- View Product Link -->
        ${source && source.url && html`
          <a
            href=${source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 text-center"
            onClick=${(e) => e.stopPropagation()}
          >
            <i className="fa-solid fa-external-link"></i>
            <span>View Product</span>
          </a>
        `}
      </div>
    </div>
  `;
};

export default ComparisonCard;
