import { getUserToken } from './authentication';

export const CABLE_PATH = '/cable';

export const getWebSocketURL = (): string => {
  const { protocol, host } = globalThis.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const userToken = getUserToken();
  return `${wsProtocol}//${host}${CABLE_PATH}?token=${userToken}`;
};
