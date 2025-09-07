export {};

declare global {
  // Web platform polyfills for Jest/node environment
  // These are assigned in jest.setup.js; we declare here to satisfy TypeScript.
  var TextEncoder: typeof import('util').TextEncoder | undefined;
  var TextDecoder: typeof import('util').TextDecoder | undefined;
  var TransformStream: typeof import('stream/web').TransformStream | undefined;
  var ReadableStream: typeof import('stream/web').ReadableStream | undefined;
  var WritableStream: typeof import('stream/web').WritableStream | undefined;
}

