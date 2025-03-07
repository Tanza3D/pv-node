function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // No saturation, it's a grey
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, l };
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // Achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}


function interpolateColor(color1, color2, t) {
    const hsl1 = rgbToHsl(color1.r, color1.g, color1.b);
    const hsl2 = rgbToHsl(color2.r, color2.g, color2.b);

    const h = hsl1.h + (hsl2.h - hsl1.h) * t;
    const s = hsl1.s + (hsl2.s - hsl1.s) * t;
    const l = hsl1.l + (hsl2.l - hsl1.l) * t;

    return hslToRgb(h, s, l);
}


function preprocessGradient(gradientMap, width, height) {
    var result = [];

    const topLeft = gradientMap[0][0];
    const topRight = gradientMap[0][1];
    const bottomLeft = gradientMap[1][0];
    const bottomRight = gradientMap[1][1];

    for (let y = 0; y < height; y++) {
        result[y] = [];
        for (let x = 0; x < width; x++) {
            const tx = x / (width - 1);
            const ty = y / (height - 1);

            const topColor = interpolateColor(topLeft, topRight, tx);
            const bottomColor = interpolateColor(bottomLeft, bottomRight, tx);

            const finalColor = interpolateColor(topColor, bottomColor, ty);

            result[y][x] = finalColor;
        }
    }

    return result;
}

module.exports = {preprocessGradient}