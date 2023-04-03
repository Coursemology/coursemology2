export const CABLE_PATH = '/cable';

export const getWebSocketURL = (): string => {
  const { protocol, host } = globalThis.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${host}${CABLE_PATH}`;
};
