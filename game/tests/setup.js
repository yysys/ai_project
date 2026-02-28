const mockStorage = {};

global.tt = {
  createCanvas: () => {
    return {
      width: 375,
      height: 667,
      getContext: () => ({
        clearRect: jest.fn(),
        fillStyle: '',
        fillRect: jest.fn(),
        strokeStyle: '',
        lineWidth: 1,
        stroke: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
        fillText: jest.fn(),
        shadowColor: '',
        shadowBlur: 0
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
  },
  getSystemInfoSync: () => ({
    windowWidth: 375,
    windowHeight: 667
  }),
  getPerformance: () => ({
    now: () => Date.now()
  }),
  requestAnimationFrame: (callback) => {
    return setTimeout(callback, 16);
  },
  cancelAnimationFrame: (id) => {
    clearTimeout(id);
  },
  setTimeout: (callback, delay) => {
    return setTimeout(callback, delay);
  },
  showToast: jest.fn(),
  showModal: jest.fn(),
  onTouchStart: jest.fn(),
  onTouchMove: jest.fn(),
  onTouchEnd: jest.fn(),
  offTouchStart: jest.fn(),
  offTouchMove: jest.fn(),
  offTouchEnd: jest.fn(),
  setStorageSync: (key, value) => {
    mockStorage[key] = value;
  },
  getStorageSync: (key) => {
    return mockStorage[key];
  },
  removeStorageSync: (key) => {
    delete mockStorage[key];
  },
  clearStorageSync: () => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  },
  getStorageInfoSync: () => ({
    keys: Object.keys(mockStorage),
    currentSize: Object.keys(mockStorage).reduce((sum, key) => {
      return sum + JSON.stringify(mockStorage[key]).length * 2;
    }, 0),
    limitSize: 10240
  })
};

global.wx = global.tt;

global.performance = {
  now: () => Date.now()
};

global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;
