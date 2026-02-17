/**
 * Circadian Sky System
 * Shifts the page background and text to reflect the sky at the viewer's local time
 */

(function() {
    'use strict';

    // Each period defines a soft atmospheric gradient (top → bottom),
    // text/accent colors, and a solid page background that shifts with the sky.
    const skySchemes = {
        night: {
            // 0:00–5:00 — deep quiet dark
            skyTop:    '#0b0d1a',
            skyBottom: '#141828',
            text:      '#e0e2ea',
            accent:    '#a8b8d8',
            link:      '#b0c0e0',
            bg:        '#1c1c20'
        },
        dawn: {
            // 5:00–8:00 — cool light with warm horizon glow
            skyTop:    '#3a4466',
            skyBottom: '#c8a07a',
            text:      '#1a1208',
            accent:    '#6a3c1a',
            link:      '#5a3010',
            bg:        '#e4ddd4'
        },
        morning: {
            // 8:00–12:00 — clear, bright, airy
            skyTop:    '#6e9ec5',
            skyBottom: '#d0dfe8',
            text:      '#111e28',
            accent:    '#1a5a46',
            link:      '#18503e',
            bg:        '#e8e6e2'
        },
        afternoon: {
            // 12:00–17:00 — open, calm, full light
            skyTop:    '#5a8eb8',
            skyBottom: '#c0d4e2',
            text:      '#0e1c26',
            accent:    '#8a3818',
            link:      '#7a3012',
            bg:        '#eae8e4'
        },
        evening: {
            // 17:00–21:00 — warm, fading light
            skyTop:    '#2e2244',
            skyBottom: '#b86e48',
            text:      '#f5ede4',
            accent:    '#e8b880',
            link:      '#ecc090',
            bg:        '#242028'
        },
        dusk: {
            // 21:00–24:00 — settling into darkness
            skyTop:    '#0e0e20',
            skyBottom: '#1a1a30',
            text:      '#d8dae8',
            accent:    '#9898c0',
            link:      '#a8a8d0',
            bg:        '#1a1a1e'
        }
    };

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
            bg:        lerp(a.bg, b.bg, t)
        };
    }

    function apply() {
        var now = new Date();
        var sky = getSky(now.getHours(), now.getMinutes());
        var s = document.documentElement.style;
        s.setProperty('--sky-top', sky.skyTop);
        s.setProperty('--sky-bottom', sky.skyBottom);
        s.setProperty('--color-text', sky.text);
        s.setProperty('--color-accent', sky.accent);
        s.setProperty('--color-link', sky.link);
        s.setProperty('--color-bg', sky.bg);
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
