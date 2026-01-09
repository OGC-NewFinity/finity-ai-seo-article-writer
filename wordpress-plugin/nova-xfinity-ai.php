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
            __('API Configuration', 'nova-xfinity-ai'), // Section title
            array($this, 'render_api_section'),   // Callback function
            'nova-xfinity-ai-settings'                  // Page slug
        );
        
        // Add settings section for content defaults
        add_settings_section(
            'nova_xfinity_ai_content_section',          // Section ID
            __('Content Defaults', 'nova-xfinity-ai'),  // Section title
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
            __('Platform Sync', 'nova-xfinity-ai'),    // Section title
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
        echo '<p>' . esc_html__('Configure API keys for AI providers. These keys will be used for content generation.', 'nova-xfinity-ai') . '</p>';
    }
    
    /**
     * Render content section description
     */
    public function render_content_section() {
        echo '<p>' . esc_html__('Set default values for content generation. These can be overridden when generating content.', 'nova-xfinity-ai') . '</p>';
    }
    
    /**
     * Render OpenAI API Key field
     */
    public function render_openai_api_key_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['openai_api_key']) ? esc_attr($settings['openai_api_key']) : '';
        ?>
        <input 
            type="password" 
            id="openai_api_key" 
            name="nova_xfinity_ai_settings[openai_api_key]" 
            value="<?php echo $value; ?>" 
            class="regular-text"
            placeholder="sk-..."
        />
        <button type="button" class="button" id="test-openai-key" style="margin-left: 10px;">
            <?php esc_html_e('Test Key', 'nova-xfinity-ai'); ?>
        </button>
        <p class="description">
            <?php esc_html_e('Enter your OpenAI API key. Keep this secure and never share it publicly.', 'nova-xfinity-ai'); ?>
        </p>
        <?php
    }
    
    /**
     * Render Gemini API Key field
     */
    public function render_gemini_api_key_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['gemini_api_key']) ? esc_attr($settings['gemini_api_key']) : '';
        ?>
        <input 
            type="password" 
            id="gemini_api_key" 
            name="nova_xfinity_ai_settings[gemini_api_key]" 
            value="<?php echo $value; ?>" 
            class="regular-text"
            placeholder="AIza..."
        />
        <button type="button" class="button" id="test-gemini-key" style="margin-left: 10px;">
            <?php esc_html_e('Test Key', 'nova-xfinity-ai'); ?>
        </button>
        <p class="description">
            <?php esc_html_e('Enter your Google Gemini API key. Keep this secure and never share it publicly.', 'nova-xfinity-ai'); ?>
        </p>
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
        <select id="default_tone" name="nova_xfinity_ai_settings[default_tone]" class="regular-text">
            <?php foreach ($tones as $key => $label) : ?>
                <option value="<?php echo esc_attr($key); ?>" <?php selected($value, $key); ?>>
                    <?php echo esc_html($label); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <p class="description">
            <?php esc_html_e('Default writing tone/style for generated content.', 'nova-xfinity-ai'); ?>
        </p>
        <?php
    }
    
    /**
     * Render Max Word Count field
     */
    public function render_max_word_count_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['max_word_count']) ? intval($settings['max_word_count']) : 1000;
        ?>
        <input 
            type="number" 
            id="max_word_count" 
            name="nova_xfinity_ai_settings[max_word_count]" 
            value="<?php echo esc_attr($value); ?>" 
            class="small-text"
            min="100"
            max="10000"
            step="100"
        />
        <p class="description">
            <?php esc_html_e('Maximum word count for generated articles. Default: 1000 words.', 'nova-xfinity-ai'); ?>
        </p>
        <?php
    }
    
    /**
     * Render platform section description
     */
    public function render_platform_section() {
        echo '<p>' . esc_html__('Configure platform sync settings to synchronize token usage with the main platform.', 'nova-xfinity-ai') . '</p>';
    }
    
    /**
     * Render Platform API Key field
     */
    public function render_platform_api_key_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['platform_api_key']) ? esc_attr($settings['platform_api_key']) : '';
        ?>
        <input 
            type="password" 
            id="platform_api_key" 
            name="nova_xfinity_ai_settings[platform_api_key]" 
            value="<?php echo $value; ?>" 
            class="regular-text"
            placeholder="nova_xfinity_..."
        />
        <p class="description">
            <?php esc_html_e('API key for authenticating with the platform. Get this from your platform account settings.', 'nova-xfinity-ai'); ?>
        </p>
        <?php
    }
    
    /**
     * Render Platform API URL field
     */
    public function render_platform_api_url_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
            $value = isset($settings['platform_api_url']) ? esc_attr($settings['platform_api_url']) : 'https://api.nova-xfinity.ai';
        ?>
        <input 
            type="url" 
            id="platform_api_url" 
            name="nova_xfinity_ai_settings[platform_api_url]" 
            value="<?php echo $value; ?>" 
            class="regular-text"
            placeholder="https://api.nova-xfinity.ai"
        />
        <p class="description">
            <?php esc_html_e('Base URL of the platform API. Default: https://api.nova-xfinity.ai', 'nova-xfinity-ai'); ?>
        </p>
        <?php
    }
    
    /**
     * Render Platform User ID field
     */
    public function render_platform_user_id_field() {
        $settings = get_option('nova_xfinity_ai_settings', array());
        $value = isset($settings['platform_user_id']) ? esc_attr($settings['platform_user_id']) : '';
        ?>
        <input 
            type="text" 
            id="platform_user_id" 
            name="nova_xfinity_ai_settings[platform_user_id]" 
            value="<?php echo $value; ?>" 
            class="regular-text"
            placeholder="user-uuid-here"
        />
        <p class="description">
            <?php esc_html_e('Your user ID on the platform. This is required for token usage synchronization.', 'nova-xfinity-ai'); ?>
        </p>
        <?php
    }
    
    /**
     * Render wizard page
     * 
     * Displays the multi-step setup wizard
     */
    public function render_wizard_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'nova-xfinity-ai'));
        }
        
        // Get current settings if any
        $settings = get_option('nova_xfinity_ai_settings', array());
        ?>
        <div class="wrap nova-xfinity-wizard-container">
            <div class="nova-xfinity-wizard-header">
                <img 
                    src="<?php echo esc_url(NOVA_XFINITY_AI_PLUGIN_URL . 'assets/nova-logo.png'); ?>" 
                    alt="Nova‑XFinity AI Logo" 
                    style="width: 64px; height: 64px; margin: 0 auto 20px; display: block;"
                />
                <h1><?php esc_html_e('Welcome to Nova‑XFinity AI SEO Writer', 'nova-xfinity-ai'); ?></h1>
                <p class="description"><?php esc_html_e('Let\'s get you set up in just a few steps.', 'nova-xfinity-ai'); ?></p>
            </div>
            
            <!-- Progress Indicator -->
            <div class="nova-xfinity-wizard-progress">
                <div class="nova-xfinity-wizard-steps">
                    <div class="nova-xfinity-wizard-step" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-label"><?php esc_html_e('API Keys', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-xfinity-wizard-step" data-step="2">
                        <div class="step-number">2</div>
                        <div class="step-label"><?php esc_html_e('Platform Sync', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-xfinity-wizard-step" data-step="3">
                        <div class="step-number">3</div>
                        <div class="step-label"><?php esc_html_e('Defaults', 'nova-xfinity-ai'); ?></div>
                    </div>
                    <div class="nova-xfinity-wizard-step" data-step="4">
                        <div class="step-number">4</div>
                        <div class="step-label"><?php esc_html_e('Complete', 'nova-xfinity-ai'); ?></div>
                    </div>
                </div>
            </div>
            
            <!-- Wizard Steps -->
            <form id="nova-xfinity-wizard-form" class="nova-xfinity-wizard-form">
                <!-- Step 1: API Key & Provider Setup -->
                <div class="nova-xfinity-wizard-step-content" data-step="1">
                    <h2><?php esc_html_e('Step 1: API Key & Provider Setup', 'nova-xfinity-ai'); ?></h2>
                    <p class="description"><?php esc_html_e('Configure your AI provider API keys. At least one provider is required.', 'nova-xfinity-ai'); ?></p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="wizard-openai-key"><?php esc_html_e('OpenAI API Key', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <input 
                                    type="password" 
                                    id="wizard-openai-key" 
                                    name="openai_api_key" 
                                    value="<?php echo isset($settings['openai_api_key']) ? esc_attr($settings['openai_api_key']) : ''; ?>" 
                                    class="regular-text"
                                    placeholder="sk-..."
                                />
                                <button type="button" class="button test-api-key" data-provider="openai">
                                    <?php esc_html_e('Test', 'nova-xfinity-ai'); ?>
                                </button>
                                <span class="test-status" data-provider="openai"></span>
                                <p class="description">
                                    <?php esc_html_e('Enter your OpenAI API key. Get one at', 'nova-xfinity-ai'); ?> 
                                    <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="wizard-gemini-key"><?php esc_html_e('Gemini API Key', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <input 
                                    type="password" 
                                    id="wizard-gemini-key" 
                                    name="gemini_api_key" 
                                    value="<?php echo isset($settings['gemini_api_key']) ? esc_attr($settings['gemini_api_key']) : ''; ?>" 
                                    class="regular-text"
                                    placeholder="AIza..."
                                />
                                <button type="button" class="button test-api-key" data-provider="gemini">
                                    <?php esc_html_e('Test', 'nova-xfinity-ai'); ?>
                                </button>
                                <span class="test-status" data-provider="gemini"></span>
                                <p class="description">
                                    <?php esc_html_e('Enter your Google Gemini API key. Get one at', 'nova-xfinity-ai'); ?> 
                                    <a href="https://makersuite.google.com/app/apikey" target="_blank">makersuite.google.com</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="wizard-step-validation" data-step="1">
                        <p class="error-message" style="display: none; color: #dc3232;">
                            <?php esc_html_e('Please configure at least one API key.', 'nova-xfinity-ai'); ?>
                        </p>
                    </div>
                </div>
                
                <!-- Step 2: Platform Sync Setup -->
                <div class="nova-xfinity-wizard-step-content" data-step="2" style="display: none;">
                    <h2><?php esc_html_e('Step 2: Platform Sync Setup', 'nova-xfinity-ai'); ?></h2>
                    <p class="description"><?php esc_html_e('Connect to the Nova‑XFinity AI platform to sync token usage and access advanced features.', 'nova-xfinity-ai'); ?></p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="wizard-platform-url"><?php esc_html_e('Platform API URL', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <input 
                                    type="url" 
                                    id="wizard-platform-url" 
                                    name="platform_api_url" 
                                    value="<?php echo isset($settings['platform_api_url']) ? esc_attr($settings['platform_api_url']) : 'https://api.nova-xfinity.ai'; ?>" 
                                    class="regular-text"
                                    placeholder="https://api.nova-xfinity.ai"
                                />
                                <p class="description">
                                    <?php esc_html_e('Base URL of the platform API. Default: https://api.nova-xfinity.ai', 'nova-xfinity-ai'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="wizard-platform-key"><?php esc_html_e('Platform API Key', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <input 
                                    type="password" 
                                    id="wizard-platform-key" 
                                    name="platform_api_key" 
                                    value="<?php echo isset($settings['platform_api_key']) ? esc_attr($settings['platform_api_key']) : ''; ?>" 
                                    class="regular-text"
                                    placeholder="nova_xfinity_..."
                                />
                                <button type="button" class="button test-platform-key">
                                    <?php esc_html_e('Verify', 'nova-xfinity-ai'); ?>
                                </button>
                                <span class="test-status" data-provider="platform"></span>
                                <p class="description">
                                    <?php esc_html_e('Get your API key from your Nova‑XFinity AI account settings.', 'nova-xfinity-ai'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="wizard-platform-user-id"><?php esc_html_e('Platform User ID', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <input 
                                    type="text" 
                                    id="wizard-platform-user-id" 
                                    name="platform_user_id" 
                                    value="<?php echo isset($settings['platform_user_id']) ? esc_attr($settings['platform_user_id']) : ''; ?>" 
                                    class="regular-text"
                                    placeholder="user-uuid-here"
                                />
                                <p class="description">
                                    <?php esc_html_e('Your user ID on the platform. Find this in your account settings.', 'nova-xfinity-ai'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="notice notice-info inline">
                        <p><?php esc_html_e('Platform sync is optional. You can skip this step and configure it later in settings.', 'nova-xfinity-ai'); ?></p>
                    </div>
                </div>
                
                <!-- Step 3: Generation Defaults -->
                <div class="nova-xfinity-wizard-step-content" data-step="3" style="display: none;">
                    <h2><?php esc_html_e('Step 3: Generation Defaults', 'nova-xfinity-ai'); ?></h2>
                    <p class="description"><?php esc_html_e('Set default values for content generation. These can be changed later in settings.', 'nova-xfinity-ai'); ?></p>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="wizard-default-tone"><?php esc_html_e('Default Tone/Style', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <select id="wizard-default-tone" name="default_tone" class="regular-text">
                                    <option value="professional" <?php selected(isset($settings['default_tone']) ? $settings['default_tone'] : 'professional', 'professional'); ?>>
                                        <?php esc_html_e('Professional', 'nova-xfinity-ai'); ?>
                                    </option>
                                    <option value="casual" <?php selected(isset($settings['default_tone']) ? $settings['default_tone'] : '', 'casual'); ?>>
                                        <?php esc_html_e('Casual', 'nova-xfinity-ai'); ?>
                                    </option>
                                    <option value="friendly" <?php selected(isset($settings['default_tone']) ? $settings['default_tone'] : '', 'friendly'); ?>>
                                        <?php esc_html_e('Friendly', 'nova-xfinity-ai'); ?>
                                    </option>
                                    <option value="formal" <?php selected(isset($settings['default_tone']) ? $settings['default_tone'] : '', 'formal'); ?>>
                                        <?php esc_html_e('Formal', 'nova-xfinity-ai'); ?>
                                    </option>
                                    <option value="conversational" <?php selected(isset($settings['default_tone']) ? $settings['default_tone'] : '', 'conversational'); ?>>
                                        <?php esc_html_e('Conversational', 'nova-xfinity-ai'); ?>
                                    </option>
                                    <option value="technical" <?php selected(isset($settings['default_tone']) ? $settings['default_tone'] : '', 'technical'); ?>>
                                        <?php esc_html_e('Technical', 'nova-xfinity-ai'); ?>
                                    </option>
                                </select>
                                <p class="description">
                                    <?php esc_html_e('Default writing tone/style for generated content.', 'nova-xfinity-ai'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="wizard-max-words"><?php esc_html_e('Max Word Count', 'nova-xfinity-ai'); ?></label>
                            </th>
                            <td>
                                <input 
                                    type="number" 
                                    id="wizard-max-words" 
                                    name="max_word_count" 
                                    value="<?php echo isset($settings['max_word_count']) ? intval($settings['max_word_count']) : 1000; ?>" 
                                    class="small-text"
                                    min="100"
                                    max="10000"
                                    step="100"
                                />
                                <p class="description">
                                    <?php esc_html_e('Maximum word count for generated articles. Default: 1000 words.', 'nova-xfinity-ai'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- Step 4: Complete -->
                <div class="nova-xfinity-wizard-step-content" data-step="4" style="display: none;">
                    <div class="nova-xfinity-wizard-complete">
                        <div class="complete-icon">✓</div>
                        <h2><?php esc_html_e('Setup Complete!', 'nova-xfinity-ai'); ?></h2>
                        <p><?php esc_html_e('Your Nova‑XFinity AI SEO Writer plugin is now configured and ready to use.', 'nova-xfinity-ai'); ?></p>
                        <p>
                            <a href="<?php echo admin_url('options-general.php?page=nova-xfinity-ai-settings'); ?>" class="button button-primary button-large">
                                <?php esc_html_e('Go to Settings', 'nova-xfinity-ai'); ?>
                            </a>
                            <a href="<?php echo admin_url('options-general.php?page=nova-xfinity-ai-settings'); ?>" class="button button-large">
                                <?php esc_html_e('Start Using Plugin', 'nova-xfinity-ai'); ?>
                            </a>
                        </p>
                    </div>
                </div>
                
                <!-- Navigation Buttons -->
                <div class="nova-xfinity-wizard-navigation">
                    <button type="button" class="button button-secondary wizard-prev" style="display: none;">
                        <?php esc_html_e('Previous', 'nova-xfinity-ai'); ?>
                    </button>
                    <div class="wizard-nav-right">
                        <button type="button" class="button button-secondary wizard-skip" data-step="2">
                            <?php esc_html_e('Skip', 'nova-xfinity-ai'); ?>
                        </button>
                        <button type="button" class="button button-primary wizard-next">
                            <?php esc_html_e('Next', 'nova-xfinity-ai'); ?>
                        </button>
                        <button type="button" class="button button-primary wizard-save" style="display: none;">
                            <?php esc_html_e('Save & Continue', 'nova-xfinity-ai'); ?>
                        </button>
                        <button type="button" class="button button-primary wizard-complete" style="display: none;">
                            <?php esc_html_e('Complete Setup', 'nova-xfinity-ai'); ?>
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <?php
    }
    
    /**
     * Render admin settings page
     * 
     * Displays the settings form with all configuration options
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
        
        // Display any settings errors
        settings_errors('nova_xfinity_ai_messages');
        ?>
        <div class="wrap">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                <img 
                    src="<?php echo esc_url(NOVA_XFINITY_AI_PLUGIN_URL . 'assets/nova-logo.png'); ?>" 
                    alt="Nova‑XFinity AI Logo" 
                    style="width: 48px; height: 48px;"
                />
                <h1 style="margin: 0;"><?php echo esc_html(get_admin_page_title()); ?></h1>
            </div>
            
            <p>
                <a href="<?php echo admin_url('options-general.php?page=nova-xfinity-ai-wizard&reset_wizard=1'); ?>" class="button button-secondary">
                    <?php esc_html_e('Run Setup Wizard Again', 'nova-xfinity-ai'); ?>
                </a>
            </p>
            
            <form action="options.php" method="post">
                <?php
                // Output nonce, action, and option_page fields
                settings_fields('nova_xfinity_ai_settings_group');
                
                // Output settings sections and their fields
                do_settings_sections('nova-xfinity-ai-settings');
                
                // Output save settings button
                submit_button(__('Save Settings', 'nova-xfinity-ai'));
                ?>
            </form>
            
            <hr style="margin: 30px 0;" />
            
            <h2><?php esc_html_e('AI Content Generation', 'nova-xfinity-ai'); ?></h2>
            <div id="nova-xfinity-ai-generator">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="generation-prompt"><?php esc_html_e('Prompt', 'nova-xfinity-ai'); ?></label>
                        </th>
                        <td>
                            <textarea 
                                id="generation-prompt" 
                                name="generation-prompt" 
                                rows="4" 
                                class="large-text"
                                placeholder="<?php esc_attr_e('Enter your content generation prompt here...', 'nova-xfinity-ai'); ?>"
                            ></textarea>
                            <p class="description">
                                <?php esc_html_e('Describe the content you want to generate.', 'nova-xfinity-ai'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="generation-provider"><?php esc_html_e('AI Provider', 'nova-xfinity-ai'); ?></label>
                        </th>
                        <td>
                            <select id="generation-provider" name="generation-provider" class="regular-text">
                                <option value="openai"><?php esc_html_e('OpenAI', 'nova-xfinity-ai'); ?></option>
                                <option value="gemini"><?php esc_html_e('Gemini', 'nova-xfinity-ai'); ?></option>
                            </select>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <button type="button" class="button button-primary" id="generate-content-btn">
                        <?php esc_html_e('Generate Content', 'nova-xfinity-ai'); ?>
                    </button>
                    <span id="generation-status" style="margin-left: 10px;"></span>
                </p>
                <div id="generation-result" style="margin-top: 20px; display: none;">
                    <h3><?php esc_html_e('Generated Content', 'nova-xfinity-ai'); ?></h3>
                    <div id="generation-output" style="background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 4px; max-height: 400px; overflow-y: auto;"></div>
                </div>
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
        // Load on settings page or wizard page
        if ('settings_page_nova-xfinity-ai-settings' !== $hook && 'settings_page_nova-xfinity-ai-wizard' !== $hook) {
            return;
        }
        
        // Enqueue admin CSS
        wp_enqueue_style(
            'nova-xfinity-ai-admin',
            NOVA_XFINITY_AI_PLUGIN_URL . 'assets/admin.css',
            array(),
            NOVA_XFINITY_AI_VERSION
        );
        
        // Enqueue wizard CSS if on wizard page
        if ('settings_page_nova-xfinity-ai-wizard' === $hook) {
            wp_enqueue_style(
                'nova-xfinity-ai-wizard',
                NOVA_XFINITY_AI_PLUGIN_URL . 'assets/wizard.css',
                array('nova-xfinity-ai-admin'),
                NOVA_XFINITY_AI_VERSION
            );
        }
        
        // Enqueue admin JavaScript
        wp_enqueue_script(
            'nova-xfinity-ai-admin',
            NOVA_XFINITY_AI_PLUGIN_URL . 'assets/admin.js',
            array('jquery'),
            NOVA_XFINITY_AI_VERSION,
            true
        );
        
        // Enqueue wizard JavaScript if on wizard page
        if ('settings_page_nova-xfinity-ai-wizard' === $hook) {
            wp_enqueue_script(
                'nova-xfinity-ai-wizard',
                NOVA_XFINITY_AI_PLUGIN_URL . 'assets/wizard.js',
                array('jquery', 'nova-xfinity-ai-admin'),
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
        
        // Localize wizard script if on wizard page
        if ('settings_page_nova-xfinity-ai-wizard' === $hook) {
            wp_localize_script('nova-xfinity-ai-wizard', 'novaXFinityWizard', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('nova_xfinity_ai_wizard_nonce'),
                'strings' => array(
                    'next' => __('Next', 'nova-xfinity-ai'),
                    'previous' => __('Previous', 'nova-xfinity-ai'),
                    'skip' => __('Skip', 'nova-xfinity-ai'),
                    'save' => __('Save & Continue', 'nova-xfinity-ai'),
                    'testing' => __('Testing...', 'nova-xfinity-ai'),
                    'verifying' => __('Verifying...', 'nova-xfinity-ai'),
                    'valid' => __('Valid!', 'nova-xfinity-ai'),
                    'invalid' => __('Invalid', 'nova-xfinity-ai'),
                    'required' => __('This field is required', 'nova-xfinity-ai'),
                    'completing' => __('Completing setup...', 'nova-xfinity-ai'),
                )
            ));
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
        
        if (is_wp_error($content)) {
            return $content;
        }
        
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
        
        if (is_wp_error($content)) {
            wp_send_json_error(array('message' => $content->get_error_message()));
        }
        
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
     * @param string $provider AI provider (openai or gemini)
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
register_activation_hook(__FILE__, function() {
    // Set default settings if they don't exist
    $default_settings = array(
        'default_tone' => 'professional',
        'max_word_count' => 1000,
        'platform_api_url' => 'https://api.nova-xfinity.ai',
    );
    
    add_option('nova_xfinity_ai_settings', $default_settings);
    add_option('nova_xfinity_ai_app_url', 'http://localhost:3000');
    
    // Mark wizard as not completed so it runs on activation
    delete_option('nova_xfinity_ai_wizard_completed');
    
    // Set transient to trigger wizard redirect
    set_transient('nova_xfinity_ai_activation_redirect', true, 30);
});
