/**
 * Circadian Sky
 * Shifts the sky-dot colour beside the site title to reflect the
 * viewer's local time of day. Everything else on the page is static.
 */

(function() {
    'use strict';

    const schemes = {
        night:     { top: '#0b0d1a', bottom: '#141828' },  // 0:00–5:00
        dawn:      { top: '#3a4466', bottom: '#c8a07a' },  // 5:00–8:00
        morning:   { top: '#6e9ec5', bottom: '#d0dfe8' },  // 8:00–12:00
        afternoon: { top: '#5a8eb8', bottom: '#c0d4e2' },  // 12:00–17:00
        evening:   { top: '#2e2244', bottom: '#b86e48' },  // 17:00–21:00
        dusk:      { top: '#0e0e20', bottom: '#1a1a30' }   // 21:00–24:00
    };

    const periods = [
        { end: 5,  s: 'night' },
        { end: 8,  s: 'dawn' },
        { end: 12, s: 'morning' },
        { end: 17, s: 'afternoon' },
        { end: 21, s: 'evening' },
        { end: 24, s: 'dusk' }
    ];

    function hexToRgb(hex) {
        var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : {r:0,g:0,b:0};
    }

    function rgbToHex(r, g, b) {
        return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
    }

    function lerp(a, b, t) {
        var c1 = hexToRgb(a), c2 = hexToRgb(b);
        return rgbToHex(
            Math.round(c1.r + (c2.r - c1.r) * t),
            Math.round(c1.g + (c2.g - c1.g) * t),
            Math.round(c1.b + (c2.b - c1.b) * t)
        );
    }

    function apply() {
        var now = new Date();
        var time = now.getHours() + now.getMinutes() / 60;

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
        var a = schemes[cur.s], b = schemes[nxt.s];
        var s = document.documentElement.style;

        s.setProperty('--sky-top',    lerp(a.top, b.top, t));
        s.setProperty('--sky-bottom', lerp(a.bottom, b.bottom, t));
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
