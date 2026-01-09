/**
 * Nova‑XFinity AI Setup Wizard
 * 
 * Multi-step onboarding wizard for configuring essential plugin settings
 * Uses React with hooks for state management
 * 
 * Compiled version without JSX for WordPress compatibility
 */

(function() {
    'use strict';

    const { useState, useEffect, createElement: h } = React;

    const SetupWizard = ({ ajaxUrl, nonce, restUrl, restNonce, strings }) => {
        const [currentStep, setCurrentStep] = useState(1);
        const [formData, setFormData] = useState(() => {
            // Initialize from localStorage if available
            const saved = localStorage.getItem('nova_xfinity_setup');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse saved setup data:', e);
                }
            }
            return {
                apiKey: '',
                provider: 'openai',
                tokenQuota: 10000,
                platformApiKey: '',
                platformUrl: 'https://api.nova-xfinity.ai',
                platformUserId: '',
                defaultTone: 'professional',
                maxWordCount: 1000
            };
        });

        const [validationStatus, setValidationStatus] = useState({
            apiKey: null,
            platform: null
        });

        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState({});

        const totalSteps = 5;

        // Save to localStorage whenever formData changes
        useEffect(() => {
            localStorage.setItem('nova_xfinity_setup', JSON.stringify(formData));
        }, [formData]);

        // Handle input changes
        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (field === 'apiKey') {
                setValidationStatus(prev => ({ ...prev, apiKey: null }));
            }
            if (errors[field]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        };

        // Validate API key on blur
        const handleApiKeyBlur = async () => {
            if (!formData.apiKey || formData.apiKey.trim() === '') {
                return;
            }

            setLoading(true);
            setValidationStatus(prev => ({ ...prev, apiKey: null }));

            try {
                const response = await fetch(`${restUrl}validate-key`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': restNonce
                    },
                    body: JSON.stringify({
                        provider: formData.provider,
                        api_key: formData.apiKey
                    })
                });

                const data = await response.json();

                if (data.success && data.valid) {
                    setValidationStatus(prev => ({ ...prev, apiKey: true }));
                } else {
                    setValidationStatus(prev => ({ ...prev, apiKey: false }));
                    setErrors(prev => ({ ...prev, apiKey: data.message || 'Invalid API key' }));
                }
            } catch (error) {
                console.error('API key validation error:', error);
                setValidationStatus(prev => ({ ...prev, apiKey: false }));
                setErrors(prev => ({ ...prev, apiKey: 'Failed to validate API key. Please try again.' }));
            } finally {
                setLoading(false);
            }
        };

        // Validate step before proceeding
        const validateStep = (step) => {
            const newErrors = {};

            if (step === 1) {
                return true;
            } else if (step === 2) {
                if (!formData.apiKey || formData.apiKey.trim() === '') {
                    newErrors.apiKey = 'API key is required';
                } else if (validationStatus.apiKey === false) {
                    newErrors.apiKey = 'Please fix the API key error before continuing';
                }
            } else if (step === 3) {
                return true;
            } else if (step === 4) {
                const quota = parseInt(formData.tokenQuota);
                if (isNaN(quota) || quota < 100 || quota > 1000000) {
                    newErrors.tokenQuota = 'Token quota must be between 100 and 1,000,000';
                }
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        // Handle next button
        const handleNext = () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    setCurrentStep(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        };

        // Handle previous button
        const handlePrevious = () => {
            if (currentStep > 1) {
                setCurrentStep(prev => prev - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        // Handle final submission
        const handleComplete = async () => {
            if (!validateStep(currentStep)) {
                return;
            }

            setLoading(true);

            try {
                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'nova_xfinity_ai_wizard_complete',
                        nonce: nonce,
                        ...formData
                    })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.removeItem('nova_xfinity_setup');
                    if (data.data && data.data.redirect_url) {
                        window.location.href = data.data.redirect_url;
                    } else {
                        window.location.reload();
                    }
                } else {
                    alert(data.data?.message || 'Failed to save settings. Please try again.');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Completion error:', error);
                alert('An error occurred. Please try again.');
                setLoading(false);
            }
        };

        // Render step progress indicator
        const renderProgress = () => {
            return h('div', { className: 'wizard-progress' },
                [1, 2, 3, 4, 5].map((step) => {
                    const stepLabels = ['Welcome', 'API Key', 'Provider', 'Quota', 'Review'];
                    return h('div', {
                        key: step,
                        className: `wizard-progress-step ${step < currentStep ? 'completed' : ''} ${step === currentStep ? 'active' : ''}`
                    },
                        h('div', { className: 'progress-step-number' }, step < currentStep ? '✓' : step),
                        h('div', { className: 'progress-step-label' }, stepLabels[step - 1])
                    );
                })
            );
        };

        // Step 1: Welcome
        const renderWelcomeStep = () => h('div', { className: 'wizard-step-content' },
            h('div', { className: 'wizard-welcome' },
                h('div', { className: 'welcome-icon' }, '🚀'),
                h('h2', null, 'Welcome to Nova‑XFinity AI'),
                h('p', { className: 'welcome-description' },
                    'Let\'s get you set up in just a few steps. This wizard will help you configure essential settings for AI-powered content generation.'
                ),
                h('div', { className: 'welcome-features' },
                    h('div', { className: 'feature-item' },
                        h('span', { className: 'feature-icon' }, '✨'),
                        h('span', null, 'AI-powered content generation')
                    ),
                    h('div', { className: 'feature-item' },
                        h('span', { className: 'feature-icon' }, '🎨'),
                        h('span', null, 'Multi-provider support')
                    ),
                    h('div', { className: 'feature-item' },
                        h('span', { className: 'feature-icon' }, '📊'),
                        h('span', null, 'Token usage tracking')
                    )
                )
            )
        );

        // Step 2: API Key
        const renderApiKeyStep = () => h('div', { className: 'wizard-step-content' },
            h('h2', null, 'API Key Configuration'),
            h('p', { className: 'step-description' },
                'Enter your AI provider API key. We\'ll validate it before you continue.'
            ),
            h('div', { className: 'wizard-form-group' },
                h('label', { htmlFor: 'api-key' }, 'API Key *'),
                h('div', { className: 'input-with-validation' },
                    h('input', {
                        type: 'password',
                        id: 'api-key',
                        value: formData.apiKey,
                        onChange: (e) => handleInputChange('apiKey', e.target.value),
                        onBlur: handleApiKeyBlur,
                        placeholder: formData.provider === 'openai' ? 'sk-...' : 'AIza...',
                        className: errors.apiKey ? 'error' : '',
                        disabled: loading
                    }),
                    validationStatus.apiKey === true && h('span', { className: 'validation-badge success' }, '✓ Valid'),
                    validationStatus.apiKey === false && h('span', { className: 'validation-badge error' }, '✗ Invalid'),
                    loading && h('span', { className: 'validation-badge loading' }, 'Validating...')
                ),
                errors.apiKey && h('div', { className: 'error-message' }, errors.apiKey),
                h('p', { className: 'field-description' },
                    formData.provider === 'openai'
                        ? 'Get your OpenAI API key from platform.openai.com/api-keys'
                        : 'Get your Gemini API key from makersuite.google.com/app/apikey'
                )
            )
        );

        // Step 3: Provider Selection
        const renderProviderStep = () => h('div', { className: 'wizard-step-content' },
            h('h2', null, 'Provider Selection'),
            h('p', { className: 'step-description' },
                'Choose your preferred AI provider for content generation.'
            ),
            h('div', { className: 'wizard-form-group' },
                h('label', { htmlFor: 'provider' }, 'AI Provider *'),
                h('select', {
                    id: 'provider',
                    value: formData.provider,
                    onChange: (e) => handleInputChange('provider', e.target.value),
                    className: 'wizard-select'
                },
                    h('option', { value: 'openai' }, 'OpenAI (GPT-4)'),
                    h('option', { value: 'gemini' }, 'Google Gemini'),
                    h('option', { value: 'stability' }, 'Stability AI'),
                    h('option', { value: 'anthropic' }, 'Anthropic Claude')
                ),
                h('p', { className: 'field-description' },
                    'You can change this later in settings. The API key you entered should match the selected provider.'
                )
            )
        );

        // Step 4: Token Quota
        const renderQuotaStep = () => h('div', { className: 'wizard-step-content' },
            h('h2', null, 'Token Quota Limit'),
            h('p', { className: 'step-description' },
                'Set a monthly token usage limit to help manage costs and usage.'
            ),
            h('div', { className: 'wizard-form-group' },
                h('label', { htmlFor: 'token-quota' }, 'Monthly Token Quota *'),
                h('input', {
                    type: 'number',
                    id: 'token-quota',
                    value: formData.tokenQuota,
                    onChange: (e) => handleInputChange('tokenQuota', parseInt(e.target.value) || 0),
                    min: '100',
                    max: '1000000',
                    step: '100',
                    className: errors.tokenQuota ? 'error' : ''
                }),
                errors.tokenQuota && h('div', { className: 'error-message' }, errors.tokenQuota),
                h('p', { className: 'field-description' },
                    'Recommended: 10,000 tokens per month. You can adjust this later in settings.'
                )
            )
        );

        // Step 5: Review & Confirm
        const renderReviewStep = () => h('div', { className: 'wizard-step-content' },
            h('h2', null, 'Review & Confirm'),
            h('p', { className: 'step-description' },
                'Review your settings before completing the setup.'
            ),
            h('div', { className: 'wizard-review-summary' },
                h('div', { className: 'review-item' },
                    h('span', { className: 'review-label' }, 'API Provider:'),
                    h('span', { className: 'review-value' }, formData.provider.toUpperCase())
                ),
                h('div', { className: 'review-item' },
                    h('span', { className: 'review-label' }, 'API Key:'),
                    h('span', { className: 'review-value' },
                        formData.apiKey ? `${formData.apiKey.substring(0, 8)}...` : 'Not set',
                        validationStatus.apiKey === true && h('span', { className: 'review-status success' }, '✓')
                    )
                ),
                h('div', { className: 'review-item' },
                    h('span', { className: 'review-label' }, 'Token Quota:'),
                    h('span', { className: 'review-value' }, `${formData.tokenQuota.toLocaleString()} tokens/month`)
                )
            ),
            h('div', { className: 'wizard-notice' },
                h('p', null,
                    h('strong', null, 'Note:'),
                    ' Settings will be saved to WordPress options. You can modify them anytime from the plugin settings page.'
                )
            )
        );

        // Render current step content
        const renderStepContent = () => {
            switch (currentStep) {
                case 1: return renderWelcomeStep();
                case 2: return renderApiKeyStep();
                case 3: return renderProviderStep();
                case 4: return renderQuotaStep();
                case 5: return renderReviewStep();
                default: return null;
            }
        };

        return h('div', { className: 'nova-xfinity-setup-wizard' },
            h('div', { className: 'wizard-header' },
                h('div', { className: 'wizard-logo' },
                    h('img', {
                        src: window.novaXfinityWizard?.logoUrl || '',
                        alt: 'Nova‑XFinity AI',
                        onError: (e) => { e.target.style.display = 'none'; }
                    })
                ),
                h('h1', null, 'Nova‑XFinity AI Setup'),
                h('p', null, 'Configure your plugin in just a few steps')
            ),
            renderProgress(),
            h('div', { className: 'wizard-body' }, renderStepContent()),
            h('div', { className: 'wizard-navigation' },
                h('button', {
                    type: 'button',
                    className: 'button button-secondary wizard-prev',
                    onClick: handlePrevious,
                    disabled: currentStep === 1 || loading
                }, strings?.previous || 'Previous'),
                h('div', { className: 'wizard-nav-right' },
                    currentStep < totalSteps
                        ? h('button', {
                            type: 'button',
                            className: 'button button-primary wizard-next',
                            onClick: handleNext,
                            disabled: loading
                        }, strings?.next || 'Next')
                        : h('button', {
                            type: 'button',
                            className: 'button button-primary wizard-complete',
                            onClick: handleComplete,
                            disabled: loading
                        }, loading ? (strings?.completing || 'Saving...') : (strings?.complete || 'Complete Setup'))
                )
            )
        );
    };

    // Export for use in WordPress
    if (typeof window !== 'undefined') {
        window.SetupWizard = SetupWizard;
    }
})();
