/**
 * Plasma Step Indicator Component
 * 
 * Reusable step indicator for wizards and multi-step processes
 */

(function() {
    'use strict';

    const { createElement: h } = React;

    const StepIndicator = ({
        steps = [],
        currentStep = 1,
        className = ''
    }) => {
        const baseClass = 'nova-ui__steps';

        return h('div', { className: `${baseClass} ${className}` },
            h('div', { className: `${baseClass}__track` }),
            steps.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                const stepLabel = typeof step === 'object' ? step.label : step;

                return h('div', {
                    key: stepNum,
                    className: [
                        `${baseClass}__step`,
                        isActive && `${baseClass}__step--active`,
                        isCompleted && `${baseClass}__step--completed`
                    ].filter(Boolean).join(' ')
                },
                    h('div', { className: `${baseClass}__step-number` },
                        isCompleted ? '✓' : stepNum
                    ),
                    h('div', { className: `${baseClass}__step-label` }, stepLabel)
                );
            })
        );
    };

    // Export for use
    if (typeof window !== 'undefined') {
        window.NovaUI = window.NovaUI || {};
        window.NovaUI.StepIndicator = StepIndicator;
    }
})();
