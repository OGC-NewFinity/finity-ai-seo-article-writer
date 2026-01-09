/**
 * Nova‑XFinity AI Sync Page JavaScript
 * 
 * Handles sync operations and status updates
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Sync all users button
        $('#sync-all-btn').on('click', function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const $status = $('#sync-status-message');
            const originalText = $button.text();
            
            $button.prop('disabled', true).text('Syncing...');
            $status.html('').removeClass('nova-plasma-badge');
            
            $.ajax({
                url: novaXFinityAI.restUrl + 'sync-usage',
                method: 'POST',
                headers: {
                    'X-WP-Nonce': novaXFinityAI.restNonce,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    async: false
                }),
                success: function(response) {
                    $button.prop('disabled', false).text(originalText);
                    
                    if (response.success) {
                        $status.html('<span class="nova-plasma-badge nova-plasma-badge--success">✓ ' + (response.message || 'Sync completed successfully!') + '</span>');
                        // Reload page after 2 seconds to show updated stats
                        setTimeout(function() {
                            window.location.reload();
                        }, 2000);
                    } else {
                        $status.html('<span class="nova-plasma-badge nova-plasma-badge--error">✗ ' + (response.message || 'Sync failed') + '</span>');
                    }
                },
                error: function(xhr) {
                    $button.prop('disabled', false).text(originalText);
                    const errorMsg = xhr.responseJSON?.message || 'An error occurred during sync.';
                    $status.html('<span class="nova-plasma-badge nova-plasma-badge--error">✗ ' + errorMsg + '</span>');
                }
            });
        });
        
        // Check sync status button
        $('#sync-status-btn').on('click', function(e) {
            e.preventDefault();
            
            const $button = $(this);
            const $status = $('#sync-status-message');
            const originalText = $button.text();
            
            $button.prop('disabled', true).text('Checking...');
            
            $.ajax({
                url: novaXFinityAI.restUrl + 'usage-stats',
                method: 'GET',
                headers: {
                    'X-WP-Nonce': novaXFinityAI.restNonce
                },
                success: function(response) {
                    $button.prop('disabled', false).text(originalText);
                    
                    if (response.success) {
                        const usage = response.usage;
                        let statusHtml = '<div style="margin-top: var(--plasma-spacing-md);">';
                        statusHtml += '<strong>Sync Status:</strong><br>';
                        
                        if (typeof usage === 'object') {
                            let hasUnsynced = false;
                            for (const userId in usage) {
                                const userData = usage[userId];
                                if (!userData.last_synced) {
                                    hasUnsynced = true;
                                    break;
                                }
                            }
                            
                            if (hasUnsynced) {
                                statusHtml += '<span class="nova-plasma-badge nova-plasma-badge--warning">Some users have unsynced data</span>';
                            } else {
                                statusHtml += '<span class="nova-plasma-badge nova-plasma-badge--success">All users synced</span>';
                            }
                        }
                        
                        statusHtml += '</div>';
                        $status.html(statusHtml);
                    }
                },
                error: function() {
                    $button.prop('disabled', false).text(originalText);
                    $status.html('<span class="nova-plasma-badge nova-plasma-badge--error">Failed to check status</span>');
                }
            });
        });
    });

})(jQuery);
