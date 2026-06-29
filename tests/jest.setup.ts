/* Minimal chrome extension API mock shared by tests. */
const chromeMock = {
  tabs: {
    query: jest.fn().mockResolvedValue([{ id: 1 }]),
    get: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn(),
  },
  runtime: {
    id: 'test-extension-id',
    sendMessage: jest.fn(),
    onMessage: { addListener: jest.fn() },
    onMessageExternal: { addListener: jest.fn() },
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
    },
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
    setTitle: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
  },
  webRequest: { onCompleted: { addListener: jest.fn() } },
};

(globalThis as unknown as { chrome: unknown }).chrome = chromeMock;
(window as unknown as { chrome: unknown }).chrome = chromeMock;

beforeEach(() => {
  jest.clearAllMocks();
  chromeMock.tabs.query.mockResolvedValue([{ id: 1 }]);
});
