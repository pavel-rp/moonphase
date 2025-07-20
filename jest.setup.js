import '@testing-library/jest-dom'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />
  },
}))

// Mock CSS modules
jest.mock('*.module.css', () => ({}))

// Mock GSAP and related plugins to prevent ESM parse issues in Jest
jest.mock('gsap', () => {
  const sharedMethods = {
    registerPlugin: jest.fn(),
    timeline: () => ({ fromTo: jest.fn() }),
    fromTo: jest.fn(),
  };
  return {
    __esModule: true,
    default: sharedMethods,
    ...sharedMethods,
  };
});

jest.mock('gsap/DrawSVGPlugin', () => ({ __esModule: true }))
jest.mock('gsap/MotionPathPlugin', () => ({ __esModule: true }))
jest.mock('@gsap/react', () => ({ __esModule: true, useGSAP: () => {} }))

// Mock the animated sparkline client component used in CryptoSparkline
jest.mock('@/components/ui/animation/animated-sparkline.client', () => ({
  __esModule: true,
  AnimatedSparkline: ({ data, className }) => (
    <div data-testid="animated-sparkline" data-color={className}>
      {(data || []).join(',')}
    </div>
  ),
}))

// Setup file for Jest tests