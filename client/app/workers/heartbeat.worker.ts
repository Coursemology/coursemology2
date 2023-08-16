import createListeners from './listeners';

const listeners = createListeners({
  close: () => globalThis.close(),
});

onmessage = ({ data }: MessageEvent): void => {
  const listener = listeners[data.type];
  if (!listener) throw new Error(`No listener for ${data.type}!`);

  listener(data.payload);
};
