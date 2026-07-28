import { cyclicRotation } from './cyclicRotation'

describe('cyclicRotation', () => {
  it('should rotate array to the right by K steps', () => {
    expect(cyclicRotation([3, 8, 9, 7, 6], 3)).toEqual([9, 7, 6, 3, 8])
    expect(cyclicRotation([0, 0, 0], 1)).toEqual([0, 0, 0])
    expect(cyclicRotation([1, 2, 3, 4], 4)).toEqual([1, 2, 3, 4])
  })

  it('should handle empty array', () => {
    expect(cyclicRotation([], 3)).toEqual([])
  })

  it('should handle K = 0', () => {
    expect(cyclicRotation([1, 2, 3], 0)).toEqual([1, 2, 3])
  })

  it('should handle K > array length', () => {
    expect(cyclicRotation([1, 2, 3, 4, 5], 6)).toEqual([5, 1, 2, 3, 4]) // 6 % 5 = 1
  })

  it('should handle single element array', () => {
    expect(cyclicRotation([10], 5)).toEqual([10])
  })
})
