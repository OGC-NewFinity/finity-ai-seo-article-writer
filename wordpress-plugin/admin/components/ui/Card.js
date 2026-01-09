/**
 * Plasma Card Component
 * 
 * Reusable card component matching Plasma design system
 */

(function() {
    'use strict';

    const { createElement: h } = React;

    const Card = ({
        title,
        subtitle,
        children,
        footer,
        variant = 'default', // 'default' | 'elevated' | 'outlined'
        className = '',
        ...props
    }) => {
        const baseClass = 'nova-ui__card';
        const variantClass = `${baseClass}--${variant}`;
        const classes = [
            baseClass,
            variantClass,
            className
        ].filter(Boolean).join(' ');

        return h('div', { className: classes, ...props },
            (title || subtitle) && h('div', { className: `${baseClass}__header` },
                title && h('h3', { className: `${baseClass}__title` }, title),
                subtitle && h('p', { className: `${baseClass}__subtitle` }, subtitle)
            ),
            h('div', { className: `${baseClass}__body` }, children),
            footer && h('div', { className: `${baseClass}__footer` }, footer)
        );
    };

    // Export for use
    if (typeof window !== 'undefined') {
        window.NovaUI = window.NovaUI || {};
        window.NovaUI.Card = Card;
    }
})();
