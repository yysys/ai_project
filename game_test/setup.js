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
      })
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
  onTouchStart: jest.fn()
};
