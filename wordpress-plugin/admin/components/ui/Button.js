/**
 * Plasma Button Component
 * 
 * Reusable button component matching Plasma design system
 */

(function() {
    'use strict';

    const { createElement: h } = React;

    const Button = ({ 
        type = 'button',
        variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
        size = 'medium', // 'small' | 'medium' | 'large'
        children,
        onClick,
        disabled = false,
        loading = false,
        className = '',
        ...props
    }) => {
        const baseClass = 'nova-ui__button';
        const variantClass = `${baseClass}--${variant}`;
        const sizeClass = `${baseClass}--${size}`;
        const classes = [
            baseClass,
            variantClass,
            sizeClass,
            disabled && `${baseClass}--disabled`,
            loading && `${baseClass}--loading`,
            className
        ].filter(Boolean).join(' ');

        return h('button', {
            type,
            className: classes,
            onClick: disabled || loading ? undefined : onClick,
            disabled: disabled || loading,
            ...props
        },
            loading ? h('span', { className: `${baseClass}__spinner` }) : null,
            children
        );
    };

    // Export for use
    if (typeof window !== 'undefined') {
        window.NovaUI = window.NovaUI || {};
        window.NovaUI.Button = Button;
    }
})();
