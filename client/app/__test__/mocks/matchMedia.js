// this is necessary for the date picker to be rendered in desktop mode.
// if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    media: query,
    // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
    matches: query === '(pointer: fine)',
    onchange: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
