/**
 * Rotates an array to the right by a given number of steps.
 *
 * @param A - The array to rotate.
 * @param K - The number of steps to rotate.
 * @returns The rotated array.
 */
export function cyclicRotation(A: number[], K: number): number[] {
  if (A.length === 0) {
    return A
  }

  const steps = K % A.length

  if (steps === 0) {
    return A
  }

  return [...A.slice(-steps), ...A.slice(0, A.length - steps)]
}
