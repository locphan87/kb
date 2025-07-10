import React from 'react'
import { render } from '@testing-library/react'

jest.mock('@theme/Heading', () => ({ as, children, ...props }: any) => {
  const Tag = as || 'h1'
  return <Tag {...props}>{children}</Tag>
})

import HomepageFeatures from './index'

test('renders all feature titles', () => {
  const { getByText } = render(<HomepageFeatures />)
  expect(getByText('Easy to Use')).toBeTruthy()
  expect(getByText('Focus on What Matters')).toBeTruthy()
  expect(getByText('Powered by React')).toBeTruthy()
})
