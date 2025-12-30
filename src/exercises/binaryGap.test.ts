import { binaryGap } from './binaryGap';

describe('binaryGap', () => {
    it('should return 0 for numbers with no binary gaps', () => {
        expect(binaryGap(15)).toBe(0); // 1111
        expect(binaryGap(32)).toBe(0); // 100000
    });

    it('should return correct gap for numbers with one gap', () => {
        expect(binaryGap(9)).toBe(2); // 1001
        expect(binaryGap(20)).toBe(1); // 10100
    });

    it('should return longest gap for numbers with multiple gaps', () => {
        expect(binaryGap(529)).toBe(4); // 1000010001
        expect(binaryGap(1041)).toBe(5); // 10000010001
    });

    it('should handle large numbers', () => {
        expect(binaryGap(2147483647)).toBe(0); // All 1s
        // 100...001 (say 30 zeros) -> 2^31 + 1 is too large for signed 32-bit but JS numbers are doubles.
        // Let's try a known pattern.
        // 561892 = 100010010010100100100
        // Gaps: 3, 2, 2, 1, 2, 2. Max: 3.
        expect(binaryGap(561892)).toBe(3);
    });
});
