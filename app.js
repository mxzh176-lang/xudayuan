App({
  globalData: {
    storeName: "徐大源手工冰棍",
    cloudEnv: "请替换为微信云开发环境ID"
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
