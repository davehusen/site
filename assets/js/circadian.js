/**
 * Circadian Sky System
 * Simulates the sky throughout the day with gradients and adaptive colors
 */

(function() {
    'use strict';

    // Sky schemes: each period defines a full sky gradient (top → middle → horizon)
    // plus adaptive UI colors for text, links, and content surfaces
    const skySchemes = {
        night: {
            // Deep night (0:00 - 5:00) — starless dark sky
            skyTop:    '#050510',
            skyMid:    '#0a0e24',
            skyBottom: '#111a33',
            text:      '#c8c8d4',
            accent:    '#7b8fc7',
            surface:   'rgba(8, 8, 20, 0.65)',
            border:    'rgba(120, 130, 180, 0.15)'
        },
        dawn: {
            // Dawn (5:00 - 8:00) — warm light breaking through
            skyTop:    '#1a2a5c',
            skyMid:    '#d68a5e',
            skyBottom: '#f2c896',
            text:      '#2c2418',
            accent:    '#a85d30',
            surface:   'rgba(255, 245, 230, 0.55)',
            border:    'rgba(180, 120, 70, 0.15)'
        },
        morning: {
            // Morning (8:00 - 12:00) — clear blue sky
            skyTop:    '#1e6cc4',
            skyMid:    '#5aa0e0',
            skyBottom: '#b4d9f2',
            text:      '#1a2a3a',
            accent:    '#1a7a5c',
            surface:   'rgba(255, 255, 255, 0.5)',
            border:    'rgba(30, 80, 140, 0.1)'
        },
        afternoon: {
            // Afternoon (12:00 - 17:00) — bright expansive sky
            skyTop:    '#1873cc',
            skyMid:    '#4a9ae0',
            skyBottom: '#8ec5ed',
            text:      '#1a2636',
            accent:    '#c44020',
            surface:   'rgba(255, 255, 255, 0.45)',
            border:    'rgba(30, 80, 140, 0.1)'
        },
        evening: {
            // Evening (17:00 - 21:00) — sunset warmth
            skyTop:    '#1a1440',
            skyMid:    '#8b3a5c',
            skyBottom: '#e8844a',
            text:      '#f0e8e0',
            accent:    '#e8a060',
            surface:   'rgba(30, 15, 40, 0.45)',
            border:    'rgba(220, 160, 100, 0.15)'
        },
        dusk: {
            // Dusk (21:00 - 24:00) — twilight descending into night
            skyTop:    '#08081a',
            skyMid:    '#12123a',
            skyBottom: '#1a1848',
            text:      '#b0b0c8',
            accent:    '#8080b8',
            surface:   'rgba(10, 10, 28, 0.6)',
            border:    'rgba(100, 100, 170, 0.15)'
        }
    };

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function interpolateHex(color1, color2, factor) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        return rgbToHex(r, g, b);
    }

    /**
     * Parse an rgba() string into components
     */
    function parseRgba(str) {
        const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
        if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    function interpolateRgba(rgba1, rgba2, factor) {
        const c1 = parseRgba(rgba1);
        const c2 = parseRgba(rgba2);
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        const a = +(c1.a + (c2.a - c1.a) * factor).toFixed(3);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    /**
     * Get interpolated sky scheme based on current time
     */
    function getSkyScheme(hour, minute) {
        const time = hour + minute / 60;

        const periods = [
            { end: 5,  scheme: 'night' },
            { end: 8,  scheme: 'dawn' },
            { end: 12, scheme: 'morning' },
            { end: 17, scheme: 'afternoon' },
            { end: 21, scheme: 'evening' },
            { end: 24, scheme: 'dusk' }
        ];

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

        const periodLength = nextPeriod.end - periodStart;
        const factor = (time - periodStart) / periodLength;

        const cur = skySchemes[currentPeriod.scheme];
        const nxt = skySchemes[nextPeriod.scheme];

        return {
            skyTop:    interpolateHex(cur.skyTop, nxt.skyTop, factor),
            skyMid:    interpolateHex(cur.skyMid, nxt.skyMid, factor),
            skyBottom: interpolateHex(cur.skyBottom, nxt.skyBottom, factor),
            text:      interpolateHex(cur.text, nxt.text, factor),
            accent:    interpolateHex(cur.accent, nxt.accent, factor),
            surface:   interpolateRgba(cur.surface, nxt.surface, factor),
            border:    interpolateRgba(cur.border, nxt.border, factor)
        };
    }

    function applySky() {
        const now = new Date();
        const sky = getSkyScheme(now.getHours(), now.getMinutes());

        const root = document.documentElement;
        root.style.setProperty('--sky-top', sky.skyTop);
        root.style.setProperty('--sky-mid', sky.skyMid);
        root.style.setProperty('--sky-bottom', sky.skyBottom);
        root.style.setProperty('--color-text', sky.text);
        root.style.setProperty('--color-accent', sky.accent);
        root.style.setProperty('--color-surface', sky.surface);
        root.style.setProperty('--color-border', sky.border);
    }

    function init() {
        applySky();
        setInterval(applySky, 60000);
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) applySky();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
