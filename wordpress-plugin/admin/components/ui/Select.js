/**
 * Plasma Select Component
 * 
 * Reusable select/dropdown component matching Plasma design system
 */

(function() {
    'use strict';

    const { createElement: h } = React;

    const Select = ({
        label,
        value,
        onChange,
        options = [],
        placeholder = 'Select an option...',
        error = null,
        helperText = null,
        disabled = false,
        required = false,
        className = '',
        ...props
    }) => {
        const baseClass = 'nova-ui__select';
        const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

        const selectClasses = [
            baseClass,
            error && `${baseClass}--error`,
            disabled && `${baseClass}--disabled`,
            className
        ].filter(Boolean).join(' ');

        return h('div', { className: `${baseClass}-wrapper` },
            label && h('label', {
                htmlFor: selectId,
                className: `${baseClass}-label`
            },
                label,
                required && h('span', { className: `${baseClass}-required` }, ' *')
            ),
            h('div', { className: `${baseClass}-container` },
                h('select', {
                    id: selectId,
                    value,
                    onChange,
                    disabled,
                    required,
                    className: selectClasses,
                    ...props
                },
                    placeholder && h('option', { value: '' }, placeholder),
                    options.map(option => {
                        const optValue = typeof option === 'object' ? option.value : option;
                        const optLabel = typeof option === 'object' ? option.label : option;
                        return h('option', { key: optValue, value: optValue }, optLabel);
                    })
                ),
                h('div', { className: `${baseClass}-arrow` }, '▼')
            ),
            error && h('div', { className: `${baseClass}-error-text` }, error),
            helperText && !error && h('div', { className: `${baseClass}-helper` }, helperText)
        );
    };

    // Export for use
    if (typeof window !== 'undefined') {
        window.NovaUI = window.NovaUI || {};
        window.NovaUI.Select = Select;
    }
})();
