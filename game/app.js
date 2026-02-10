App({
  onLaunch(options) {
    console.log('App launched', options);
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

  globalData: {
    userInfo: null
  }
});
