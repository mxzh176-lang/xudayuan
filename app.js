App({
  globalData: {
    storeName: "徐大源手工冰棍",
    cloudEnv: "100050446731"
  },

  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({
        title: "云开发不可用",
        content: "请使用支持云开发的微信开发者工具或基础库版本。",
        showCancel: false
      });
      return;
    }

    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    });
  }
});
