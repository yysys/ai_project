const logger = require('./utils/logger');

App({
  onLaunch(options) {
    console.log('App launched', options);
    this.setupDebugHelpers();
  },

  onShow(options) {
    console.log('App show', options);
  },

  onHide() {
    console.log('App hide');
  },

  onError(msg) {
    console.error('App error:', msg);
  },

  setupDebugHelpers() {
    this.logger = logger;
  },

  globalData: {
    userInfo: null
  }
});
