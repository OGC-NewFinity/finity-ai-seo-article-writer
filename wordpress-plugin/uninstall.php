<?php
/**
 * Uninstall script for Nova‑XFinity AI Writer
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options
delete_option('finity_ai_app_url');
delete_option('finity_ai_version');
