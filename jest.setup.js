import '@testing-library/jest-dom'
// Polyfills for MSW/node and fetch APIs in Jest
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'
// @ts-ignore
if (!global.TextEncoder) global.TextEncoder = TextEncoder
// @ts-ignore
if (!global.TextDecoder) global.TextDecoder = TextDecoder
// Web Streams polyfills for MSW/node in jsdom env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webStreams = require('stream/web')
// @ts-ignore
if (!global.TransformStream) global.TransformStream = webStreams.TransformStream
// @ts-ignore
if (!global.ReadableStream) global.ReadableStream = webStreams.ReadableStream
// @ts-ignore
if (!global.WritableStream) global.WritableStream = webStreams.WritableStream

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