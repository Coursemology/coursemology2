import MockAdapter from 'axios-mock-adapter';

const registerCSRFTokenMockHandler = (mock) => {
  mock.onGet('/csrf_token').reply(200, { csrfToken: 'mock_csrf_token' });
};

export const createMockAdapter = (instance) => {
  const mock = new MockAdapter(instance);
  registerCSRFTokenMockHandler(mock);

  return Object.assign(mock, {
    reset: () => {
      mock.resetHandlers();
      mock.resetHistory();
      registerCSRFTokenMockHandler(mock);
    },
  });
};
