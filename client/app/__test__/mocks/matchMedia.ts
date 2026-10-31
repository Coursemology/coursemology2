const noop = (): void => {};

// this is necessary for the date picker to be rendered in desktop mode.
// if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    media: query,
    // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
    matches: query === '(pointer: fine)',
    onchange: noop,
    addEventListener: noop,
    removeEventListener: noop,
    addListener: noop,
    removeListener: noop,
    dispatchEvent: () => false,
  }),
});
