import createListeners from './listeners';

onconnect = ({ ports }: MessageEvent): void => {
  const port = ports[0];

  const listeners = createListeners({
    close: () => port.close(),
  });

  port.addEventListener('message', ({ data }: MessageEvent) => {
    const listener = listeners[data.type];
    if (!listener) throw new Error(`No listener for ${data.type}!`);

    listener(data.payload);
  });

  port.start();
};
