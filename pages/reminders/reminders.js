Page({
  data: {
    reminders: []
  },

  onShow() {
    this.loadReminders();
  },

  onPullDownRefresh() {
    this.loadReminders().finally(() => wx.stopPullDownRefresh());
  },

  async loadReminders() {
    try {
      const res = await wx.cloud.callFunction({
        name: "reminderService",
        data: { action: "listPending" }
      });
      this.setData({ reminders: res.result.data });
    } catch (err) {
      wx.showToast({ title: "加载失败", icon: "none" });
      console.error(err);
    }
  },

  copyMessage(event) {
    wx.setClipboardData({
      data: event.currentTarget.dataset.message,
      success: () => wx.showToast({ title: "已复制" })
    });
  },

  async markSent(event) {
    try {
      await wx.cloud.callFunction({
        name: "reminderService",
        data: {
          action: "markSent",
          id: event.currentTarget.dataset.id
        }
      });
      wx.showToast({ title: "已通知" });
      this.loadReminders();
    } catch (err) {
      wx.showToast({ title: "操作失败", icon: "none" });
      console.error(err);
    }
  }
});
