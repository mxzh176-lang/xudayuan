Page({
  data: {
    stats: {
      totalMembers: 0,
      totalBalance: "0.00",
      totalSpent: "0.00",
      pendingReminders: 0
    },
    lowBalanceMembers: []
  },

  onShow() {
    this.loadDashboard();
  },

  async loadDashboard() {
    wx.showLoading({ title: "加载中" });
    try {
      const res = await wx.cloud.callFunction({
        name: "memberService",
        data: { action: "dashboard" }
      });
      this.setData(res.result.data);
    } catch (err) {
      wx.showToast({ title: "加载失败", icon: "none" });
      console.error(err);
    } finally {
      wx.hideLoading();
    }
  }
});
