// jsdom does not implement ResizeObserver.
class ResizeObserver {
  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserver;

export default ResizeObserver;
