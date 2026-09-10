import { describe, it, expect } from 'vitest';
import { generateQRCodeSVG } from './qrcode.js';

describe('QR Code Generator (SVG)', () => {
    it('returns empty string for empty input', () => {
        expect(generateQRCodeSVG('')).toBe('');
        expect(generateQRCodeSVG(null)).toBe('');
    });

    it('generates valid SVG for a room link', () => {
        const url = 'http://anisul-quran.test/listen/AK7F29';
        const svg = generateQRCodeSVG(url);

        expect(svg).toContain('<svg');
        expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
        expect(svg).toContain('viewBox=');
        expect(svg).toContain('<path d=');
        expect(svg).toContain('</svg>');
    });

    it('respects foreground and background options', () => {
        const svg = generateQRCodeSVG('test', {
            foreground: '#0f172a',
            background: '#ffffff',
            margin: 4,
        });

        expect(svg).toContain('fill="#0f172a"');
        expect(svg).toContain('fill="#ffffff"');
        expect(svg).toContain('<rect width="100%" height="100%"');
    });
});
