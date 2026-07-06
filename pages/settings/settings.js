Page({
  async seedDemo() {
    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: "初始化演示数据",
        content: "将写入 10 个演示会员资料，是否继续？",
        success: (res) => resolve(res.confirm)
      });
    });
    if (!confirm) return;

    wx.showLoading({ title: "初始化中" });
    try {
      const res = await wx.cloud.callFunction({
        name: "seedDemo",
        data: {}
      });
      wx.showToast({ title: `已创建${res.result.count}位会员` });
    } catch (err) {
      wx.showToast({ title: "初始化失败", icon: "none" });
      console.error(err);
    } finally {
      wx.hideLoading();
    }
  }
});
