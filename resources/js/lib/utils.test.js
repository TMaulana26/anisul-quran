import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
    it('merges class names correctly', () => {
        expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('resolves conflicting tailwind classes', () => {
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
});
