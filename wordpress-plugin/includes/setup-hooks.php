<?php
/**
 * Setup Hooks
 * 
 * Handles activation hooks and setup status management
 * 
 * @package Nova_XFinity_AI
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Handle plugin activation
 * 
 * Sets up initial options and flags for setup wizard
 */
function nova_xfinity_ai_activation_hook() {
    // Set default settings if they don't exist
    $default_settings = array(
        'default_tone' => 'professional',
        'max_word_count' => 1000,
        'platform_api_url' => 'https://api.nova-xfinity.ai',
        'token_quota' => 10000,
    );
    
    // Only add if option doesn't exist
    if (get_option('nova_xfinity_ai_settings') === false) {
        add_option('nova_xfinity_ai_settings', $default_settings);
    }
    
    // Set app URL if not exists
    if (get_option('nova_xfinity_ai_app_url') === false) {
        add_option('nova_xfinity_ai_app_url', 'http://localhost:3000');
    }
    
    // Mark wizard as not completed so it runs on activation
    delete_option('nova_xfinity_ai_wizard_completed');
    
    // Set transient to trigger wizard redirect (expires in 30 seconds)
    set_transient('nova_xfinity_ai_activation_redirect', true, 30);
    
    // Flush rewrite rules if needed
    flush_rewrite_rules();
}

/**
 * Check if setup wizard should be shown
 * 
 * @return bool True if wizard should be displayed
 */
function nova_xfinity_ai_should_show_wizard() {
    // Check if wizard was explicitly reset
    if (isset($_GET['reset_wizard']) && $_GET['reset_wizard'] === '1' && current_user_can('manage_options')) {
        return true;
    }
    
    // Check if wizard is already completed
    $wizard_completed = get_option('nova_xfinity_ai_wizard_completed', false);
    if ($wizard_completed) {
        return false;
    }
    
    // Check if essential settings are missing
    $settings = get_option('nova_xfinity_ai_settings', array());
    $has_api_keys = !empty($settings['openai_api_key']) || 
                    !empty($settings['gemini_api_key']) || 
                    !empty($settings['api_key']);
    
    // Show wizard if no API keys are configured
    if (!$has_api_keys) {
        return true;
    }
    
    // Check for activation redirect transient
    if (get_transient('nova_xfinity_ai_activation_redirect')) {
        return true;
    }
    
    return false;
}

/**
 * Mark setup wizard as completed
 * 
 * @return bool True on success
 */
function nova_xfinity_ai_complete_wizard() {
    return update_option('nova_xfinity_ai_wizard_completed', true);
}

/**
 * Reset setup wizard
 * 
 * Allows admin to re-run the wizard
 * 
 * @return bool True on success
 */
function nova_xfinity_ai_reset_wizard() {
    delete_option('nova_xfinity_ai_wizard_completed');
    delete_transient('nova_xfinity_ai_activation_redirect');
    return true;
}

/**
 * Get setup status
 * 
 * @return array Setup status information
 */
function nova_xfinity_ai_get_setup_status() {
    $settings = get_option('nova_xfinity_ai_settings', array());
    $wizard_completed = get_option('nova_xfinity_ai_wizard_completed', false);
    
    return array(
        'wizard_completed' => $wizard_completed,
        'has_api_key' => !empty($settings['openai_api_key']) || 
                        !empty($settings['gemini_api_key']) || 
                        !empty($settings['api_key']),
        'has_provider' => !empty($settings['provider']),
        'has_token_quota' => !empty($settings['token_quota']),
        'settings' => $settings
    );
}
