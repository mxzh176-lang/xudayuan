Page({
  data: {
    keyword: "",
    members: []
  },

  onShow() {
    this.search();
  },

  onPullDownRefresh() {
    this.search().finally(() => wx.stopPullDownRefresh());
  },

  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
  },

  async search() {
    try {
      const res = await wx.cloud.callFunction({
        name: "memberService",
        data: {
          action: "list",
          keyword: this.data.keyword
        }
      });
      this.setData({ members: res.result.data });
    } catch (err) {
      wx.showToast({ title: "查询失败", icon: "none" });
      console.error(err);
    }
  }
});
