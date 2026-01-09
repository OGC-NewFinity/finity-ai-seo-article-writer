/**
 * Nova‑XFinity AI Setup Wizard
 * 
 * Multi-step onboarding wizard for configuring essential plugin settings
 * Uses React with hooks for state management
 * 
 * Note: This file uses JSX syntax and requires Babel standalone for transformation
 */

const { useState, useEffect } = React;

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
    apiKey: null, // null = not tested, true = valid, false = invalid
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
    // Clear validation status when key changes
    if (field === 'apiKey') {
      setValidationStatus(prev => ({ ...prev, apiKey: null }));
    }
    // Clear errors
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
      // Welcome step - no validation needed
      return true;
    } else if (step === 2) {
      // API Key step
      if (!formData.apiKey || formData.apiKey.trim() === '') {
        newErrors.apiKey = 'API key is required';
      } else if (validationStatus.apiKey === false) {
        newErrors.apiKey = 'Please fix the API key error before continuing';
      }
    } else if (step === 3) {
      // Provider selection - already handled in step 2
      return true;
    } else if (step === 4) {
      // Token Quota step
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
        // Scroll to top
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
      // Save all settings to WordPress
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
        // Clear localStorage
        localStorage.removeItem('nova_xfinity_setup');
        
        // Redirect to settings page
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
    return (
      <div className="wizard-progress">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`wizard-progress-step ${step < currentStep ? 'completed' : ''} ${step === currentStep ? 'active' : ''}`}
          >
            <div className="progress-step-number">{step < currentStep ? '✓' : step}</div>
            <div className="progress-step-label">
              {step === 1 && 'Welcome'}
              {step === 2 && 'API Key'}
              {step === 3 && 'Provider'}
              {step === 4 && 'Quota'}
              {step === 5 && 'Review'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Step 1: Welcome
  const renderWelcomeStep = () => (
    <div className="wizard-step-content">
      <div className="wizard-welcome">
        <div className="welcome-icon">🚀</div>
        <h2>Welcome to Nova‑XFinity AI</h2>
        <p className="welcome-description">
          Let's get you set up in just a few steps. This wizard will help you configure
          essential settings for AI-powered content generation.
        </p>
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>AI-powered content generation</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎨</span>
            <span>Multi-provider support</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Token usage tracking</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: API Key
  const renderApiKeyStep = () => (
    <div className="wizard-step-content">
      <h2>API Key Configuration</h2>
      <p className="step-description">
        Enter your AI provider API key. We'll validate it before you continue.
      </p>
      
      <div className="wizard-form-group">
        <label htmlFor="api-key">API Key *</label>
        <div className="input-with-validation">
          <input
            type="password"
            id="api-key"
            value={formData.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            onBlur={handleApiKeyBlur}
            placeholder={formData.provider === 'openai' ? 'sk-...' : 'AIza...'}
            className={errors.apiKey ? 'error' : ''}
            disabled={loading}
          />
          {validationStatus.apiKey === true && (
            <span className="validation-badge success">✓ Valid</span>
          )}
          {validationStatus.apiKey === false && (
            <span className="validation-badge error">✗ Invalid</span>
          )}
          {loading && (
            <span className="validation-badge loading">Validating...</span>
          )}
        </div>
        {errors.apiKey && (
          <div className="error-message">{errors.apiKey}</div>
        )}
        <p className="field-description">
          {formData.provider === 'openai' 
            ? 'Get your OpenAI API key from platform.openai.com/api-keys'
            : 'Get your Gemini API key from makersuite.google.com/app/apikey'}
        </p>
      </div>
    </div>
  );

  // Step 3: Provider Selection
  const renderProviderStep = () => (
    <div className="wizard-step-content">
      <h2>Provider Selection</h2>
      <p className="step-description">
        Choose your preferred AI provider for content generation.
      </p>
      
      <div className="wizard-form-group">
        <label htmlFor="provider">AI Provider *</label>
        <select
          id="provider"
          value={formData.provider}
          onChange={(e) => handleInputChange('provider', e.target.value)}
          className="wizard-select"
        >
          <option value="openai">OpenAI (GPT-4)</option>
          <option value="gemini">Google Gemini</option>
          <option value="stability">Stability AI</option>
          <option value="anthropic">Anthropic Claude</option>
        </select>
        <p className="field-description">
          You can change this later in settings. The API key you entered should match the selected provider.
        </p>
      </div>
    </div>
  );

  // Step 4: Token Quota
  const renderQuotaStep = () => (
    <div className="wizard-step-content">
      <h2>Token Quota Limit</h2>
      <p className="step-description">
        Set a monthly token usage limit to help manage costs and usage.
      </p>
      
      <div className="wizard-form-group">
        <label htmlFor="token-quota">Monthly Token Quota *</label>
        <input
          type="number"
          id="token-quota"
          value={formData.tokenQuota}
          onChange={(e) => handleInputChange('tokenQuota', parseInt(e.target.value) || 0)}
          min="100"
          max="1000000"
          step="100"
          className={errors.tokenQuota ? 'error' : ''}
        />
        {errors.tokenQuota && (
          <div className="error-message">{errors.tokenQuota}</div>
        )}
        <p className="field-description">
          Recommended: 10,000 tokens per month. You can adjust this later in settings.
        </p>
      </div>
    </div>
  );

  // Step 5: Review & Confirm
  const renderReviewStep = () => (
    <div className="wizard-step-content">
      <h2>Review & Confirm</h2>
      <p className="step-description">
        Review your settings before completing the setup.
      </p>
      
      <div className="wizard-review-summary">
        <div className="review-item">
          <span className="review-label">API Provider:</span>
          <span className="review-value">{formData.provider.toUpperCase()}</span>
        </div>
        <div className="review-item">
          <span className="review-label">API Key:</span>
          <span className="review-value">
            {formData.apiKey ? `${formData.apiKey.substring(0, 8)}...` : 'Not set'}
            {validationStatus.apiKey === true && <span className="review-status success">✓</span>}
          </span>
        </div>
        <div className="review-item">
          <span className="review-label">Token Quota:</span>
          <span className="review-value">{formData.tokenQuota.toLocaleString()} tokens/month</span>
        </div>
      </div>
      
      <div className="wizard-notice">
        <p>
          <strong>Note:</strong> Settings will be saved to WordPress options. You can modify them anytime
          from the plugin settings page.
        </p>
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderWelcomeStep();
      case 2:
        return renderApiKeyStep();
      case 3:
        return renderProviderStep();
      case 4:
        return renderQuotaStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="nova-xfinity-setup-wizard">
      <div className="wizard-header">
        <div className="wizard-logo">
          <img 
            src={window.novaXfinityWizard?.logoUrl || ''} 
            alt="Nova‑XFinity AI" 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <h1>Nova‑XFinity AI Setup</h1>
        <p>Configure your plugin in just a few steps</p>
      </div>

      {renderProgress()}

      <div className="wizard-body">
        {renderStepContent()}
      </div>

      <div className="wizard-navigation">
        <button
          type="button"
          className="button button-secondary wizard-prev"
          onClick={handlePrevious}
          disabled={currentStep === 1 || loading}
        >
          {strings?.previous || 'Previous'}
        </button>
        
        <div className="wizard-nav-right">
          {currentStep < totalSteps ? (
            <button
              type="button"
              className="button button-primary wizard-next"
              onClick={handleNext}
              disabled={loading}
            >
              {strings?.next || 'Next'}
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary wizard-complete"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? (strings?.completing || 'Saving...') : (strings?.complete || 'Complete Setup')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Export for use in WordPress
if (typeof window !== 'undefined') {
  window.SetupWizard = SetupWizard;
}
