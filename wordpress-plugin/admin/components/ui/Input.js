/**
 * Plasma Input Component
 * 
 * Reusable input component matching Plasma design system
 */

(function() {
    'use strict';

    const { useState, createElement: h } = React;

    const Input = ({
        type = 'text',
        label,
        value,
        onChange,
        onBlur,
        placeholder = '',
        error = null,
        helperText = null,
        disabled = false,
        required = false,
        className = '',
        ...props
    }) => {
        const baseClass = 'nova-ui__input';
        const [focused, setFocused] = useState(false);

        const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

        const inputClasses = [
            baseClass,
            focused && `${baseClass}--focused`,
            error && `${baseClass}--error`,
            disabled && `${baseClass}--disabled`,
            className
        ].filter(Boolean).join(' ');

        return h('div', { className: `${baseClass}-wrapper` },
            label && h('label', {
                htmlFor: inputId,
                className: `${baseClass}-label`
            },
                label,
                required && h('span', { className: `${baseClass}-required` }, ' *')
            ),
            h('div', { className: `${baseClass}-container` },
                h('input', {
                    id: inputId,
                    type,
                    value,
                    onChange,
                    onBlur: (e) => {
                        setFocused(false);
                        onBlur && onBlur(e);
                    },
                    onFocus: () => setFocused(true),
                    placeholder,
                    disabled,
                    required,
                    className: inputClasses,
                    ...props
                }),
                error && h('div', { className: `${baseClass}-error-icon` }, '⚠')
            ),
            error && h('div', { className: `${baseClass}-error-text` }, error),
            helperText && !error && h('div', { className: `${baseClass}-helper` }, helperText)
        );
    };

    // Export for use
    if (typeof window !== 'undefined') {
        window.NovaUI = window.NovaUI || {};
        window.NovaUI.Input = Input;
    }
})();
