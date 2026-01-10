import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * Shared layout wrapper for authentication pages
 * Provides consistent styling and structure across all auth components
 * 
 * @param {Object} props
 * @param {string} props.title - Main page title
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.children - Content to render inside the layout
 * @param {string} props.error - Optional error message to display
 * @param {string} props.message - Optional success/info message to display
 */
const AuthLayout = ({ title, subtitle, children, error, message }) => {
  return html`
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        ${title && html`
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ${title}
            </h2>
            ${subtitle && html`
              <p className="mt-2 text-center text-sm text-gray-600">
                ${subtitle}
              </p>
            `}
          </div>
        `}

        ${error && error.trim() && html`
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-circle-exclamation text-red-500"></i>
              <div>
                <strong className="font-semibold block">Error: </strong>
                <span className="block mt-1">${error}</span>
              </div>
            </div>
          </div>
        `}

        ${message && html`
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ${message}
          </div>
        `}

        ${children}
      </div>
    </div>
  `;
};

export default AuthLayout;
