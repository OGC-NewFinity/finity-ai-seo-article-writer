<?php
/**
 * Setup Status
 * 
 * Functions for checking and managing setup completion status
 * 
 * @package Nova_XFinity_AI
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Check if setup is complete
 * 
 * @return bool True if setup is complete
 */
function nova_xfinity_ai_is_setup_complete() {
    $wizard_completed = get_option('nova_xfinity_ai_wizard_completed', false);
    
    if (!$wizard_completed) {
        return false;
    }
    
    // Verify essential settings exist
    $settings = get_option('nova_xfinity_ai_settings', array());
    $has_api_key = !empty($settings['openai_api_key']) || 
                   !empty($settings['gemini_api_key']) || 
                   !empty($settings['api_key']);
    
    return $has_api_key;
}

/**
 * Get setup completion percentage
 * 
 * @return int Completion percentage (0-100)
 */
function nova_xfinity_ai_get_setup_progress() {
    $progress = 0;
    $settings = get_option('nova_xfinity_ai_settings', array());
    
    // API Key (required) - 40%
    if (!empty($settings['openai_api_key']) || 
        !empty($settings['gemini_api_key']) || 
        !empty($settings['api_key'])) {
        $progress += 40;
    }
    
    // Provider selection - 20%
    if (!empty($settings['provider'])) {
        $progress += 20;
    }
    
    // Token quota - 20%
    if (!empty($settings['token_quota'])) {
        $progress += 20;
    }
    
    // Platform sync (optional) - 20%
    if (!empty($settings['platform_api_key']) && !empty($settings['platform_user_id'])) {
        $progress += 20;
    }
    
    return min($progress, 100);
}

/**
 * Get missing setup requirements
 * 
 * @return array List of missing requirements
 */
function nova_xfinity_ai_get_missing_requirements() {
    $missing = array();
    $settings = get_option('nova_xfinity_ai_settings', array());
    
    if (empty($settings['openai_api_key']) && 
        empty($settings['gemini_api_key']) && 
        empty($settings['api_key'])) {
        $missing[] = 'API Key';
    }
    
    if (empty($settings['provider'])) {
        $missing[] = 'Provider Selection';
    }
    
    if (empty($settings['token_quota'])) {
        $missing[] = 'Token Quota';
    }
    
    return $missing;
}

/**
 * Check if specific step is completed
 * 
 * @param string $step Step identifier (api_key, provider, quota, platform)
 * @return bool True if step is completed
 */
function nova_xfinity_ai_is_step_complete($step) {
    $settings = get_option('nova_xfinity_ai_settings', array());
    
    switch ($step) {
        case 'api_key':
            return !empty($settings['openai_api_key']) || 
                   !empty($settings['gemini_api_key']) || 
                   !empty($settings['api_key']);
        
        case 'provider':
            return !empty($settings['provider']);
        
        case 'quota':
            return !empty($settings['token_quota']);
        
        case 'platform':
            return !empty($settings['platform_api_key']) && 
                   !empty($settings['platform_user_id']);
        
        default:
            return false;
    }
}
