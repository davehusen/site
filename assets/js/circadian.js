/**
 * Circadian Sky System
 * Shifts the sky, wall lighting, and text to reflect the viewer's local time.
 *
 * The page background is a concrete wall. A vertical window on the left edge
 * lets in sky-coloured light that spills across the wall, falling off with
 * distance. Text uses two fixed tones (warm charcoal / warm cream) that swap
 * with the day–night cycle for legibility.
 */

(function() {
    'use strict';

    // ── colour schemes per period ────────────────────────────────────────
    //
    // skyTop / skyBottom : the gradient visible through the window
    // text / accent / link : page typography (two fixed tones, day & night)
    // bg                   : base concrete wall colour
    // lightR/G/B           : colour of the light cast onto the wall
    // lightA               : peak intensity of the spill (0 – 1)

    const skySchemes = {
        night: {
            // 0:00–5:00 — deep quiet dark
            skyTop:    '#0b0d1a',
            skyBottom: '#141828',
            text:      '#e2ddd6',
            accent:    '#c8a878',
            link:      '#c8a878',
            bg:        '#1c1c20',
            lightR: 160, lightG: 170, lightB: 200, lightA: 0.02
        },
        dawn: {
            // 5:00–8:00 — warm golden light pouring in
            skyTop:    '#3a4466',
            skyBottom: '#c8a07a',
            text:      '#2c2824',
            accent:    '#7a4428',
            link:      '#7a4428',
            bg:        '#e4ddd4',
            lightR: 220, lightG: 175, lightB: 120, lightA: 0.18
        },
        morning: {
            // 8:00–12:00 — bright, clean daylight
            skyTop:    '#6e9ec5',
            skyBottom: '#d0dfe8',
            text:      '#2c2824',
            accent:    '#7a4428',
            link:      '#7a4428',
            bg:        '#e8e6e2',
            lightR: 210, lightG: 220, lightB: 230, lightA: 0.12
        },
        afternoon: {
            // 12:00–17:00 — full, open daylight
            skyTop:    '#5a8eb8',
            skyBottom: '#c0d4e2',
            text:      '#2c2824',
            accent:    '#7a4428',
            link:      '#7a4428',
            bg:        '#eae8e4',
            lightR: 220, lightG: 215, lightB: 200, lightA: 0.10
        },
        evening: {
            // 17:00–21:00 — deep amber sunset
            skyTop:    '#2e2244',
            skyBottom: '#b86e48',
            text:      '#e2ddd6',
            accent:    '#c8a878',
            link:      '#c8a878',
            bg:        '#242028',
            lightR: 210, lightG: 150, lightB: 80, lightA: 0.16
        },
        dusk: {
            // 21:00–24:00 — settling into darkness
            skyTop:    '#0e0e20',
            skyBottom: '#1a1a30',
            text:      '#e2ddd6',
            accent:    '#c8a878',
            link:      '#c8a878',
            bg:        '#1a1a1e',
            lightR: 140, lightG: 150, lightB: 180, lightA: 0.03
        }
    };

    // ── helpers ──────────────────────────────────────────────────────────

    function hexToRgb(hex) {
        const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : {r:0,g:0,b:0};
    }

    function rgbToHex(r, g, b) {
        return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
    }

    function lerp(a, b, t) {
        const c1 = hexToRgb(a), c2 = hexToRgb(b);
        return rgbToHex(
            Math.round(c1.r + (c2.r - c1.r) * t),
            Math.round(c1.g + (c2.g - c1.g) * t),
            Math.round(c1.b + (c2.b - c1.b) * t)
        );
    }

    function lerpNum(a, b, t) {
        return a + (b - a) * t;
    }

    // ── sky computation ─────────────────────────────────────────────────

    function getSky(hour, minute) {
        var time = hour + minute / 60;
        var periods = [
            { end: 5,  s: 'night' },
            { end: 8,  s: 'dawn' },
            { end: 12, s: 'morning' },
            { end: 17, s: 'afternoon' },
            { end: 21, s: 'evening' },
            { end: 24, s: 'dusk' }
        ];

        var cur = periods[periods.length - 1];
        var nxt = periods[0];
        var start = 0;

        for (var i = 0; i < periods.length; i++) {
            if (time < periods[i].end) {
                cur = i === 0 ? periods[periods.length - 1] : periods[i - 1];
                nxt = periods[i];
                start = i === 0 ? 0 : periods[i - 1].end;
                break;
            }
        }

        var t = (time - start) / (nxt.end - start);
        var a = skySchemes[cur.s], b = skySchemes[nxt.s];

        return {
            skyTop:    lerp(a.skyTop, b.skyTop, t),
            skyBottom: lerp(a.skyBottom, b.skyBottom, t),
            text:      lerp(a.text, b.text, t),
            accent:    lerp(a.accent, b.accent, t),
            link:      lerp(a.link, b.link, t),
            bg:        lerp(a.bg, b.bg, t),
            lightR:    Math.round(lerpNum(a.lightR, b.lightR, t)),
            lightG:    Math.round(lerpNum(a.lightG, b.lightG, t)),
            lightB:    Math.round(lerpNum(a.lightB, b.lightB, t)),
            lightA:    lerpNum(a.lightA, b.lightA, t)
        };
    }

    // ── light-spill gradient ────────────────────────────────────────────
    // Simulates light entering from the left-edge window and falling off
    // across the wall surface. Exponential-style decay via four stops.

    function buildLightGradient(r, g, b, a) {
        var c = r + ',' + g + ',' + b;
        return 'linear-gradient(to right,' +
            'rgba(' + c + ',' + a.toFixed(4) + ') 0%,' +
            'rgba(' + c + ',' + (a * 0.55).toFixed(4) + ') 8%,' +
            'rgba(' + c + ',' + (a * 0.20).toFixed(4) + ') 25%,' +
            'rgba(' + c + ',' + (a * 0.05).toFixed(4) + ') 45%,' +
            'rgba(' + c + ',0) 65%)';
    }

    // ── apply ───────────────────────────────────────────────────────────

    function apply() {
        var now = new Date();
        var sky = getSky(now.getHours(), now.getMinutes());
        var s = document.documentElement.style;

        s.setProperty('--sky-top',      sky.skyTop);
        s.setProperty('--sky-bottom',   sky.skyBottom);
        s.setProperty('--color-text',   sky.text);
        s.setProperty('--color-accent', sky.accent);
        s.setProperty('--color-link',   sky.link);
        s.setProperty('--color-bg',     sky.bg);
        s.setProperty('--wall-light',   buildLightGradient(sky.lightR, sky.lightG, sky.lightB, sky.lightA));
    }

    function init() {
        apply();
        setInterval(apply, 60000);
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) apply();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
