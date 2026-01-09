<?php
/**
 * Plugin Name: Nova‑XFinity AI Article Writer
 * Plugin URI: https://nova-xfinity.ai
 * Description: AI-powered SEO-optimized article generation for WordPress with multi-provider support, media generation, and research intelligence.
 * Version: 1.0.0
 * Author: Nova‑XFinity AI
 * Author URI: https://nova-xfinity.ai
 * License: MIT
 * Text Domain: nova-xfinity-ai
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('NOVA_XFINITY_AI_VERSION', '1.0.0');
define('NOVA_XFINITY_AI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('NOVA_XFINITY_AI_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include setup files
require_once NOVA_XFINITY_AI_PLUGIN_DIR . 'includes/setup-hooks.php';
require_once NOVA_XFINITY_AI_PLUGIN_DIR . 'includes/setup-status.php';
require_once NOVA_XFINITY_AI_PLUGIN_DIR . 'includes/token-sync.php';

/**
 * Main Plugin Class
 * 
 * Handles all plugin functionality including admin UI, settings management,
 * and REST API endpoints for AI content generation.
 */
class Nova_XFinity_AI_SEO_Writer {
    
    private static $instance = null;
    
    /**
     * Get singleton instance
     * 
     * @return Nova_XFinity_AI_SEO_Writer
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor - Initialize hooks and actions
     */
    private function __construct() {
        // Check for activation redirect
        add_action('admin_init', array($this, 'check_activation_redirect'));
        
        // Register admin menu under Settings
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Initialize WordPress Settings API
        add_action('admin_init', array($this, 'register_settings'));
        
        // Register REST API routes for AI content generation
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Register AJAX handlers for admin actions
        add_action('wp_ajax_nova_xfinity_ai_generate_content', array($this, 'ajax_generate_content'));
        add_action('wp_ajax_nova_xfinity_ai_test_api_key', array($this, 'ajax_test_api_key'));
        
        // Register AJAX handlers for wizard
        add_action('wp_ajax_nova_xfinity_ai_wizard_save_step', array($this, 'ajax_wizard_save_step'));
        add_action('wp_ajax_nova_xfinity_ai_wizard_test_platform', array($this, 'ajax_wizard_test_platform'));
        add_action('wp_ajax_nova_xfinity_ai_wizard_complete', array($this, 'ajax_wizard_complete'));
        add_action('wp_ajax_nova_xfinity_ai_wizard_reset', array($this, 'ajax_wizard_reset'));
        
        // Register scheduled event handler for token sync retries
        add_action('nova_xfinity_ai_retry_token_sync', array($this, 'handle_retry_token_sync'), 10, 4);
        
        // Hook into AI generation results for token tracking
        add_action('nova_xfinity_ai_generation_result', 'nova_xfinity_update_token_usage', 10, 2);
    }
    
    /**
     * Handle retry token sync scheduled event
     * 
     * @param string $api_url Platform API endpoint URL
     * @param string $api_key Platform API key
     * @param array $payload Request payload
     * @param int $retry_count Current retry attempt
     */
    public function handle_retry_token_sync($api_url, $api_key, $payload, $retry_count) {
        $this->send_token_usage_request($api_url, $api_key, $payload, $retry_count);
    }
    
    /**
     * Check for activation redirect and redirect to wizard if needed
     */
    public function check_activation_redirect() {
        // Check if we should redirect to wizard
        if (get_transient('nova_xfinity_ai_activation_redirect')) {
            delete_transient('nova_xfinity_ai_activation_redirect');
            
            // Only redirect if wizard should be shown
            if ($this->should_show_wizard() && !isset($_GET['page'])) {
                wp_safe_redirect(admin_url('options-general.php?page=nova-xfinity-ai-wizard'));
                exit;
            }
        }
    }
    
    /**
     * Add admin menu entry under Settings tab
     * 
     * Creates a submenu page under WordPress Settings menu
     */
    public function add_admin_menu() {
        // Check if wizard should be shown
        if ($this->should_show_wizard()) {
            // Add wizard page as the main menu
            add_submenu_page(
                'options-general.php',                    // Parent slug (Settings)
                __('Nova‑XFinity AI Setup Wizard', 'nova-xfinity-ai'), // Page title
                __('Nova‑XFinity SEO Writer', 'nova-xfinity-ai'),     // Menu title
                'manage_options',                          // Capability required
                'nova-xfinity-ai-wizard',                        // Menu slug
                array($this, 'render_wizard_page')         // Callback function
            );
        } else {
            // Add settings page
            add_submenu_page(
                'options-general.php',                    // Parent slug (Settings)
                __('Nova‑XFinity SEO Writer', 'nova-xfinity-ai'),    // Page title
                __('Nova‑XFinity SEO Writer', 'nova-xfinity-ai'),    // Menu title
                'manage_options',                         // Capability required
                'nova-xfinity-ai-settings',                     // Menu slug
                array($this, 'render_settings_page')      // Callback function
            );
            
            // Add sync & stats page
            add_submenu_page(
                'options-general.php',                    // Parent slug (Settings)
                __('Sync & Stats', 'nova-xfinity-ai'),    // Page title
                __('Sync & Stats', 'nova-xfinity-ai'),    // Menu title
                'manage_options',                         // Capability required
                'nova-xfinity-ai-sync',                   // Menu slug
                array($this, 'render_sync_page')         // Callback function
            );
        }
    }
    
    /**
     * Check if wizard should be shown
     * 
     * Returns true if:
     * - Plugin was just activated, OR
     * - Settings don't exist, OR
     * - Wizard hasn't been completed
     * 
     * @return bool True if wizard should be shown
     */
    private function should_show_wizard() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $wizard_completed = get_option('nova_xfinity_ai_wizard_completed', false);
        
        // Show wizard if not completed and essential settings are missing
        if (!$wizard_completed) {
            // Check if essential settings are missing
            $has_api_keys = !empty($settings['openai_api_key']) || !empty($settings['gemini_api_key']);
            if (!$has_api_keys) {
                return true;
            }
        }
        
        // Check if user explicitly wants to reset wizard
        if (isset($_GET['reset_wizard']) && $_GET['reset_wizard'] === '1' && current_user_can('manage_options')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Register settings using WordPress Settings API
     * 
     * Registers settings fields, sections, and sanitization callbacks
     */
    public function register_settings() {
        // Register setting group
        register_setting(
            'nova_xfinity_ai_settings_group',           // Option group
            'nova_xfinity_ai_settings',                 // Option name
            array($this, 'sanitize_settings')     // Sanitization callback
        );
        
        // Add settings section
        add_settings_section(
            'nova_xfinity_ai_api_section',              // Section ID
            '', // Section title (rendered in callback)
            array($this, 'render_api_section'),   // Callback function
            'nova-xfinity-ai-settings'                  // Page slug
        );
        
        // Add settings section for content defaults
        add_settings_section(
            'nova_xfinity_ai_content_section',          // Section ID
            '', // Section title (rendered in callback)
            array($this, 'render_content_section'), // Callback function
            'nova-xfinity-ai-settings'                  // Page slug
        );
        
        // Register OpenAI API Key field
        add_settings_field(
            'openai_api_key',                     // Field ID
            __('OpenAI API Key', 'nova-xfinity-ai'),    // Field title
            array($this, 'render_openai_api_key_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_api_section'               // Section ID
        );
        
        // Register Gemini API Key field
        add_settings_field(
            'gemini_api_key',                     // Field ID
            __('Gemini API Key', 'nova-xfinity-ai'),    // Field title
            array($this, 'render_gemini_api_key_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_api_section'               // Section ID
        );
        
        // Register Default Tone/Style field
        add_settings_field(
            'default_tone',                       // Field ID
            __('Default Tone/Style', 'nova-xfinity-ai'), // Field title
            array($this, 'render_default_tone_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_content_section'           // Section ID
        );
        
        // Register Max Word Count field
        add_settings_field(
            'max_word_count',                     // Field ID
            __('Max Word Count', 'nova-xfinity-ai'),    // Field title
            array($this, 'render_max_word_count_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_content_section'           // Section ID
        );
        
        // Add platform sync section
        add_settings_section(
            'nova_xfinity_ai_platform_section',         // Section ID
            '', // Section title (rendered in callback)
            array($this, 'render_platform_section'), // Callback function
            'nova-xfinity-ai-settings'                  // Page slug
        );
        
        // Register Platform API Key field
        add_settings_field(
            'platform_api_key',                   // Field ID
            __('Platform API Key', 'nova-xfinity-ai'),  // Field title
            array($this, 'render_platform_api_key_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_platform_section'          // Section ID
        );
        
        // Register Platform API URL field
        add_settings_field(
            'platform_api_url',                   // Field ID
            __('Platform API URL', 'nova-xfinity-ai'),  // Field title
            array($this, 'render_platform_api_url_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_platform_section'          // Section ID
        );
        
        // Register User ID field (for platform sync)
        add_settings_field(
            'platform_user_id',                   // Field ID
            __('Platform User ID', 'nova-xfinity-ai'),  // Field title
            array($this, 'render_platform_user_id_field'), // Callback function
            'nova-xfinity-ai-settings',                 // Page slug
            'nova_xfinity_ai_platform_section'          // Section ID
        );
    }
    
    /**
     * Sanitize and validate settings input
     * 
     * @param array $input Raw input data from form
     * @return array Sanitized settings array
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Sanitize API keys (remove whitespace, basic validation)
        if (isset($input['openai_api_key'])) {
            $sanitized['openai_api_key'] = sanitize_text_field(trim($input['openai_api_key']));
        }
        
        if (isset($input['gemini_api_key'])) {
            $sanitized['gemini_api_key'] = sanitize_text_field(trim($input['gemini_api_key']));
        }
        
        // Sanitize default tone (must be one of allowed values)
        if (isset($input['default_tone'])) {
            $allowed_tones = array('professional', 'casual', 'friendly', 'formal', 'conversational', 'technical');
            $sanitized['default_tone'] = in_array($input['default_tone'], $allowed_tones) 
                ? sanitize_text_field($input['default_tone']) 
                : 'professional';
        }
        
        // Sanitize max word count (must be positive integer)
        if (isset($input['max_word_count'])) {
            $word_count = intval($input['max_word_count']);
            $sanitized['max_word_count'] = ($word_count > 0) ? $word_count : 1000;
        }
        
        // Sanitize platform API key
        if (isset($input['platform_api_key'])) {
            $sanitized['platform_api_key'] = sanitize_text_field(trim($input['platform_api_key']));
        }
        
        // Sanitize platform API URL
        if (isset($input['platform_api_url'])) {
            $url = esc_url_raw(trim($input['platform_api_url']));
            $sanitized['platform_api_url'] = $url ? $url : 'https://api.nova-xfinity.ai';
        }
        
        // Sanitize platform user ID
        if (isset($input['platform_user_id'])) {
            $sanitized['platform_user_id'] = sanitize_text_field(trim($input['platform_user_id']));
        }
        
        return $sanitized;
    }
    
    /**
     * Render API section description
     */
    public function render_api_section() {
        echo '<div class="nova-ui__card nova-ui__card--outlined" style="margin-bottom: var(--plasma-spacing-xl);"><div class="nova-ui__card__header"><h3 class="nova-ui__card__title">' . esc_html__('API Configuration', 'nova-xfinity-ai') . '</h3><p class="nova-ui__card__subtitle">' . esc_html__('Configure API keys for AI providers. These keys will be used for content generation.', 'nova-xfinity-ai') . '</p></div></div>';
    }
    
    /**
     * Render content section description
     */
    public function render_content_section() {
        echo '<div class="nova-ui__card nova-ui__card--outlined" style="margin-bottom: var(--plasma-spacing-xl);"><div class="nova-ui__card__body"><p style="color: var(--plasma-text-secondary); margin: 0;">' . esc_html__('Set default values for content generation. These can be overridden when generating content.', 'nova-xfinity-ai') . '</p></div></div>';
    }
    
    /**
     * Render OpenAI API Key field
     */
    public function render_openai_api_key_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['openai_api_key']) ? esc_attr($settings['openai_api_key']) : '';
        ?>
        <div class="nova-plasma-form-group">
            <input 
                type="password" 
                id="openai_api_key" 
                name="nova_xfinity_ai_settings[openai_api_key]" 
                value="<?php echo $value; ?>" 
                class="nova-ui__input"
                placeholder="sk-..."
            />
            <div style="display: flex; gap: var(--plasma-spacing-sm); margin-top: var(--plasma-spacing-sm);">
                <button type="button" class="nova-ui__button nova-ui__button--secondary" id="test-openai-key">
                    <?php esc_html_e('Test Key', 'nova-xfinity-ai'); ?>
                </button>
            </div>
            <p class="nova-ui__input-helper">
                <?php esc_html_e('Enter your OpenAI API key. Keep this secure and never share it publicly.', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render Gemini API Key field
     */
    public function render_gemini_api_key_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['gemini_api_key']) ? esc_attr($settings['gemini_api_key']) : '';
        ?>
        <div class="nova-plasma-form-group">
            <input 
                type="password" 
                id="gemini_api_key" 
                name="nova_xfinity_ai_settings[gemini_api_key]" 
                value="<?php echo $value; ?>" 
                class="nova-ui__input"
                placeholder="AIza..."
            />
            <div style="display: flex; gap: var(--plasma-spacing-sm); margin-top: var(--plasma-spacing-sm);">
                <button type="button" class="nova-ui__button nova-ui__button--secondary" id="test-gemini-key">
                    <?php esc_html_e('Test Key', 'nova-xfinity-ai'); ?>
                </button>
            </div>
            <p class="nova-ui__input-helper">
                <?php esc_html_e('Enter your Google Gemini API key. Keep this secure and never share it publicly.', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render Default Tone/Style field
     */
    public function render_default_tone_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['default_tone']) ? esc_attr($settings['default_tone']) : 'professional';
        $tones = array(
            'professional' => __('Professional', 'nova-xfinity-ai'),
            'casual' => __('Casual', 'nova-xfinity-ai'),
            'friendly' => __('Friendly', 'nova-xfinity-ai'),
            'formal' => __('Formal', 'nova-xfinity-ai'),
            'conversational' => __('Conversational', 'nova-xfinity-ai'),
            'technical' => __('Technical', 'nova-xfinity-ai'),
        );
        ?>
        <div class="nova-plasma-form-group">
            <select id="default_tone" name="nova_xfinity_ai_settings[default_tone]" class="nova-ui__select">
                <?php foreach ($tones as $key => $label) : ?>
                    <option value="<?php echo esc_attr($key); ?>" <?php selected($value, $key); ?>>
                        <?php echo esc_html($label); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <p class="nova-ui__select-helper">
                <?php esc_html_e('Default writing tone/style for generated content.', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render Max Word Count field
     */
    public function render_max_word_count_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['max_word_count']) ? intval($settings['max_word_count']) : 1000;
        ?>
        <div class="nova-plasma-form-group">
            <input 
                type="number" 
                id="max_word_count" 
                name="nova_xfinity_ai_settings[max_word_count]" 
                value="<?php echo esc_attr($value); ?>" 
                class="nova-ui__input"
                style="max-width: 200px;"
                min="100"
                max="10000"
                step="100"
            />
            <p class="nova-ui__input-helper">
                <?php esc_html_e('Maximum word count for generated articles. Default: 1000 words.', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render platform section description
     */
    public function render_platform_section() {
        echo '<div class="nova-ui__card nova-ui__card--outlined" style="margin-bottom: var(--plasma-spacing-xl);"><div class="nova-ui__card__header"><h3 class="nova-ui__card__title">' . esc_html__('Platform Sync', 'nova-xfinity-ai') . '</h3><p class="nova-ui__card__subtitle">' . esc_html__('Configure platform sync settings to synchronize token usage with the main platform.', 'nova-xfinity-ai') . '</p></div></div>';
    }
    
    /**
     * Render Platform API Key field
     */
    public function render_platform_api_key_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['platform_api_key']) ? esc_attr($settings['platform_api_key']) : '';
        ?>
        <div class="nova-plasma-form-group">
            <input 
                type="password" 
                id="platform_api_key" 
                name="nova_xfinity_ai_settings[platform_api_key]" 
                value="<?php echo $value; ?>" 
                class="nova-ui__input"
                placeholder="nova_xfinity_..."
            />
            <p class="nova-ui__input-helper">
                <?php esc_html_e('API key for authenticating with the platform. Get this from your platform account settings.', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render Platform API URL field
     */
    public function render_platform_api_url_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['platform_api_url']) ? esc_attr($settings['platform_api_url']) : 'https://api.nova-xfinity.ai';
        ?>
        <div class="nova-plasma-form-group">
            <input 
                type="url" 
                id="platform_api_url" 
                name="nova_xfinity_ai_settings[platform_api_url]" 
                value="<?php echo $value; ?>" 
                class="nova-ui__input"
                placeholder="https://api.nova-xfinity.ai"
            />
            <p class="nova-ui__input-helper">
                <?php esc_html_e('Base URL of the platform API. Default: https://api.nova-xfinity.ai', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render Platform User ID field
     */
    public function render_platform_user_id_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['platform_user_id']) ? esc_attr($settings['platform_user_id']) : '';
        ?>
        <div class="nova-plasma-form-group">
            <input 
                type="text" 
                id="platform_user_id" 
                name="nova_xfinity_ai_settings[platform_user_id]" 
                value="<?php echo $value; ?>" 
                class="nova-ui__input"
                placeholder="user-uuid-here"
            />
            <p class="nova-ui__input-helper">
                <?php esc_html_e('Your user ID on the platform. This is required for token usage synchronization.', 'nova-xfinity-ai'); ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * REST endpoint handler for validating API keys
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response|WP_Error Response with validation result
     */
    public function rest_validate_api_key($request) {
        $provider = $request->get_param('provider');
        $api_key = $request->get_param('api_key');
        
        $result = $this->test_api_key($provider, $api_key);
        
        if (is_wp_error($result)) {
            return rest_ensure_response(array(
                'success' => false,
                'valid' => false,
                'message' => $result->get_error_message(),
            ));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'valid' => true,
            'message' => __('API key is valid.', 'nova-xfinity-ai'),
        ));
    }
    
    /**
     * REST endpoint handler for syncing token usage
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response|WP_Error Response with sync result
     */
    public function rest_sync_token_usage($request) {
        $params = $request->get_json_params();
        $user_id = isset($params['user_id']) ? intval($params['user_id']) : null;
        $async = isset($params['async']) ? (bool) $params['async'] : false;
        
        $result = nova_xfinity_sync_token_data($user_id, $async);
        
        if (is_wp_error($result)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => $result->get_error_message(),
            ));
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Token usage synced successfully.', 'nova-xfinity-ai'),
            'data' => $result
        ));
    }
    
    /**
     * REST endpoint handler for getting usage statistics
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response Response with usage stats
     */
    public function rest_get_usage_stats($request) {
        $user_id = $request->get_param('user_id');
        $user_id = $user_id ? intval($user_id) : null;
        
        $usage = nova_xfinity_get_token_usage($user_id);
        $errors = nova_xfinity_get_sync_errors($user_id);
        
        return rest_ensure_response(array(
            'success' => true,
            'usage' => $usage,
            'errors' => $errors
        ));
    }
    
    /**
     * Render wizard page
     * 
     * Displays the React-based multi-step setup wizard
     */
    public function render_wizard_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'nova-xfinity-ai'));
        }
        ?>
        <div class="wrap nova-plasma-admin" id="nova-xfinity-setup-wizard-container">
            <!-- React wizard will mount here -->
        </div>
        <?php
    }
    
    /**
     * Render admin settings page
     * 
     * Displays the settings form with all configuration options using Plasma design
     */
    public function render_settings_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'nova-xfinity-ai'));
        }
        
        // Show success message if settings were saved
        if (isset($_GET['settings-updated'])) {
            add_settings_error(
                'nova_xfinity_ai_messages',
                'nova_xfinity_ai_message',
                __('Settings saved successfully!', 'nova-xfinity-ai'),
                'success'
            );
        }
        
        $settings = get_option('nova_xfinity_ai_settings', array());
        $usage_data = nova_xfinity_get_token_usage();
        
        // Calculate totals
        $total_calls = 0;
        $total_successful = 0;
        $total_failed = 0;
        if ($usage_data) {
            foreach ($usage_data as $user_data) {
                $total_calls += isset($user_data['total_calls']) ? intval($user_data['total_calls']) : 0;
                $total_successful += isset($user_data['successful_calls']) ? intval($user_data['successful_calls']) : 0;
                $total_failed += isset($user_data['failed_calls']) ? intval($user_data['failed_calls']) : 0;
            }
        }
        ?>
        <div class="wrap nova-plasma-admin">
            <div class="nova-plasma-container">
                <div class="nova-plasma-header">
                    <h1 class="nova-plasma-header__title"><?php echo esc_html(get_admin_page_title()); ?></h1>
                    <p class="nova-plasma-header__subtitle"><?php esc_html_e('Configure your AI content generation settings', 'nova-xfinity-ai'); ?></p>
                </div>
                
                <div class="nova-plasma-stats">
                    <div class="nova-plasma-stat">
                        <div class="nova-plasma-stat__value"><?php echo esc_html($total_calls); ?></div>
                        <div class="nova-plasma-stat__label"><?php esc_html_e('Total Calls', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-plasma-stat">
                        <div class="nova-plasma-stat__value" style="color: var(--plasma-neon-teal);"><?php echo esc_html($total_successful); ?></div>
                        <div class="nova-plasma-stat__label"><?php esc_html_e('Successful', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-plasma-stat">
                        <div class="nova-plasma-stat__value" style="color: var(--plasma-pink);"><?php echo esc_html($total_failed); ?></div>
                        <div class="nova-plasma-stat__label"><?php esc_html_e('Failed', 'nova-xfinity-ai'); ?></div>
                    </div>
                </div>
                
                <div class="nova-plasma-form-row" style="margin-bottom: var(--plasma-spacing-lg);">
                    <a href="<?php echo admin_url('options-general.php?page=nova-xfinity-ai-wizard&reset_wizard=1'); ?>" class="nova-ui__button nova-ui__button--secondary">
                        <?php esc_html_e('Run Setup Wizard', 'nova-xfinity-ai'); ?>
                    </a>
                    <a href="<?php echo admin_url('options-general.php?page=nova-xfinity-ai-sync'); ?>" class="nova-ui__button nova-ui__button--secondary">
                        <?php esc_html_e('Sync & Stats', 'nova-xfinity-ai'); ?>
                    </a>
                </div>
                
                <form action="options.php" method="post" class="nova-plasma-form">
                    <?php
                    settings_fields('nova_xfinity_ai_settings_group');
                    do_settings_sections('nova-xfinity-ai-settings');
                    ?>
                    <div style="margin-top: var(--plasma-spacing-xl);">
                        <button type="submit" class="nova-ui__button nova-ui__button--primary nova-ui__button--large">
                            <?php esc_html_e('Save Settings', 'nova-xfinity-ai'); ?>
                        </button>
                    </div>
                </form>
                
                <div style="margin-top: var(--plasma-spacing-2xl);">
                    <h2 style="font-size: var(--plasma-font-size-xl); margin-bottom: var(--plasma-spacing-lg); color: var(--plasma-text-primary);">
                        <?php esc_html_e('AI Content Generation', 'nova-xfinity-ai'); ?>
                    </h2>
                    <div class="nova-ui__card nova-ui__card--elevated">
                        <div class="nova-ui__card__body">
                            <div class="nova-plasma-form">
                                <div class="nova-plasma-form-group">
                                    <label for="generation-prompt" class="nova-ui__input-label">
                                        <?php esc_html_e('Prompt', 'nova-xfinity-ai'); ?>
                                    </label>
                                    <textarea 
                                        id="generation-prompt" 
                                        name="generation-prompt" 
                                        rows="4" 
                                        class="nova-ui__input"
                                        placeholder="<?php esc_attr_e('Enter your content generation prompt here...', 'nova-xfinity-ai'); ?>"
                                        style="min-height: 120px; resize: vertical;"
                                    ></textarea>
                                </div>
                                <div class="nova-plasma-form-group">
                                    <label for="generation-provider" class="nova-ui__input-label">
                                        <?php esc_html_e('AI Provider', 'nova-xfinity-ai'); ?>
                                    </label>
                                    <select id="generation-provider" name="generation-provider" class="nova-ui__select">
                                        <option value="openai"><?php esc_html_e('OpenAI', 'nova-xfinity-ai'); ?></option>
                                        <option value="gemini"><?php esc_html_e('Gemini', 'nova-xfinity-ai'); ?></option>
                                    </select>
                                </div>
                                <div style="margin-top: var(--plasma-spacing-md);">
                                    <button type="button" class="nova-ui__button nova-ui__button--primary" id="generate-content-btn">
                                        <?php esc_html_e('Generate Content', 'nova-xfinity-ai'); ?>
                                    </button>
                                    <span id="generation-status" style="margin-left: var(--plasma-spacing-md);"></span>
                                </div>
                            </div>
                        </div>
                        <div id="generation-result" style="display: none;">
                            <div class="nova-ui__card__body">
                                <h3 style="font-size: var(--plasma-font-size-lg); margin-bottom: var(--plasma-spacing-md); color: var(--plasma-text-primary);">
                                    <?php esc_html_e('Generated Content', 'nova-xfinity-ai'); ?>
                                </h3>
                                <div id="generation-output" style="background: var(--plasma-bg-primary); padding: var(--plasma-spacing-lg); border: 2px solid var(--plasma-border-default); border-radius: var(--plasma-radius-md); max-height: 400px; overflow-y: auto; color: var(--plasma-text-secondary); line-height: 1.8;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render sync & stats page
     * 
     * Displays token usage statistics and sync controls
     */
    public function render_sync_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'nova-xfinity-ai'));
        }
        
        $usage_data = nova_xfinity_get_token_usage();
        $sync_errors = nova_xfinity_get_sync_errors();
        $settings = get_option('nova_xfinity_ai_settings', array());
        $is_sync_configured = !empty($settings['platform_api_key']) && !empty($settings['platform_user_id']);
        
        // Calculate totals
        $total_calls = 0;
        $total_successful = 0;
        $total_failed = 0;
        if ($usage_data && is_array($usage_data)) {
            foreach ($usage_data as $user_data) {
                $total_calls += isset($user_data['total_calls']) ? intval($user_data['total_calls']) : 0;
                $total_successful += isset($user_data['successful_calls']) ? intval($user_data['successful_calls']) : 0;
                $total_failed += isset($user_data['failed_calls']) ? intval($user_data['failed_calls']) : 0;
            }
        }
        ?>
        <div class="wrap nova-plasma-admin">
            <div class="nova-plasma-container">
                <div class="nova-plasma-header">
                    <h1 class="nova-plasma-header__title"><?php esc_html_e('Sync & Statistics', 'nova-xfinity-ai'); ?></h1>
                    <p class="nova-plasma-header__subtitle"><?php esc_html_e('Monitor token usage and sync data to the main dashboard', 'nova-xfinity-ai'); ?></p>
                </div>
                
                <?php if (!$is_sync_configured): ?>
                    <div class="nova-ui__card nova-ui__card--outlined" style="border-color: var(--plasma-sunburst); margin-bottom: var(--plasma-spacing-xl);">
                        <div class="nova-ui__card__body">
                            <p style="color: var(--plasma-text-primary); margin: 0;">
                                <?php esc_html_e('Platform sync is not configured. Please complete the setup wizard to enable sync.', 'nova-xfinity-ai'); ?>
                            </p>
                            <a href="<?php echo admin_url('options-general.php?page=nova-xfinity-ai-wizard&reset_wizard=1'); ?>" class="nova-ui__button nova-ui__button--primary" style="margin-top: var(--plasma-spacing-md);">
                                <?php esc_html_e('Run Setup Wizard', 'nova-xfinity-ai'); ?>
                            </a>
                        </div>
                    </div>
                <?php endif; ?>
                
                <div class="nova-plasma-stats">
                    <div class="nova-plasma-stat">
                        <div class="nova-plasma-stat__value"><?php echo esc_html($total_calls); ?></div>
                        <div class="nova-plasma-stat__label"><?php esc_html_e('Total Calls', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-plasma-stat">
                        <div class="nova-plasma-stat__value" style="color: var(--plasma-neon-teal);"><?php echo esc_html($total_successful); ?></div>
                        <div class="nova-plasma-stat__label"><?php esc_html_e('Successful', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-plasma-stat">
                        <div class="nova-plasma-stat__value" style="color: var(--plasma-pink);"><?php echo esc_html($total_failed); ?></div>
                        <div class="nova-plasma-stat__label"><?php esc_html_e('Failed', 'nova-xfinity-ai'); ?></div>
                    </div>
                </div>
                
                <?php if ($is_sync_configured): ?>
                    <div class="nova-ui__card" style="margin-bottom: var(--plasma-spacing-xl);">
                        <div class="nova-ui__card__header">
                            <h3 class="nova-ui__card__title"><?php esc_html_e('Sync Controls', 'nova-xfinity-ai'); ?></h3>
                            <p class="nova-ui__card__subtitle"><?php esc_html_e('Manually trigger sync to the main dashboard', 'nova-xfinity-ai'); ?></p>
                        </div>
                        <div class="nova-ui__card__body">
                            <div style="display: flex; gap: var(--plasma-spacing-md);">
                                <button type="button" class="nova-ui__button nova-ui__button--primary" id="sync-all-btn">
                                    <?php esc_html_e('Sync All Users', 'nova-xfinity-ai'); ?>
                                </button>
                                <button type="button" class="nova-ui__button nova-ui__button--secondary" id="sync-status-btn">
                                    <?php esc_html_e('Check Sync Status', 'nova-xfinity-ai'); ?>
                                </button>
                            </div>
                            <div id="sync-status-message" style="margin-top: var(--plasma-spacing-md);"></div>
                        </div>
                    </div>
                <?php endif; ?>
                
                <div class="nova-ui__card">
                    <div class="nova-ui__card__header">
                        <h3 class="nova-ui__card__title"><?php esc_html_e('Usage by User', 'nova-xfinity-ai'); ?></h3>
                    </div>
                    <div class="nova-ui__card__body" style="padding: 0;">
                        <?php if (empty($usage_data)): ?>
                            <div style="padding: var(--plasma-spacing-xl); text-align: center; color: var(--plasma-text-secondary);">
                                <?php esc_html_e('No usage data available yet.', 'nova-xfinity-ai'); ?>
                            </div>
                        <?php else: ?>
                            <table class="nova-plasma-table">
                                <thead>
                                    <tr>
                                        <th><?php esc_html_e('User', 'nova-xfinity-ai'); ?></th>
                                        <th><?php esc_html_e('Total Calls', 'nova-xfinity-ai'); ?></th>
                                        <th><?php esc_html_e('Successful', 'nova-xfinity-ai'); ?></th>
                                        <th><?php esc_html_e('Failed', 'nova-xfinity-ai'); ?></th>
                                        <th><?php esc_html_e('Last Synced', 'nova-xfinity-ai'); ?></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (is_array($usage_data)): 
                                        foreach ($usage_data as $user_id => $data): 
                                            $user = get_userdata($user_id);
                                            if (!is_array($data)) continue;
                                    ?>
                                        <tr>
                                            <td>
                                                <strong><?php echo esc_html($user ? $user->display_name : sprintf(__('User #%d', 'nova-xfinity-ai'), $user_id)); ?></strong><br>
                                                <small style="color: var(--plasma-text-tertiary);"><?php echo esc_html($user ? $user->user_email : ''); ?></small>
                                            </td>
                                            <td><?php echo esc_html(isset($data['total_calls']) ? $data['total_calls'] : 0); ?></td>
                                            <td><span class="nova-plasma-badge nova-plasma-badge--success"><?php echo esc_html(isset($data['successful_calls']) ? $data['successful_calls'] : 0); ?></span></td>
                                            <td><span class="nova-plasma-badge nova-plasma-badge--error"><?php echo esc_html(isset($data['failed_calls']) ? $data['failed_calls'] : 0); ?></span></td>
                                            <td>
                                                <?php if (isset($data['last_synced']) && $data['last_synced']): ?>
                                                    <?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($data['last_synced']))); ?>
                                                <?php else: ?>
                                                    <span style="color: var(--plasma-text-tertiary);"><?php esc_html_e('Never', 'nova-xfinity-ai'); ?></span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; endif; ?>
                                </tbody>
                            </table>
                        <?php endif; ?>
                    </div>
                </div>
                
                <?php if (!empty($sync_errors)): ?>
                    <div class="nova-ui__card" style="margin-top: var(--plasma-spacing-xl); border-color: var(--plasma-pink);">
                        <div class="nova-ui__card__header">
                            <h3 class="nova-ui__card__title" style="color: var(--plasma-pink);"><?php esc_html_e('Sync Errors', 'nova-xfinity-ai'); ?></h3>
                        </div>
                        <div class="nova-ui__card__body" style="padding: 0;">
                            <table class="nova-plasma-table">
                                <thead>
                                    <tr>
                                        <th><?php esc_html_e('User', 'nova-xfinity-ai'); ?></th>
                                        <th><?php esc_html_e('Error', 'nova-xfinity-ai'); ?></th>
                                        <th><?php esc_html_e('Timestamp', 'nova-xfinity-ai'); ?></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (is_array($sync_errors)): 
                                        foreach ($sync_errors as $user_id => $errors): 
                                            $user = get_userdata($user_id);
                                            if (!is_array($errors)) continue;
                                            foreach (array_slice($errors, -5) as $error): // Show last 5 errors
                                                if (!is_array($error) || !isset($error['message'])) continue;
                                    ?>
                                        <tr>
                                            <td><?php echo esc_html($user ? $user->display_name : sprintf(__('User #%d', 'nova-xfinity-ai'), $user_id)); ?></td>
                                            <td><?php echo esc_html($error['message']); ?></td>
                                            <td><?php echo esc_html(isset($error['timestamp']) ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($error['timestamp'])) : ''); ?></td>
                                        </tr>
                                    <?php endforeach; endforeach; endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * Enqueue admin scripts and styles
     * 
     * Loads CSS and JavaScript files for the admin interface
     * 
     * @param string $hook Current admin page hook
     */
    public function enqueue_scripts($hook) {
        // Load on settings page, wizard page, or sync page
        $allowed_pages = array(
            'settings_page_nova-xfinity-ai-settings',
            'settings_page_nova-xfinity-ai-wizard',
            'settings_page_nova-xfinity-ai-sync'
        );
        
        if (!in_array($hook, $allowed_pages)) {
            return;
        }
        
        // Dequeue WordPress default admin styles for our pages
        wp_dequeue_style('wp-admin');
        
        // Enqueue Plasma UI system CSS
        wp_enqueue_style(
            'nova-xfinity-ai-plasma-ui',
            NOVA_XFINITY_AI_PLUGIN_URL . 'admin/assets/plasma-ui.css',
            array(),
            NOVA_XFINITY_AI_VERSION
        );
        
        // Enqueue legacy admin CSS for backward compatibility (will be phased out)
        wp_enqueue_style(
            'nova-xfinity-ai-admin',
            NOVA_XFINITY_AI_PLUGIN_URL . 'assets/admin.css',
            array('nova-xfinity-ai-plasma-ui'),
            NOVA_XFINITY_AI_VERSION
        );
        
        // Enqueue admin JavaScript
        wp_enqueue_script(
            'nova-xfinity-ai-admin',
            NOVA_XFINITY_AI_PLUGIN_URL . 'assets/admin.js',
            array('jquery'),
            NOVA_XFINITY_AI_VERSION,
            true
        );
        
        // Enqueue React-based wizard if on wizard page
        if ('settings_page_nova-xfinity-ai-wizard' === $hook) {
            // Enqueue React and ReactDOM from CDN
            wp_enqueue_script(
                'react',
                'https://unpkg.com/react@18/umd/react.production.min.js',
                array(),
                '18.2.0',
                false
            );
            wp_enqueue_script(
                'react-dom',
                'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
                array('react'),
                '18.2.0',
                false
            );
            
            // Enqueue UI components
            wp_enqueue_script(
                'nova-ui-button',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/components/ui/Button.js',
                array('react', 'react-dom'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
            wp_enqueue_script(
                'nova-ui-input',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/components/ui/Input.js',
                array('react', 'react-dom'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
            wp_enqueue_script(
                'nova-ui-select',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/components/ui/Select.js',
                array('react', 'react-dom'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
            wp_enqueue_script(
                'nova-ui-card',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/components/ui/Card.js',
                array('react', 'react-dom'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
            wp_enqueue_script(
                'nova-ui-steps',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/components/ui/StepIndicator.js',
                array('react', 'react-dom'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
            
            // Enqueue setup wizard CSS (updated to use Plasma design)
            wp_enqueue_style(
                'nova-xfinity-ai-setup-wizard',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/assets/setup.css',
                array('nova-xfinity-ai-plasma-ui'),
                NOVA_XFINITY_AI_VERSION
            );
            
            // Enqueue setup wizard component (compiled JS version)
            wp_enqueue_script(
                'nova-xfinity-ai-setup-wizard',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/components/SetupWizard.js',
                array('react', 'react-dom', 'nova-ui-button', 'nova-ui-input', 'nova-ui-select', 'nova-ui-card', 'nova-ui-steps'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
        }
        
        // Localize script with settings and nonce
        wp_localize_script('nova-xfinity-ai-admin', 'novaXFinityAI', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'restUrl' => rest_url('nova-xfinity-ai/v1/'),
            'nonce' => wp_create_nonce('nova_xfinity_ai_nonce'),
            'restNonce' => wp_create_nonce('wp_rest'),
            'strings' => array(
                'generating' => __('Generating content...', 'nova-xfinity-ai'),
                'success' => __('Content generated successfully!', 'nova-xfinity-ai'),
                'error' => __('An error occurred. Please try again.', 'nova-xfinity-ai'),
                'testing' => __('Testing API key...', 'nova-xfinity-ai'),
                'keyValid' => __('API key is valid!', 'nova-xfinity-ai'),
                'keyInvalid' => __('API key is invalid or connection failed.', 'nova-xfinity-ai'),
            )
        ));
        
        // Localize sync page script if on sync page
        if ('settings_page_nova-xfinity-ai-sync' === $hook) {
            wp_localize_script('nova-xfinity-ai-sync-page', 'novaXFinityAI', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'restUrl' => rest_url('nova-xfinity-ai/v1/'),
                'restNonce' => wp_create_nonce('wp_rest'),
            ));
        }
        
        // Enqueue sync page JavaScript if on sync page
        if ('settings_page_nova-xfinity-ai-sync' === $hook) {
            wp_enqueue_script(
                'nova-xfinity-ai-sync-page',
                NOVA_XFINITY_AI_PLUGIN_URL . 'admin/assets/sync-page.js',
                array('jquery', 'nova-xfinity-ai-admin'),
                NOVA_XFINITY_AI_VERSION,
                true
            );
        }
        
        // Localize setup wizard script if on wizard page
        if ('settings_page_nova-xfinity-ai-wizard' === $hook) {
            wp_localize_script('nova-xfinity-ai-setup-wizard', 'novaXfinityWizard', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'restUrl' => rest_url('nova-xfinity-ai/v1/'),
                'nonce' => wp_create_nonce('nova_xfinity_ai_wizard_nonce'),
                'restNonce' => wp_create_nonce('wp_rest'),
                'logoUrl' => NOVA_XFINITY_AI_PLUGIN_URL . 'assets/nova-logo.png',
                'strings' => array(
                    'next' => __('Next', 'nova-xfinity-ai'),
                    'previous' => __('Previous', 'nova-xfinity-ai'),
                    'complete' => __('Complete Setup', 'nova-xfinity-ai'),
                    'completing' => __('Completing setup...', 'nova-xfinity-ai'),
                )
            ));
            
            // Add inline script to initialize React wizard
            wp_add_inline_script('nova-xfinity-ai-setup-wizard', '
                document.addEventListener("DOMContentLoaded", function() {
                    const container = document.getElementById("nova-xfinity-setup-wizard-container");
                    if (container && window.SetupWizard && window.React && window.ReactDOM) {
                        const root = window.ReactDOM.createRoot(container);
                        root.render(
                            window.React.createElement(window.SetupWizard, {
                                ajaxUrl: novaXfinityWizard.ajaxUrl,
                                nonce: novaXfinityWizard.nonce,
                                restUrl: novaXfinityWizard.restUrl,
                                restNonce: novaXfinityWizard.restNonce,
                                strings: novaXfinityWizard.strings
                            })
                        );
                    }
                });
            ', 'after');
        }
    }
    
    /**
     * Register REST API routes for AI content generation
     * 
     * Creates endpoints for generating content, testing API keys, and managing content
     */
    public function register_rest_routes() {
        // REST endpoint for AI content generation
        register_rest_route('nova-xfinity-ai/v1', '/generate', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_generate_content'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'prompt' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field',
                ),
                'provider' => array(
                    'required' => false,
                    'type' => 'string',
                    'enum' => array('openai', 'gemini'),
                    'default' => 'openai',
                ),
                'tone' => array(
                    'required' => false,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
                'max_words' => array(
                    'required' => false,
                    'type' => 'integer',
                    'default' => 1000,
                ),
            ),
        ));
        
        // REST endpoint for testing API keys
        register_rest_route('nova-xfinity-ai/v1', '/test-key', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_test_api_key'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'provider' => array(
                    'required' => true,
                    'type' => 'string',
                    'enum' => array('openai', 'gemini'),
                ),
                'api_key' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));
        
        // REST endpoint for publishing articles (existing)
        register_rest_route('nova-xfinity-ai/v1', '/publish', array(
            'methods' => 'POST',
            'callback' => array($this, 'publish_article'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // REST endpoint for plugin status (existing)
        register_rest_route('nova-xfinity-ai/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_status'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        // REST endpoint for validating API keys (for wizard)
        register_rest_route('nova-xfinity-ai/v1', '/validate-key', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_validate_api_key'),
            'permission_callback' => array($this, 'check_permission'),
            'args' => array(
                'provider' => array(
                    'required' => true,
                    'type' => 'string',
                    'enum' => array('openai', 'gemini', 'stability', 'anthropic'),
                ),
                'api_key' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ),
            ),
        ));
        
        // REST endpoint for syncing token usage
        register_rest_route('nova-xfinity-ai/v1', '/sync-usage', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_sync_token_usage'),
            'permission_callback' => array($this, 'check_sync_permission'),
        ));
        
        // REST endpoint for getting token usage stats
        register_rest_route('nova-xfinity-ai/v1', '/usage-stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'rest_get_usage_stats'),
            'permission_callback' => array($this, 'check_sync_permission'),
        ));
    }
    
    /**
     * Check user permission for REST endpoints
     * 
     * @return bool True if user has edit_posts capability
     */
    public function check_permission() {
        return current_user_can('edit_posts');
    }
    
    /**
     * Check user permission for sync endpoints
     * 
     * Requires manage_options capability for security
     * 
     * @return bool True if user has manage_options capability
     */
    public function check_sync_permission() {
        return current_user_can('manage_options');
    }
    
    /**
     * REST endpoint handler for AI content generation
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response|WP_Error Response with generated content or error
     */
    public function rest_generate_content($request) {
        // Get parameters
        $prompt = $request->get_param('prompt');
        $provider = $request->get_param('provider') ?: 'openai';
        $tone = $request->get_param('tone');
        $max_words = $request->get_param('max_words') ?: 1000;
        
        // Get settings
        $settings = get_option('nova_xfinity_ai_settings', array());
        
        // Use provided tone or fallback to default
        if (!$tone) {
            $tone = isset($settings['default_tone']) ? $settings['default_tone'] : 'professional';
        }
        
        // Use provided max_words or fallback to default
        if (!$max_words || $max_words < 100) {
            $max_words = isset($settings['max_word_count']) ? $settings['max_word_count'] : 1000;
        }
        
        // Get API key for selected provider
        $api_key = '';
        if ($provider === 'openai') {
            $api_key = isset($settings['openai_api_key']) ? $settings['openai_api_key'] : '';
        } elseif ($provider === 'gemini') {
            $api_key = isset($settings['gemini_api_key']) ? $settings['gemini_api_key'] : '';
        }
        
        if (empty($api_key)) {
            return new WP_Error(
                'missing_api_key',
                sprintf(__('API key for %s is not configured.', 'nova-xfinity-ai'), ucfirst($provider)),
                array('status' => 400)
            );
        }
        
        // Generate content using the appropriate provider
        $content = $this->generate_ai_content($prompt, $provider, $api_key, $tone, $max_words);
        
        // Track token usage
        $user_id = get_current_user_id();
        if (is_wp_error($content)) {
            // Track failed call
            do_action('nova_xfinity_ai_generation_result', $user_id, 'failed');
            return $content;
        }
        
        // Track successful call
        do_action('nova_xfinity_ai_generation_result', $user_id, 'success');
        
        return rest_ensure_response(array(
            'success' => true,
            'content' => $content,
            'provider' => $provider,
            'tone' => $tone,
            'word_count' => str_word_count(strip_tags($content)),
        ));
    }
    
    /**
     * AJAX handler for AI content generation
     * 
     * Handles AJAX requests from admin interface
     */
    public function ajax_generate_content() {
        // Verify nonce
        check_ajax_referer('nova_xfinity_ai_nonce', 'nonce');
        
        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'nova-xfinity-ai')));
        }
        
        // Get POST data
        $prompt = isset($_POST['prompt']) ? sanitize_textarea_field($_POST['prompt']) : '';
        $provider = isset($_POST['provider']) ? sanitize_text_field($_POST['provider']) : 'openai';
        
        if (empty($prompt)) {
            wp_send_json_error(array('message' => __('Prompt is required.', 'nova-xfinity-ai')));
        }
        
        // Get settings
        $settings = get_option('nova_xfinity_ai_settings', array());
        $tone = isset($settings['default_tone']) ? $settings['default_tone'] : 'professional';
        $max_words = isset($settings['max_word_count']) ? intval($settings['max_word_count']) : 1000;
        
        // Get API key
        $api_key = '';
        if ($provider === 'openai') {
            $api_key = isset($settings['openai_api_key']) ? $settings['openai_api_key'] : '';
        } elseif ($provider === 'gemini') {
            $api_key = isset($settings['gemini_api_key']) ? $settings['gemini_api_key'] : '';
        }
        
        if (empty($api_key)) {
            wp_send_json_error(array('message' => sprintf(__('API key for %s is not configured.', 'nova-xfinity-ai'), ucfirst($provider))));
        }
        
        // Generate content
        $content = $this->generate_ai_content($prompt, $provider, $api_key, $tone, $max_words);
        
        // Track token usage
        $user_id = get_current_user_id();
        if (is_wp_error($content)) {
            // Track failed call
            do_action('nova_xfinity_ai_generation_result', $user_id, 'failed');
            wp_send_json_error(array('message' => $content->get_error_message()));
        }
        
        // Track successful call
        do_action('nova_xfinity_ai_generation_result', $user_id, 'success');
        
        wp_send_json_success(array(
            'content' => $content,
            'word_count' => str_word_count(strip_tags($content)),
        ));
    }
    
    /**
     * Generate AI content using specified provider
     * 
     * @param string $prompt Content generation prompt
     * @param string $provider AI provider (openai or gemini)
     * @param string $api_key API key for the provider
     * @param string $tone Writing tone/style
     * @param int $max_words Maximum word count
     * @return string|WP_Error Generated content or error
     */
    private function generate_ai_content($prompt, $provider, $api_key, $tone, $max_words) {
        // Build enhanced prompt with tone and word count
        $enhanced_prompt = sprintf(
            "Write an SEO-optimized article in a %s tone. Maximum word count: %d. Topic: %s",
            esc_html($tone),
            intval($max_words),
            $prompt
        );
        
        if ($provider === 'openai') {
            return $this->generate_openai_content($enhanced_prompt, $api_key);
        } elseif ($provider === 'gemini') {
            return $this->generate_gemini_content($enhanced_prompt, $api_key);
        }
        
        return new WP_Error('invalid_provider', __('Invalid AI provider specified.', 'nova-xfinity-ai'));
    }
    
    /**
     * Generate content using OpenAI API
     * 
     * @param string $prompt Content prompt
     * @param string $api_key OpenAI API key
     * @return string|WP_Error Generated content or error
     */
    private function generate_openai_content($prompt, $api_key) {
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'model' => 'gpt-4',
                'messages' => array(
                    array(
                        'role' => 'system',
                        'content' => 'You are an expert SEO content writer. Generate well-structured, SEO-optimized articles with proper headings and formatting.',
                    ),
                    array(
                        'role' => 'user',
                        'content' => $prompt,
                    ),
                ),
                'temperature' => 0.7,
                'max_tokens' => 4000,
            )),
            'timeout' => 60,
        ));
        
        if (is_wp_error($response)) {
            return new WP_Error('api_error', $response->get_error_message());
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            return new WP_Error('api_error', $body['error']['message']);
        }
        
        if (!isset($body['choices'][0]['message']['content'])) {
            return new WP_Error('api_error', __('Unexpected API response format.', 'nova-xfinity-ai'));
        }
        
        // Extract token usage from response if available
        $tokens_used = 0;
        if (isset($body['usage']['total_tokens'])) {
            $tokens_used = intval($body['usage']['total_tokens']);
        } elseif (isset($body['usage']['prompt_tokens']) && isset($body['usage']['completion_tokens'])) {
            $tokens_used = intval($body['usage']['prompt_tokens']) + intval($body['usage']['completion_tokens']);
        }
        
        // Sync token usage to platform (async, non-blocking)
        if ($tokens_used > 0) {
            $this->sync_token_usage_to_platform('content_generation', $tokens_used, 'openai');
        }
        
        return $body['choices'][0]['message']['content'];
    }
    
    /**
     * Generate content using Google Gemini API
     * 
     * @param string $prompt Content prompt
     * @param string $api_key Gemini API key
     * @return string|WP_Error Generated content or error
     */
    private function generate_gemini_content($prompt, $api_key) {
        $response = wp_remote_post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $api_key, array(
            'headers' => array(
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'contents' => array(
                    array(
                        'parts' => array(
                            array(
                                'text' => 'You are an expert SEO content writer. Generate well-structured, SEO-optimized articles with proper headings and formatting. ' . $prompt,
                            ),
                        ),
                    ),
                ),
                'generationConfig' => array(
                    'temperature' => 0.7,
                    'maxOutputTokens' => 4000,
                ),
            )),
            'timeout' => 60,
        ));
        
        if (is_wp_error($response)) {
            return new WP_Error('api_error', $response->get_error_message());
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            return new WP_Error('api_error', $body['error']['message']);
        }
        
        if (!isset($body['candidates'][0]['content']['parts'][0]['text'])) {
            return new WP_Error('api_error', __('Unexpected API response format.', 'nova-xfinity-ai'));
        }
        
        // Extract token usage from response if available
        $tokens_used = 0;
        if (isset($body['usageMetadata']['totalTokenCount'])) {
            $tokens_used = intval($body['usageMetadata']['totalTokenCount']);
        } elseif (isset($body['usageMetadata']['promptTokenCount']) && isset($body['usageMetadata']['candidatesTokenCount'])) {
            $tokens_used = intval($body['usageMetadata']['promptTokenCount']) + intval($body['usageMetadata']['candidatesTokenCount']);
        }
        
        // Sync token usage to platform (async, non-blocking)
        if ($tokens_used > 0) {
            $this->sync_token_usage_to_platform('content_generation', $tokens_used, 'gemini');
        }
        
        return $body['candidates'][0]['content']['parts'][0]['text'];
    }
    
    /**
     * REST endpoint handler for testing API keys
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response|WP_Error Response with test result
     */
    public function rest_test_api_key($request) {
        $provider = $request->get_param('provider');
        $api_key = $request->get_param('api_key');
        
        $result = $this->test_api_key($provider, $api_key);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'valid' => true,
            'message' => __('API key is valid.', 'nova-xfinity-ai'),
        ));
    }
    
    /**
     * AJAX handler for testing API keys
     */
    public function ajax_test_api_key() {
        // Verify nonce
        check_ajax_referer('nova_xfinity_ai_nonce', 'nonce');
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'nova-xfinity-ai')));
        }
        
        $provider = isset($_POST['provider']) ? sanitize_text_field($_POST['provider']) : '';
        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        
        if (empty($provider) || empty($api_key)) {
            wp_send_json_error(array('message' => __('Provider and API key are required.', 'nova-xfinity-ai')));
        }
        
        $result = $this->test_api_key($provider, $api_key);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        wp_send_json_success(array('message' => __('API key is valid!', 'nova-xfinity-ai')));
    }
    
    /**
     * Test API key validity
     * 
     * @param string $provider AI provider (openai, gemini, stability, anthropic)
     * @param string $api_key API key to test
     * @return true|WP_Error True if valid, WP_Error if invalid
     */
    private function test_api_key($provider, $api_key) {
        if ($provider === 'openai') {
            // Test OpenAI API key with a simple request
            $response = wp_remote_get('https://api.openai.com/v1/models', array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $api_key,
                ),
                'timeout' => 10,
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', $response->get_error_message());
            }
            
            $code = wp_remote_retrieve_response_code($response);
            if ($code === 401 || $code === 403) {
                return new WP_Error('invalid_key', __('Invalid API key.', 'nova-xfinity-ai'));
            }
            
            return true;
        } elseif ($provider === 'gemini') {
            // Test Gemini API key with a simple request
            $response = wp_remote_post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $api_key, array(
                'headers' => array(
                    'Content-Type' => 'application/json',
                ),
                'body' => json_encode(array(
                    'contents' => array(
                        array(
                            'parts' => array(
                                array('text' => 'test'),
                            ),
                        ),
                    ),
                )),
                'timeout' => 10,
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', $response->get_error_message());
            }
            
            $code = wp_remote_retrieve_response_code($response);
            $body = json_decode(wp_remote_retrieve_body($response), true);
            
            if ($code === 400 && isset($body['error']) && strpos($body['error']['message'], 'API key') !== false) {
                return new WP_Error('invalid_key', __('Invalid API key.', 'nova-xfinity-ai'));
            }
            
            return true;
        } elseif ($provider === 'stability') {
            // Test Stability AI API key with a simple request
            $response = wp_remote_get('https://api.stability.ai/v1/user/account', array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $api_key,
                ),
                'timeout' => 10,
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', $response->get_error_message());
            }
            
            $code = wp_remote_retrieve_response_code($response);
            if ($code === 401 || $code === 403) {
                return new WP_Error('invalid_key', __('Invalid API key.', 'nova-xfinity-ai'));
            }
            
            return true;
        } elseif ($provider === 'anthropic') {
            // Test Anthropic Claude API key with a simple request
            $response = wp_remote_post('https://api.anthropic.com/v1/messages', array(
                'headers' => array(
                    'x-api-key' => $api_key,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ),
                'body' => json_encode(array(
                    'model' => 'claude-3-haiku-20240307',
                    'max_tokens' => 10,
                    'messages' => array(
                        array('role' => 'user', 'content' => 'test')
                    )
                )),
                'timeout' => 10,
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', $response->get_error_message());
            }
            
            $code = wp_remote_retrieve_response_code($response);
            if ($code === 401 || $code === 403) {
                return new WP_Error('invalid_key', __('Invalid API key.', 'nova-xfinity-ai'));
            }
            
            return true;
        }
        
        return new WP_Error('invalid_provider', __('Invalid provider specified.', 'nova-xfinity-ai'));
    }
    
    /**
     * Publish article to WordPress
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response|WP_Error Response with post ID or error
     */
    public function publish_article($request) {
        $params = $request->get_json_params();
        
        $post_data = array(
            'post_title'    => sanitize_text_field($params['title']),
            'post_content'  => wp_kses_post($params['content']),
            'post_status'   => 'draft',
            'post_type'     => 'post',
            'post_author'   => get_current_user_id(),
        );
        
        $post_id = wp_insert_post($post_data);
        
        if (is_wp_error($post_id)) {
            return new WP_Error('publish_failed', $post_id->get_error_message(), array('status' => 500));
        }
        
        // Add SEO meta
        if (isset($params['meta'])) {
            $meta = $params['meta'];
            
            // Yoast SEO compatibility
            if (isset($meta['focusKeyphrase'])) {
                update_post_meta($post_id, '_yoast_wpseo_focuskw', sanitize_text_field($meta['focusKeyphrase']));
            }
            if (isset($meta['metaDescription'])) {
                update_post_meta($post_id, '_yoast_wpseo_metadesc', sanitize_text_field($meta['metaDescription']));
            }
            if (isset($meta['seoTitle'])) {
                update_post_meta($post_id, '_yoast_wpseo_title', sanitize_text_field($meta['seoTitle']));
            }
        }
        
        // Upload featured image if provided
        if (isset($params['featuredImage']) && !empty($params['featuredImage'])) {
            $this->upload_featured_image($post_id, $params['featuredImage']);
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'post_id' => $post_id,
            'edit_url' => admin_url('post.php?action=edit&post=' . $post_id)
        ));
    }
    
    /**
     * Get plugin status
     * 
     * @param WP_REST_Request $request REST API request object
     * @return WP_REST_Response Plugin status information
     */
    public function get_status($request) {
        $settings = get_option('nova_xfinity_ai_settings', array());
        
        return rest_ensure_response(array(
            'success' => true,
            'version' => NOVA_XFINITY_AI_VERSION,
            'wp_version' => get_bloginfo('version'),
            'user_can_publish' => current_user_can('publish_posts'),
            'has_openai_key' => !empty($settings['openai_api_key']),
            'has_gemini_key' => !empty($settings['gemini_api_key']),
        ));
    }
    
    /**
     * Sync token usage to platform
     * 
     * Sends token usage data to the platform API with retry logic and error handling
     * Runs asynchronously to avoid blocking content generation
     * 
     * @param string $action Action type (e.g., 'content_generation', 'research', 'image_generation')
     * @param int $tokens_used Number of tokens used
     * @param string $provider AI provider (e.g., 'openai', 'gemini')
     * @param array $metadata Optional metadata
     */
    private function sync_token_usage_to_platform($action, $tokens_used, $provider = null, $metadata = array()) {
        // Get platform sync settings
        $settings = get_option('nova_xfinity_ai_settings', array());
        
        // Check if platform sync is enabled
        $platform_api_key = isset($settings['platform_api_key']) ? trim($settings['platform_api_key']) : '';
        $platform_api_url = isset($settings['platform_api_url']) ? trim($settings['platform_api_url']) : 'https://api.nova-xfinity.ai';
        $platform_user_id = isset($settings['platform_user_id']) ? trim($settings['platform_user_id']) : '';
        
        // Skip sync if required settings are missing
        if (empty($platform_api_key) || empty($platform_user_id)) {
            return; // Silent fail - don't block content generation
        }
        
        // Validate API URL
        $api_url = trailingslashit($platform_api_url) . 'api/token-usage/sync';
        if (!filter_var($api_url, FILTER_VALIDATE_URL)) {
            error_log('Nova‑XFinity AI: Invalid platform API URL: ' . $api_url);
            return;
        }
        
        // Prepare payload (minimal data transfer)
        $payload = array(
            'userId' => $platform_user_id,
            'action' => sanitize_text_field($action),
            'tokensUsed' => intval($tokens_used),
            'timestamp' => current_time('c'), // ISO 8601 format
        );
        
        // Add optional fields only if they have values
        if ($provider) {
            $payload['provider'] = sanitize_text_field($provider);
        }
        
        if (!empty($metadata)) {
            $payload['metadata'] = $metadata;
        }
        
        // Set source
        $payload['source'] = 'wordpress';
        
        // Send request with retry logic
        $this->send_token_usage_request($api_url, $platform_api_key, $payload);
    }
    
    /**
     * Send token usage request to platform with retry logic
     * 
     * Implements exponential backoff retry strategy:
     * - Initial retry after 1 second
     * - Second retry after 2 seconds
     * - Third retry after 4 seconds
     * - Max 3 retries
     * 
     * @param string $api_url Platform API endpoint URL
     * @param string $api_key Platform API key
     * @param array $payload Request payload
     * @param int $retry_count Current retry attempt (default: 0)
     */
    private function send_token_usage_request($api_url, $api_key, $payload, $retry_count = 0) {
        $max_retries = 3;
        $base_delay = 1; // Base delay in seconds
        
        // Make HTTP request
        $response = wp_remote_post($api_url, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode($payload),
            'timeout' => 10,
            'blocking' => false, // Non-blocking request
            'sslverify' => true,
        ));
        
        // Check response
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            
            // Retry on network errors or timeout
            if ($retry_count < $max_retries) {
                $delay = $base_delay * pow(2, $retry_count); // Exponential backoff
                
                // Schedule retry using wp_schedule_single_event or spawn a background process
                // For WordPress, we'll use a simple sleep mechanism with wp_schedule_single_event
                wp_schedule_single_event(
                    time() + $delay,
                    'nova_xfinity_ai_retry_token_sync',
                    array($api_url, $api_key, $payload, $retry_count + 1)
                );
                
                error_log(sprintf(
                    'Nova‑XFinity AI: Token sync failed (attempt %d/%d), retrying in %d seconds. Error: %s',
                    $retry_count + 1,
                    $max_retries,
                    $delay,
                    $error_message
                ));
            } else {
                // Max retries exceeded - log error
                error_log(sprintf(
                    'Nova‑XFinity AI: Token sync failed after %d attempts. Final error: %s',
                    $max_retries,
                    $error_message
                ));
            }
            return;
        }
        
        // Get response code
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        // Check for success (2xx status codes)
        if ($response_code >= 200 && $response_code < 300) {
            // Success - optionally log
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Nova‑XFinity AI: Token usage synced successfully. Tokens: ' . $payload['tokensUsed']);
            }
            return;
        }
        
        // Handle error responses
        $error_data = json_decode($response_body, true);
        $error_message = isset($error_data['error']['message']) 
            ? $error_data['error']['message'] 
            : 'Unknown error';
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if ($response_code >= 400 && $response_code < 500 && $response_code !== 429) {
            error_log(sprintf(
                'Nova‑XFinity AI: Token sync failed with client error (%d): %s',
                $response_code,
                $error_message
            ));
            return;
        }
        
        // Retry on server errors (5xx) or rate limits (429)
        if (($response_code >= 500 || $response_code === 429) && $retry_count < $max_retries) {
            $delay = $base_delay * pow(2, $retry_count);
            
            // For rate limits, use longer delay
            if ($response_code === 429) {
                $delay = max($delay, 5); // Minimum 5 seconds for rate limits
            }
            
            wp_schedule_single_event(
                time() + $delay,
                'nova_xfinity_ai_retry_token_sync',
                array($api_url, $api_key, $payload, $retry_count + 1)
            );
            
            error_log(sprintf(
                'Nova‑XFinity AI: Token sync failed with server error (%d), retrying in %d seconds. Error: %s',
                $response_code,
                $delay,
                $error_message
            ));
        } else {
            // Max retries exceeded or non-retryable error
            error_log(sprintf(
                'Nova‑XFinity AI: Token sync failed after %d attempts. Status: %d, Error: %s',
                $retry_count + 1,
                $response_code,
                $error_message
            ));
        }
    }
    
    /**
     * AJAX handler for saving wizard step
     */
    public function ajax_wizard_save_step() {
        // Verify nonce
        check_ajax_referer('nova_xfinity_ai_wizard_nonce', 'nonce');
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'nova-xfinity-ai')));
        }
        
        $step = isset($_POST['step']) ? intval($_POST['step']) : 0;
        $data = isset($_POST['data']) ? $_POST['data'] : array();
        
        if ($step < 1 || $step > 3) {
            wp_send_json_error(array('message' => __('Invalid step.', 'nova-xfinity-ai')));
        }
        
        // Get current settings
        $settings = get_option('nova_xfinity_ai_settings', array());
        
        // Update settings based on step
        if ($step === 1) {
            // Step 1: API Keys
            if (isset($data['openai_api_key'])) {
                $settings['openai_api_key'] = sanitize_text_field(trim($data['openai_api_key']));
            }
            if (isset($data['gemini_api_key'])) {
                $settings['gemini_api_key'] = sanitize_text_field(trim($data['gemini_api_key']));
            }
        } elseif ($step === 2) {
            // Step 2: Platform Sync
            if (isset($data['platform_api_url'])) {
                $settings['platform_api_url'] = esc_url_raw(trim($data['platform_api_url']));
            }
            if (isset($data['platform_api_key'])) {
                $settings['platform_api_key'] = sanitize_text_field(trim($data['platform_api_key']));
            }
            if (isset($data['platform_user_id'])) {
                $settings['platform_user_id'] = sanitize_text_field(trim($data['platform_user_id']));
            }
        } elseif ($step === 3) {
            // Step 3: Defaults
            if (isset($data['default_tone'])) {
                $allowed_tones = array('professional', 'casual', 'friendly', 'formal', 'conversational', 'technical');
                $settings['default_tone'] = in_array($data['default_tone'], $allowed_tones) 
                    ? sanitize_text_field($data['default_tone']) 
                    : 'professional';
            }
            if (isset($data['max_word_count'])) {
                $word_count = intval($data['max_word_count']);
                $settings['max_word_count'] = ($word_count > 0) ? $word_count : 1000;
            }
        }
        
        // Save settings
        update_option('nova_xfinity_ai_settings', $settings);
        
        wp_send_json_success(array('message' => __('Settings saved successfully.', 'nova-xfinity-ai')));
    }
    
    /**
     * AJAX handler for testing platform API key
     */
    public function ajax_wizard_test_platform() {
        // Verify nonce
        check_ajax_referer('nova_xfinity_ai_wizard_nonce', 'nonce');
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'nova-xfinity-ai')));
        }
        
        $platform_url = isset($_POST['platform_url']) ? esc_url_raw(trim($_POST['platform_url'])) : '';
        $platform_key = isset($_POST['platform_key']) ? sanitize_text_field(trim($_POST['platform_key'])) : '';
        $user_id = isset($_POST['user_id']) ? sanitize_text_field(trim($_POST['user_id'])) : '';
        
        if (empty($platform_url) || empty($platform_key) || empty($user_id)) {
            wp_send_json_error(array('message' => __('Platform URL, API key, and User ID are required.', 'nova-xfinity-ai')));
        }
        
        // Test platform connection by making a request to the status endpoint
        $api_url = trailingslashit($platform_url) . 'api/token-usage/stats';
        
        $response = wp_remote_get($api_url, array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $platform_key,
                'Content-Type' => 'application/json',
            ),
            'timeout' => 10,
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => $response->get_error_message()));
        }
        
        $code = wp_remote_retrieve_response_code($response);
        
        if ($code === 200) {
            wp_send_json_success(array('message' => __('Platform connection verified successfully!', 'nova-xfinity-ai')));
        } elseif ($code === 401 || $code === 403) {
            wp_send_json_error(array('message' => __('Invalid API key or unauthorized access.', 'nova-xfinity-ai')));
        } else {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            $error_message = isset($body['error']['message']) ? $body['error']['message'] : __('Connection failed.', 'nova-xfinity-ai');
            wp_send_json_error(array('message' => $error_message));
        }
    }
    
    /**
     * AJAX handler for completing wizard
     */
    public function ajax_wizard_complete() {
        // Verify nonce
        check_ajax_referer('nova_xfinity_ai_wizard_nonce', 'nonce');
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'nova-xfinity-ai')));
        }
        
        // Get form data from POST
        $settings = get_option('nova_xfinity_ai_settings', array());
        
        // Update settings from POST data
        if (isset($_POST['apiKey'])) {
            $provider = isset($_POST['provider']) ? sanitize_text_field($_POST['provider']) : 'openai';
            if ($provider === 'openai') {
                $settings['openai_api_key'] = sanitize_text_field(trim($_POST['apiKey']));
            } elseif ($provider === 'gemini') {
                $settings['gemini_api_key'] = sanitize_text_field(trim($_POST['apiKey']));
            } else {
                $settings['api_key'] = sanitize_text_field(trim($_POST['apiKey']));
            }
        }
        
        if (isset($_POST['provider'])) {
            $settings['provider'] = sanitize_text_field($_POST['provider']);
        }
        
        if (isset($_POST['tokenQuota'])) {
            $settings['token_quota'] = intval($_POST['tokenQuota']);
        }
        
        // Save settings
        update_option('nova_xfinity_ai_settings', $settings);
        
        // Mark wizard as completed
        update_option('nova_xfinity_ai_wizard_completed', true);
        
        wp_send_json_success(array(
            'message' => __('Setup completed successfully!', 'nova-xfinity-ai'),
            'redirect_url' => admin_url('options-general.php?page=nova-xfinity-ai-settings')
        ));
    }
    
    /**
     * AJAX handler for resetting wizard
     */
    public function ajax_wizard_reset() {
        // Verify nonce
        check_ajax_referer('nova_xfinity_ai_wizard_nonce', 'nonce');
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'nova-xfinity-ai')));
        }
        
        // Reset wizard completion flag
        delete_option('nova_xfinity_ai_wizard_completed');
        
        wp_send_json_success(array(
            'message' => __('Wizard reset successfully.', 'nova-xfinity-ai'),
            'redirect_url' => admin_url('options-general.php?page=nova-xfinity-ai-wizard')
        ));
    }
    
    /**
     * Upload featured image for post
     * 
     * @param int $post_id WordPress post ID
     * @param string $image_data Base64 image data or URL
     */
    private function upload_featured_image($post_id, $image_data) {
        // Handle base64 image or URL
        // Implementation depends on image format
        // TODO: Implement image upload functionality
    }
}

// Initialize plugin
Nova_XFinity_AI_SEO_Writer::get_instance();

/**
 * Activation hook
 * 
 * Sets default options when plugin is activated
 * Marks wizard as not completed so it runs on first activation
 */
register_activation_hook(__FILE__, 'nova_xfinity_ai_activation_hook');
