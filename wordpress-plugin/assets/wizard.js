/**
 * Nova‑XFinity AI Setup Wizard JavaScript
 * 
 * Handles multi-step wizard navigation, form validation, and AJAX requests
 */

(function($) {
    'use strict';

    var currentStep = 1;
    var totalSteps = 4;

    /**
     * Initialize wizard when DOM is ready
     */
    $(document).ready(function() {
        initializeWizard();
    });

    /**
     * Initialize wizard functionality
     */
    function initializeWizard() {
        // Initialize step 1
        updateStepDisplay(1);
        
        // Bind navigation buttons
        $('.wizard-next').on('click', function() {
            handleNext();
        });
        
        $('.wizard-prev').on('click', function() {
            handlePrevious();
        });
        
        $('.wizard-skip').on('click', function() {
            handleSkip();
        });
        
        $('.wizard-save').on('click', function() {
            handleSave();
        });
        
        $('.wizard-complete').on('click', function() {
            handleComplete();
        });
        
        // Bind API key test buttons
        $('.test-api-key').on('click', function() {
            var provider = $(this).data('provider');
            testApiKey(provider);
        });
        
        // Bind platform key test button
        $('.test-platform-key').on('click', function() {
            testPlatformConnection();
        });
        
        // Auto-save on input change (optional, for better UX)
        $('#nova-xfinity-wizard-form input, #nova-xfinity-wizard-form select').on('change', function() {
            // Mark step as having changes
            $(this).closest('.nova-xfinity-wizard-step-content').data('has-changes', true);
        });
    }

    /**
     * Handle Next button click
     */
    function handleNext() {
        if (validateStep(currentStep)) {
            if (currentStep === 1 || currentStep === 2) {
                // Save step and continue
                saveStep(currentStep, function(success) {
                    if (success) {
                        goToStep(currentStep + 1);
                    }
                });
            } else if (currentStep === 3) {
                // Save step and show complete button
                saveStep(currentStep, function(success) {
                    if (success) {
                        goToStep(currentStep + 1);
                    }
                });
            }
        }
    }

    /**
     * Handle Previous button click
     */
    function handlePrevious() {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    }

    /**
     * Handle Skip button click
     */
    function handleSkip() {
        var stepToSkip = parseInt($('.wizard-skip').data('step'));
        if (stepToSkip === 2) {
            // Skip platform sync step
            goToStep(3);
        }
    }

    /**
     * Handle Save button click
     */
    function handleSave() {
        if (validateStep(currentStep)) {
            saveStep(currentStep, function(success) {
                if (success) {
                    goToStep(currentStep + 1);
                }
            });
        }
    }

    /**
     * Handle Complete button click
     */
    function handleComplete() {
        // Mark wizard as completed
        $.ajax({
            url: finityWizard.ajaxUrl,
            type: 'POST',
            data: {
                action: 'finity_ai_wizard_complete',
                nonce: finityWizard.nonce
            },
            success: function(response) {
                if (response.success) {
                    // Show success message and redirect
                    showSuccessMessage();
                    
                    // Redirect after short delay
                    setTimeout(function() {
                        window.location.href = response.data.redirect_url || novaXFinityWizard.ajaxUrl.replace('admin-ajax.php', 'options-general.php?page=nova-xfinity-ai-settings');
                    }, 2000);
                } else {
                    alert(response.data.message || finityWizard.strings.error);
                }
            },
            error: function() {
                alert(finityWizard.strings.error);
            }
        });
    }

    /**
     * Navigate to specific step
     * 
     * @param {number} step Step number (1-4)
     */
    function goToStep(step) {
        if (step < 1 || step > totalSteps) {
            return;
        }
        
        currentStep = step;
        updateStepDisplay(step);
        
        // Scroll to top of page
        $('html, body').animate({
            scrollTop: 0
        }, 300);
    }

    /**
     * Update step display and navigation buttons
     * 
     * @param {number} step Current step number
     */
    function updateStepDisplay(step) {
        // Hide all step contents
        $('.nova-xfinity-wizard-step-content').hide();
        
        // Show current step
        $('.nova-xfinity-wizard-step-content[data-step="' + step + '"]').show();
        
        // Update progress indicator
        $('.nova-xfinity-wizard-step').each(function() {
            var stepNum = parseInt($(this).data('step'));
            $(this).removeClass('active completed');
            
            if (stepNum < step) {
                $(this).addClass('completed');
            } else if (stepNum === step) {
                $(this).addClass('active');
            }
        });
        
        // Update navigation buttons
        $('.wizard-prev').toggle(step > 1);
        $('.wizard-next').toggle(step < totalSteps && step < 3);
        $('.wizard-save').toggle(step === 3);
        $('.wizard-complete').toggle(step === totalSteps);
        $('.wizard-skip').toggle(step === 2);
    }

    /**
     * Validate current step
     * 
     * @param {number} step Step number to validate
     * @returns {boolean} True if step is valid
     */
    function validateStep(step) {
        var isValid = true;
        var errorMessages = [];
        
        if (step === 1) {
            // Step 1: At least one API key is required
            var openaiKey = $('#wizard-openai-key').val().trim();
            var geminiKey = $('#wizard-gemini-key').val().trim();
            
            if (!openaiKey && !geminiKey) {
                isValid = false;
                errorMessages.push(finityWizard.strings.required);
                $('.wizard-step-validation[data-step="1"] .error-message').show();
            } else {
                $('.wizard-step-validation[data-step="1"] .error-message').hide();
            }
        } else if (step === 2) {
            // Step 2: Platform sync is optional, no validation needed
            isValid = true;
        } else if (step === 3) {
            // Step 3: Defaults validation
            var maxWords = parseInt($('#wizard-max-words').val());
            if (isNaN(maxWords) || maxWords < 100 || maxWords > 10000) {
                isValid = false;
                errorMessages.push('Max word count must be between 100 and 10000');
            }
        }
        
        if (!isValid && errorMessages.length > 0) {
            alert(errorMessages.join('\n'));
        }
        
        return isValid;
    }

    /**
     * Save step data via AJAX
     * 
     * @param {number} step Step number
     * @param {Function} callback Callback function
     */
    function saveStep(step, callback) {
        // Get form data for current step
        var formData = {};
        
        if (step === 1) {
            formData = {
                openai_api_key: $('#wizard-openai-key').val().trim(),
                gemini_api_key: $('#wizard-gemini-key').val().trim()
            };
        } else if (step === 2) {
            formData = {
                platform_api_url: $('#wizard-platform-url').val().trim(),
                platform_api_key: $('#wizard-platform-key').val().trim(),
                platform_user_id: $('#wizard-platform-user-id').val().trim()
            };
        } else if (step === 3) {
            formData = {
                default_tone: $('#wizard-default-tone').val(),
                max_word_count: parseInt($('#wizard-max-words').val())
            };
        }
        
        // Show loading state
        var $saveButton = $('.wizard-save');
        var originalText = $saveButton.text();
        $saveButton.prop('disabled', true).text(finityWizard.strings.testing);
        
        $.ajax({
            url: finityWizard.ajaxUrl,
            type: 'POST',
            data: {
                action: 'finity_ai_wizard_save_step',
                nonce: finityWizard.nonce,
                step: step,
                data: formData
            },
            success: function(response) {
                $saveButton.prop('disabled', false).text(originalText);
                
                if (response.success) {
                    if (callback) {
                        callback(true);
                    }
                } else {
                    alert(response.data.message || finityWizard.strings.error);
                    if (callback) {
                        callback(false);
                    }
                }
            },
            error: function() {
                $saveButton.prop('disabled', false).text(originalText);
                alert(finityWizard.strings.error);
                if (callback) {
                    callback(false);
                }
            }
        });
    }

    /**
     * Test API key for provider
     * 
     * @param {string} provider Provider name (openai or gemini)
     */
    function testApiKey(provider) {
        var $input = $('#wizard-' + provider + '-key');
        var $button = $('.test-api-key[data-provider="' + provider + '"]');
        var $status = $('.test-status[data-provider="' + provider + '"]');
        var apiKey = $input.val().trim();
        
        if (!apiKey) {
            alert('Please enter an API key first.');
            return;
        }
        
        // Show loading state
        var originalText = $button.text();
        $button.prop('disabled', true).text(finityWizard.strings.testing);
        $status.html('').removeClass('success error');
        
        // Use existing test API key AJAX endpoint
        $.ajax({
            url: finityAI.ajaxUrl,
            type: 'POST',
            data: {
                action: 'finity_ai_test_api_key',
                nonce: finityAI.nonce,
                provider: provider,
                api_key: apiKey
            },
            success: function(response) {
                $button.prop('disabled', false).text(originalText);
                
                if (response.success) {
                    $status.html('<span class="success">✓ ' + finityWizard.strings.valid + '</span>').addClass('success');
                } else {
                    $status.html('<span class="error">✗ ' + (response.data.message || finityWizard.strings.invalid) + '</span>').addClass('error');
                }
            },
            error: function() {
                $button.prop('disabled', false).text(originalText);
                $status.html('<span class="error">✗ ' + finityWizard.strings.invalid + '</span>').addClass('error');
            }
        });
    }

    /**
     * Test platform connection
     */
    function testPlatformConnection() {
        var $urlInput = $('#wizard-platform-url');
        var $keyInput = $('#wizard-platform-key');
        var $userIdInput = $('#wizard-platform-user-id');
        var $button = $('.test-platform-key');
        var $status = $('.test-status[data-provider="platform"]');
        
        var platformUrl = $urlInput.val().trim();
        var platformKey = $keyInput.val().trim();
        var userId = $userIdInput.val().trim();
        
        if (!platformUrl || !platformKey || !userId) {
            alert('Please enter Platform URL, API Key, and User ID first.');
            return;
        }
        
        // Show loading state
        var originalText = $button.text();
        $button.prop('disabled', true).text(finityWizard.strings.verifying);
        $status.html('').removeClass('success error');
        
        $.ajax({
            url: finityWizard.ajaxUrl,
            type: 'POST',
            data: {
                action: 'finity_ai_wizard_test_platform',
                nonce: finityWizard.nonce,
                platform_url: platformUrl,
                platform_key: platformKey,
                user_id: userId
            },
            success: function(response) {
                $button.prop('disabled', false).text(originalText);
                
                if (response.success) {
                    $status.html('<span class="success">✓ ' + (response.data.message || finityWizard.strings.valid) + '</span>').addClass('success');
                } else {
                    $status.html('<span class="error">✗ ' + (response.data.message || finityWizard.strings.invalid) + '</span>').addClass('error');
                }
            },
            error: function() {
                $button.prop('disabled', false).text(originalText);
                $status.html('<span class="error">✗ ' + finityWizard.strings.invalid + '</span>').addClass('error');
            }
        });
    }

    /**
     * Show success message
     */
    function showSuccessMessage() {
        $('.nova-xfinity-wizard-complete').prepend(
            '<div class="notice notice-success is-dismissible"><p>' + 
            'Setup completed successfully! Redirecting to settings...' + 
            '</p></div>'
        );
    }

})(jQuery);
