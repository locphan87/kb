/**
 * Find longest sequence of zeros in binary representation of an integer.
 *
 * @param N - The integer to check.
 * @returns The length of the longest binary gap.
 */
export function binaryGap(N: number): number {
    const binary = N.toString(2);
    let maxGap = 0;
    let currentGap = 0;

    // We can skip the first character because it's always '1' for N > 0
    for (let i = 1; i < binary.length; i++) {
        if (binary[i] === '0') {
            currentGap++;
        } else {
            maxGap = Math.max(maxGap, currentGap);
            currentGap = 0;
        }
    }

    return maxGap;
}
