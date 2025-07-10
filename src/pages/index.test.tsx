import React from 'react'
import { render } from '@testing-library/react'

// Mock Docusaurus context and theme components
jest.mock('@docusaurus/useDocusaurusContext', () => () => ({
  siteConfig: { title: 'Test Site', tagline: 'Test Tagline' },
}))
jest.mock('@theme/Layout', () => ({ children }: any) => <div>{children}</div>)
jest.mock('@theme/Heading', () => ({ as, children, ...props }: any) => {
  const Tag = as || 'h1'
  return <Tag {...props}>{children}</Tag>
})
jest.mock('@docusaurus/Link', () => ({ children, ...props }: any) => (
  <a {...props}>{children}</a>
))
jest.mock('@site/src/components/HomepageFeatures', () => () => (
  <div data-testid="homepage-features" />
))

import Home from './index'

describe('Home page', () => {
  it('renders site title and tagline', () => {
    const { getByText } = render(<Home />)
    expect(getByText('Test Site')).toBeInTheDocument()
    expect(getByText('Test Tagline')).toBeInTheDocument()
  })

  it('renders the tutorial link', () => {
    const { getByText } = render(<Home />)
    expect(getByText('Docusaurus Tutorial - 5min ⏱️')).toBeInTheDocument()
  })

  it('renders HomepageFeatures', () => {
    const { getByTestId } = render(<Home />)
    expect(getByTestId('homepage-features')).toBeInTheDocument()
  })
})
