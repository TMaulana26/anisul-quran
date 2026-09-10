import { describe, it, expect, vi } from 'vitest';
import { cn, copyToClipboard } from './utils';

describe('cn utility', () => {
    it('merges class names correctly', () => {
        expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('resolves conflicting tailwind classes', () => {
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
});

describe('copyToClipboard utility', () => {
    it('returns false for empty string', async () => {
        const result = await copyToClipboard('');
        expect(result).toBe(false);
    });

    it('uses fallback execCommand when clipboard API is unavailable', async () => {
        const originalClipboard = navigator.clipboard;
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
        document.execCommand = vi.fn().mockReturnValue(true);

        const result = await copyToClipboard('AK7F29');
        expect(result).toBe(true);
        expect(document.execCommand).toHaveBeenCalledWith('copy');

        Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    });
});
