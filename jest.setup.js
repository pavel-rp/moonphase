import '@testing-library/jest-dom'
// Polyfills for MSW/node and fetch APIs in Jest
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'
// @ts-expect-error - polyfilling globals for Jest environment
if (!global.TextEncoder) global.TextEncoder = TextEncoder
// @ts-expect-error - polyfilling globals for Jest environment
if (!global.TextDecoder) global.TextDecoder = TextDecoder
// Web Streams polyfills for MSW/node in jsdom env
import { TransformStream, ReadableStream, WritableStream } from 'stream/web'
// @ts-expect-error - polyfilling globals for Jest environment
if (!global.TransformStream) global.TransformStream = TransformStream
// @ts-expect-error - polyfilling globals for Jest environment
if (!global.ReadableStream) global.ReadableStream = ReadableStream
// @ts-expect-error - polyfilling globals for Jest environment
if (!global.WritableStream) global.WritableStream = WritableStream

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { alt = '', ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img alt={alt} {...rest} />
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