/**
 * Circadian Color System
 * Adjusts site colors based on time of day to match natural circadian rhythms
 */

(function() {
    'use strict';

    // Color schemes for different times of day
    const colorSchemes = {
        night: {
            // Deep night (0:00 - 5:00) - Dark, restful colors
            black: '#1a1a2e',
            red: '#6b4e8e',
            border: '#2d2d44',
            bgAlt: '#16213e'
        },
        dawn: {
            // Dawn (5:00 - 8:00) - Cool, awakening colors
            black: '#2c3e50',
            red: '#3498db',
            border: '#95a5a6',
            bgAlt: '#ecf0f1'
        },
        morning: {
            // Morning (8:00 - 12:00) - Bright, energizing colors
            black: '#2c3e50',
            red: '#16a085',
            border: '#bdc3c7',
            bgAlt: '#f8f9fa'
        },
        afternoon: {
            // Afternoon (12:00 - 17:00) - Neutral, focused colors
            black: '#222222',
            red: '#dc3545',
            border: '#cccccc',
            bgAlt: '#f8f8f8'
        },
        evening: {
            // Evening (17:00 - 21:00) - Warm, relaxing colors
            black: '#3d2817',
            red: '#e67e22',
            border: '#c9a88a',
            bgAlt: '#fdf6ec'
        },
        dusk: {
            // Dusk (21:00 - 24:00) - Dimmed, calming colors
            black: '#2c2416',
            red: '#d68910',
            border: '#584a2f',
            bgAlt: '#332d21'
        }
    };

    /**
     * Interpolate between two colors
     */
    function interpolateColor(color1, color2, factor) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return rgbToHex(r, g, b);
    }

    /**
     * Convert hex color to RGB object
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex color
     */
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Get color scheme based on current hour
     */
    function getColorScheme(hour, minute) {
        const time = hour + minute / 60;

        // Define time periods and their transitions
        const periods = [
            { end: 5, scheme: 'night' },
            { end: 8, scheme: 'dawn' },
            { end: 12, scheme: 'morning' },
            { end: 17, scheme: 'afternoon' },
            { end: 21, scheme: 'evening' },
            { end: 24, scheme: 'dusk' }
        ];

        // Find current and next period
        let currentPeriod = periods[periods.length - 1];
        let nextPeriod = periods[0];
        let periodStart = 0;

        for (let i = 0; i < periods.length; i++) {
            if (time < periods[i].end) {
                currentPeriod = i === 0 ? periods[periods.length - 1] : periods[i - 1];
                nextPeriod = periods[i];
                periodStart = i === 0 ? 0 : periods[i - 1].end;
                break;
            }
        }

        // Calculate interpolation factor
        const periodLength = nextPeriod.end - periodStart;
        const factor = (time - periodStart) / periodLength;

        // Interpolate colors between current and next period
        const current = colorSchemes[currentPeriod.scheme];
        const next = colorSchemes[nextPeriod.scheme];

        return {
            black: interpolateColor(current.black, next.black, factor),
            red: interpolateColor(current.red, next.red, factor),
            border: interpolateColor(current.border, next.border, factor),
            bgAlt: interpolateColor(current.bgAlt, next.bgAlt, factor)
        };
    }

    /**
     * Apply color scheme to CSS custom properties
     */
    function applyColorScheme() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        const colors = getColorScheme(hour, minute);

        const root = document.documentElement;
        root.style.setProperty('--color-black', colors.black);
        root.style.setProperty('--color-red', colors.red);
        root.style.setProperty('--color-border', colors.border);
        root.style.setProperty('--color-bg-alt', colors.bgAlt);

        // Log current time period for debugging
        console.log(`Circadian colors updated: ${hour}:${minute.toString().padStart(2, '0')}`);
    }

    /**
     * Initialize circadian color system
     */
    function init() {
        // Apply colors immediately
        applyColorScheme();

        // Update colors every minute
        setInterval(applyColorScheme, 60000);

        // Update on page visibility change
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                applyColorScheme();
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
