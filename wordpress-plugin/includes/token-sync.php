<?php
/**
 * Token Sync
 * 
 * Handles synchronization of token usage data from WordPress to the main dashboard
 * 
 * @package Nova_XFinity_AI
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Update token usage counters
 * 
 * Called after each AI generation request to track usage
 * 
 * @param int $user_id WordPress user ID
 * @param string $result_status Status of the generation: 'success' or 'failed'
 * @return bool True on success
 */
function nova_xfinity_update_token_usage($user_id, $result_status) {
    // Get current usage data
    $usage_data = get_option('nova_xfinity_ai_token_usage', array());
    
    // Initialize user data if not exists
    if (!isset($usage_data[$user_id])) {
        $usage_data[$user_id] = array(
            'total_calls' => 0,
            'successful_calls' => 0,
            'failed_calls' => 0,
            'last_synced' => null,
            'last_updated' => current_time('mysql')
        );
    }
    
    // Update counters
    $usage_data[$user_id]['total_calls']++;
    if ($result_status === 'success') {
        $usage_data[$user_id]['successful_calls']++;
    } else {
        $usage_data[$user_id]['failed_calls']++;
    }
    $usage_data[$user_id]['last_updated'] = current_time('mysql');
    
    // Save updated data
    update_option('nova_xfinity_ai_token_usage', $usage_data);
    
    // Trigger immediate sync (non-blocking)
    nova_xfinity_sync_token_data($user_id, true);
    
    return true;
}

/**
 * Sync token usage data to main dashboard
 * 
 * Sends usage data to the main dashboard API endpoint
 * 
 * @param int|null $user_id Specific user ID to sync, or null for all users
 * @param bool $async Whether to perform async sync (non-blocking)
 * @return array|WP_Error Sync result or error
 */
function nova_xfinity_sync_token_data($user_id = null, $async = false) {
    // Get plugin settings
    $settings = get_option('nova_xfinity_ai_settings', array());
    
    // Check if platform sync is configured
    $platform_api_key = isset($settings['platform_api_key']) ? trim($settings['platform_api_key']) : '';
    $platform_api_url = isset($settings['platform_api_url']) ? trim($settings['platform_api_url']) : 'https://api.nova-xfinity.ai';
    $platform_user_id = isset($settings['platform_user_id']) ? trim($settings['platform_user_id']) : '';
    
    // Skip sync if required settings are missing
    if (empty($platform_api_key) || empty($platform_user_id)) {
        return new WP_Error('sync_not_configured', __('Platform sync is not configured. Please complete the setup wizard.', 'nova-xfinity-ai'));
    }
    
    // Get usage data
    $usage_data = get_option('nova_xfinity_ai_token_usage', array());
    
    if (empty($usage_data)) {
        return new WP_Error('no_data', __('No usage data to sync.', 'nova-xfinity-ai'));
    }
    
    // Prepare sync payload
    $sync_results = array();
    
    // If specific user ID provided, sync only that user
    if ($user_id !== null) {
        if (!isset($usage_data[$user_id])) {
            return new WP_Error('user_not_found', __('User usage data not found.', 'nova-xfinity-ai'));
        }
        
        $user_data = $usage_data[$user_id];
        $user = get_userdata($user_id);
        
        $payload = array(
            'user_id' => intval($platform_user_id), // Use platform user ID from settings
            'email' => $user ? $user->user_email : '',
            'total_calls' => intval($user_data['total_calls']),
            'successful_calls' => intval($user_data['successful_calls']),
            'failed_calls' => intval($user_data['failed_calls']),
            'wp_user_id' => intval($user_id),
            'last_updated' => $user_data['last_updated']
        );
        
        $sync_results[] = nova_xfinity_send_sync_request($platform_api_url, $platform_api_key, $payload, $user_id, $async);
    } else {
        // Sync all users
        foreach ($usage_data as $wp_user_id => $user_data) {
            $user = get_userdata($wp_user_id);
            
            $payload = array(
                'user_id' => intval($platform_user_id), // Use platform user ID from settings
                'email' => $user ? $user->user_email : '',
                'total_calls' => intval($user_data['total_calls']),
                'successful_calls' => intval($user_data['successful_calls']),
                'failed_calls' => intval($user_data['failed_calls']),
                'wp_user_id' => intval($wp_user_id),
                'last_updated' => $user_data['last_updated']
            );
            
            $sync_results[] = nova_xfinity_send_sync_request($platform_api_url, $platform_api_key, $payload, $wp_user_id, $async);
        }
    }
    
    return $sync_results;
}

/**
 * Send sync request to main dashboard API
 * 
 * @param string $api_url Base API URL
 * @param string $api_key API key for authentication
 * @param array $payload Request payload
 * @param int $wp_user_id WordPress user ID
 * @param bool $async Whether to perform async request
 * @return array|WP_Error Sync result
 */
function nova_xfinity_send_sync_request($api_url, $api_key, $payload, $wp_user_id, $async = false) {
    // Construct endpoint URL
    // Default to nova-xfinity.com if platform URL is not configured
    if (empty($api_url) || $api_url === 'https://api.nova-xfinity.ai') {
        $endpoint = 'https://nova-xfinity.com/api/sync/token-usage';
    } else {
        $endpoint = trailingslashit($api_url) . 'api/sync/token-usage';
    }
    
    // Validate URL
    if (!filter_var($endpoint, FILTER_VALIDATE_URL)) {
        $error = sprintf(__('Invalid API URL: %s', 'nova-xfinity-ai'), $endpoint);
        nova_xfinity_log_sync_error($wp_user_id, $error);
        return new WP_Error('invalid_url', $error);
    }
    
    // Prepare request arguments
    $args = array(
        'method' => 'POST',
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($payload),
        'timeout' => 15,
        'blocking' => !$async, // Non-blocking if async
        'sslverify' => true,
    );
    
    // Make request
    $response = wp_remote_request($endpoint, $args);
    
    // Handle async requests (fire and forget)
    if ($async) {
        // For async, we'll check the response in a scheduled event if it fails
        return array('async' => true, 'user_id' => $wp_user_id);
    }
    
    // Handle blocking requests
    if (is_wp_error($response)) {
        $error_message = $response->get_error_message();
        nova_xfinity_log_sync_error($wp_user_id, $error_message);
        
        // Schedule retry for async sync
        wp_schedule_single_event(
            time() + 300, // Retry in 5 minutes
            'nova_xfinity_ai_retry_sync',
            array($wp_user_id)
        );
        
        return new WP_Error('sync_failed', $error_message);
    }
    
    // Check response code
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    
    if ($response_code >= 200 && $response_code < 300) {
        // Success - update last synced timestamp
        $usage_data = get_option('nova_xfinity_ai_token_usage', array());
        if (isset($usage_data[$wp_user_id])) {
            $usage_data[$wp_user_id]['last_synced'] = current_time('mysql');
            update_option('nova_xfinity_ai_token_usage', $usage_data);
        }
        
        // Clear any sync errors for this user
        nova_xfinity_clear_sync_errors($wp_user_id);
        
        return array(
            'success' => true,
            'user_id' => $wp_user_id,
            'response_code' => $response_code,
            'message' => __('Sync completed successfully.', 'nova-xfinity-ai')
        );
    } else {
        // Error response
        $error_data = json_decode($response_body, true);
        $error_message = isset($error_data['error']['message']) 
            ? $error_data['error']['message'] 
            : sprintf(__('Sync failed with status code: %d', 'nova-xfinity-ai'), $response_code);
        
        nova_xfinity_log_sync_error($wp_user_id, $error_message);
        
        // Schedule retry for 5xx errors
        if ($response_code >= 500) {
            wp_schedule_single_event(
                time() + 300,
                'nova_xfinity_ai_retry_sync',
                array($wp_user_id)
            );
        }
        
        return new WP_Error('sync_failed', $error_message, array('status' => $response_code));
    }
}

/**
 * Log sync error
 * 
 * @param int $user_id WordPress user ID
 * @param string $error_message Error message
 */
function nova_xfinity_log_sync_error($user_id, $error_message) {
    $errors = get_option('nova_xfinity_ai_sync_errors', array());
    
    if (!isset($errors[$user_id])) {
        $errors[$user_id] = array();
    }
    
    $errors[$user_id][] = array(
        'timestamp' => current_time('mysql'),
        'message' => $error_message
    );
    
    // Keep only last 10 errors per user
    if (count($errors[$user_id]) > 10) {
        $errors[$user_id] = array_slice($errors[$user_id], -10);
    }
    
    update_option('nova_xfinity_ai_sync_errors', $errors);
}

/**
 * Clear sync errors for a user
 * 
 * @param int $user_id WordPress user ID
 */
function nova_xfinity_clear_sync_errors($user_id) {
    $errors = get_option('nova_xfinity_ai_sync_errors', array());
    
    if (isset($errors[$user_id])) {
        unset($errors[$user_id]);
        update_option('nova_xfinity_ai_sync_errors', $errors);
    }
}

/**
 * Get sync errors for a user
 * 
 * @param int|null $user_id WordPress user ID, or null for all users
 * @return array Sync errors
 */
function nova_xfinity_get_sync_errors($user_id = null) {
    $errors = get_option('nova_xfinity_ai_sync_errors', array());
    
    if ($user_id === null) {
        return $errors;
    }
    
    return isset($errors[$user_id]) ? $errors[$user_id] : array();
}

/**
 * Get token usage statistics
 * 
 * @param int|null $user_id WordPress user ID, or null for all users
 * @return array Usage statistics
 */
function nova_xfinity_get_token_usage($user_id = null) {
    $usage_data = get_option('nova_xfinity_ai_token_usage', array());
    
    if ($user_id === null) {
        return $usage_data;
    }
    
    return isset($usage_data[$user_id]) ? $usage_data[$user_id] : array(
        'total_calls' => 0,
        'successful_calls' => 0,
        'failed_calls' => 0,
        'last_synced' => null,
        'last_updated' => null
    );
}

/**
 * Reset token usage data
 * 
 * @param int|null $user_id WordPress user ID, or null for all users
 * @return bool True on success
 */
function nova_xfinity_reset_token_usage($user_id = null) {
    if ($user_id === null) {
        delete_option('nova_xfinity_ai_token_usage');
        delete_option('nova_xfinity_ai_sync_errors');
        return true;
    }
    
    $usage_data = get_option('nova_xfinity_ai_token_usage', array());
    if (isset($usage_data[$user_id])) {
        unset($usage_data[$user_id]);
        update_option('nova_xfinity_ai_token_usage', $usage_data);
    }
    
    nova_xfinity_clear_sync_errors($user_id);
    
    return true;
}

/**
 * Handle retry sync scheduled event
 * 
 * @param int $user_id WordPress user ID
 */
function nova_xfinity_retry_sync($user_id) {
    nova_xfinity_sync_token_data($user_id, false);
}

/**
 * Initialize scheduled sync
 * 
 * Sets up wp_schedule_event for periodic sync
 */
function nova_xfinity_init_scheduled_sync() {
    // Check if scheduled sync is enabled
    $settings = get_option('nova_xfinity_ai_settings', array());
    $scheduled_sync_enabled = isset($settings['enable_scheduled_sync']) ? (bool) $settings['enable_scheduled_sync'] : true;
    
    if (!$scheduled_sync_enabled) {
        // Clear any existing scheduled events
        wp_clear_scheduled_hook('nova_xfinity_ai_scheduled_sync');
        return;
    }
    
    // Schedule sync every 12 hours if not already scheduled
    if (!wp_next_scheduled('nova_xfinity_ai_scheduled_sync')) {
        wp_schedule_event(time(), 'twicedaily', 'nova_xfinity_ai_scheduled_sync');
    }
}

/**
 * Handle scheduled sync event
 */
function nova_xfinity_handle_scheduled_sync() {
    // Sync all users
    nova_xfinity_sync_token_data(null, false);
}

// Hook scheduled sync handler
add_action('nova_xfinity_ai_scheduled_sync', 'nova_xfinity_handle_scheduled_sync');

// Hook retry sync handler
add_action('nova_xfinity_ai_retry_sync', 'nova_xfinity_retry_sync');

// Initialize scheduled sync on admin init
add_action('admin_init', 'nova_xfinity_init_scheduled_sync');
