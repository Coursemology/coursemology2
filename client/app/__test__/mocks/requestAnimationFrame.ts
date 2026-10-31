global.requestAnimationFrame = (callback: FrameRequestCallback): number =>
  window.setTimeout(callback, 0);
