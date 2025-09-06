export {};

declare global {
  // Web platform polyfills for Jest/node environment
  // These are assigned in jest.setup.js; we declare here to satisfy TypeScript.
  // eslint-disable-next-line no-var
  var TextEncoder: typeof import('util').TextEncoder | undefined;
  // eslint-disable-next-line no-var
  var TextDecoder: typeof import('util').TextDecoder | undefined;
  // eslint-disable-next-line no-var
  var TransformStream: typeof import('stream/web').TransformStream | undefined;
  // eslint-disable-next-line no-var
  var ReadableStream: typeof import('stream/web').ReadableStream | undefined;
  // eslint-disable-next-line no-var
  var WritableStream: typeof import('stream/web').WritableStream | undefined;
}

