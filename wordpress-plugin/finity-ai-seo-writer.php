<?php
/**
 * Plugin Name: Nova‑XFinity AI Article Writer
 * Plugin URI: https://finity.ai
 * Description: AI-powered SEO-optimized article generation for WordPress with multi-provider support, media generation, and research intelligence.
 * Version: 1.0.0
 * Author: Nova‑XFinity AI
 * Author URI: https://finity.ai
 * License: MIT
 * Text Domain: finity-ai
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('FINITY_AI_VERSION', '1.0.0');
define('FINITY_AI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FINITY_AI_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main Plugin Class
 */
class Finity_AI_SEO_Writer {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            'Nova‑XFinity AI Writer',
            'Nova‑XFinity AI',
            'edit_posts',
            'finity-ai-writer',
            array($this, 'render_admin_page'),
            'dashicons-edit',
            30
        );
    }
    
    /**
     * Render admin page
     */
    public function render_admin_page() {
        $app_url = get_option('finity_ai_app_url', 'http://localhost:3000');
        ?>
        <div class="wrap">
            <h1>Nova‑XFinity AI Article Writer</h1>
            <div style="margin-top: 20px;">
                <iframe 
                    src="<?php echo esc_url($app_url); ?>" 
                    style="width: 100%; height: calc(100vh - 200px); border: 1px solid #ddd; border-radius: 8px;"
                    frameborder="0"
                    id="finity-ai-iframe"
                ></iframe>
            </div>
        </div>
        <script>
            // Handle messages from iframe
            window.addEventListener('message', function(event) {
                if (event.origin !== '<?php echo esc_js($app_url); ?>') return;
                
                if (event.data.type === 'finity-publish') {
                    // Handle article publishing
                    fetch('<?php echo rest_url('finity-ai/v1/publish'); ?>', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                        },
                        body: JSON.stringify(event.data.payload)
                    })
                    .then(response => response.json())
                    .then(data => {
                        window.postMessage({
                            type: 'finity-publish-success',
                            data: data
                        }, '<?php echo esc_js($app_url); ?>');
                    })
                    .catch(error => {
                        window.postMessage({
                            type: 'finity-publish-error',
                            error: error.message
                        }, '<?php echo esc_js($app_url); ?>');
                    });
                }
            });
        </script>
        <?php
    }
    
    /**
     * Enqueue scripts
     */
    public function enqueue_scripts($hook) {
        if ('toplevel_page_finity-ai-writer' !== $hook) {
            return;
        }
        
        wp_enqueue_style('finity-ai-admin', FINITY_AI_PLUGIN_URL . 'assets/admin.css', array(), FINITY_AI_VERSION);
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('finity-ai/v1', '/publish', array(
            'methods' => 'POST',
            'callback' => array($this, 'publish_article'),
            'permission_callback' => array($this, 'check_permission'),
        ));
        
        register_rest_route('finity-ai/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_status'),
            'permission_callback' => array($this, 'check_permission'),
        ));
    }
    
    /**
     * Check user permission
     */
    public function check_permission() {
        return current_user_can('edit_posts');
    }
    
    /**
     * Publish article to WordPress
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
        
        $post_id = wp_insert_post($post_data);
        
        if (is_wp_error($post_id)) {
            return new WP_Error('publish_failed', $post_id->get_error_message(), array('status' => 500));
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
     */
    public function get_status($request) {
        return rest_ensure_response(array(
            'success' => true,
            'version' => FINITY_AI_VERSION,
            'wp_version' => get_bloginfo('version'),
            'user_can_publish' => current_user_can('publish_posts')
        ));
    }
    
    /**
     * Upload featured image
     */
    private function upload_featured_image($post_id, $image_data) {
        // Handle base64 image or URL
        // Implementation depends on image format
    }
}

// Initialize plugin
Finity_AI_SEO_Writer::get_instance();

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    add_option('finity_ai_app_url', 'http://localhost:3000');
});
