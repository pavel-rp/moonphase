import '@testing-library/jest-dom'
// Polyfills for MSW/node and fetch APIs in Jest
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'
import { TransformStream, ReadableStream, WritableStream } from 'stream/web'

if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder
if (!globalThis.TransformStream) globalThis.TransformStream = TransformStream
if (!globalThis.ReadableStream) globalThis.ReadableStream = ReadableStream
if (!globalThis.WritableStream) globalThis.WritableStream = WritableStream

// Polyfill ResizeObserver for jsdom
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error jsdom lacks ResizeObserver in this environment
if (!global.ResizeObserver) global.ResizeObserver = RO

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { alt = '', ...rest } = props
    /* eslint-disable @next/next/no-img-element */
    return <img alt={alt} {...rest} />
  },
}))

// Mock CSS modules
jest.mock('*.module.css', () => ({}))

// Mock GSAP and related plugins to prevent ESM parse issues in Jest
jest.mock('gsap', () => {
  const sharedMethods = {
    registerPlugin: jest.fn(),
    timeline: () => ({ fromTo: jest.fn(), to: jest.fn(), set: jest.fn(), kill: jest.fn() }),
    fromTo: jest.fn(),
    to: jest.fn(),
    set: jest.fn(),
    killTweensOf: jest.fn(),
    context: (fn) => {
      if (typeof fn === 'function') fn();
      return { revert: () => {} };
    },
  }
  return {
    __esModule: true,
    default: sharedMethods,
    gsap: sharedMethods,
    ...sharedMethods,
  }
})

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