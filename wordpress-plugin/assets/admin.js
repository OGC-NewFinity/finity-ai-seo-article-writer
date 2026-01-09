/**
 * Nova‑XFinity AI Admin JavaScript
 * 
 * Handles admin interface interactions including:
 * - Content generation via AJAX
 * - API key testing
 * - Form submissions and UI updates
 */

(function($) {
    'use strict';

    /**
     * Initialize admin functionality when DOM is ready
     */
    $(document).ready(function() {
        // Initialize content generation handler
        initContentGeneration();
        
        // Initialize API key testing handlers
        initApiKeyTesting();
    });

    /**
     * Initialize content generation functionality
     * 
     * Handles the "Generate Content" button click and makes AJAX request
     */
    function initContentGeneration() {
        $('#generate-content-btn').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $status = $('#generation-status');
            var $result = $('#generation-result');
            var $output = $('#generation-output');
            var prompt = $('#generation-prompt').val();
            var provider = $('#generation-provider').val();
            
            // Validate prompt
            if (!prompt || prompt.trim() === '') {
                alert('Please enter a prompt for content generation.');
                return;
            }
            
            // Disable button and show loading state
            $button.prop('disabled', true);
            $status.html('<span style="color: #0073aa;">' + finityAI.strings.generating + '</span>');
            $result.hide();
            $output.html('');
            
            // Make AJAX request to generate content
            $.ajax({
                url: finityAI.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'finity_ai_generate_content',
                    nonce: finityAI.nonce,
                    prompt: prompt,
                    provider: provider
                },
                success: function(response) {
                    // Re-enable button
                    $button.prop('disabled', false);
                    
                    if (response.success) {
                        // Show success message
                        $status.html('<span style="color: #46b450;">' + finityAI.strings.success + '</span>');
                        
                        // Display generated content
                        var content = response.data.content;
                        $output.html(formatContent(content));
                        $result.show();
                        
                        // Scroll to result
                        $('html, body').animate({
                            scrollTop: $result.offset().top - 100
                        }, 500);
                    } else {
                        // Show error message
                        $status.html('<span style="color: #dc3232;">' + (response.data.message || finityAI.strings.error) + '</span>');
                    }
                },
                error: function(xhr, status, error) {
                    // Re-enable button
                    $button.prop('disabled', false);
                    
                    // Show error message
                    $status.html('<span style="color: #dc3232;">' + finityAI.strings.error + '</span>');
                    console.error('Content generation error:', error);
                }
            });
        });
    }

    /**
     * Initialize API key testing functionality
     * 
     * Handles "Test Key" button clicks for OpenAI and Gemini API keys
     */
    function initApiKeyTesting() {
        // Test OpenAI API key
        $('#test-openai-key').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $input = $('#openai_api_key');
            var apiKey = $input.val();
            
            if (!apiKey || apiKey.trim() === '') {
                alert('Please enter an API key first.');
                return;
            }
            
            // Show loading state
            var originalText = $button.text();
            $button.prop('disabled', true).text(finityAI.strings.testing);
            
            // Make AJAX request to test API key
            $.ajax({
                url: finityAI.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'finity_ai_test_api_key',
                    nonce: finityAI.nonce,
                    provider: 'openai',
                    api_key: apiKey
                },
                success: function(response) {
                    // Re-enable button
                    $button.prop('disabled', false).text(originalText);
                    
                    if (response.success) {
                        // Show success message
                        alert(finityAI.strings.keyValid);
                    } else {
                        // Show error message
                        alert(response.data.message || finityAI.strings.keyInvalid);
                    }
                },
                error: function(xhr, status, error) {
                    // Re-enable button
                    $button.prop('disabled', false).text(originalText);
                    
                    // Show error message
                    alert(finityAI.strings.keyInvalid);
                    console.error('API key test error:', error);
                }
            });
        });
        
        // Test Gemini API key
        $('#test-gemini-key').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $input = $('#gemini_api_key');
            var apiKey = $input.val();
            
            if (!apiKey || apiKey.trim() === '') {
                alert('Please enter an API key first.');
                return;
            }
            
            // Show loading state
            var originalText = $button.text();
            $button.prop('disabled', true).text(finityAI.strings.testing);
            
            // Make AJAX request to test API key
            $.ajax({
                url: finityAI.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'finity_ai_test_api_key',
                    nonce: finityAI.nonce,
                    provider: 'gemini',
                    api_key: apiKey
                },
                success: function(response) {
                    // Re-enable button
                    $button.prop('disabled', false).text(originalText);
                    
                    if (response.success) {
                        // Show success message
                        alert(finityAI.strings.keyValid);
                    } else {
                        // Show error message
                        alert(response.data.message || finityAI.strings.keyInvalid);
                    }
                },
                error: function(xhr, status, error) {
                    // Re-enable button
                    $button.prop('disabled', false).text(originalText);
                    
                    // Show error message
                    alert(finityAI.strings.keyInvalid);
                    console.error('API key test error:', error);
                }
            });
        });
    }

    /**
     * Format generated content for display
     * 
     * Converts plain text or markdown content to formatted HTML
     * 
     * @param {string} content Raw content from AI
     * @returns {string} Formatted HTML content
     */
    function formatContent(content) {
        // Escape HTML to prevent XSS
        var escaped = $('<div>').text(content).html();
        
        // Convert line breaks to <br> tags
        escaped = escaped.replace(/\n\n/g, '</p><p>');
        escaped = escaped.replace(/\n/g, '<br>');
        
        // Convert markdown-style headings (basic support)
        escaped = escaped.replace(/^### (.*)$/gm, '<h3>$1</h3>');
        escaped = escaped.replace(/^## (.*)$/gm, '<h2>$1</h2>');
        escaped = escaped.replace(/^# (.*)$/gm, '<h1>$1</h1>');
        
        // Convert markdown-style bold and italic
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Wrap in paragraph tags
        return '<p>' + escaped + '</p>';
    }

})(jQuery);
