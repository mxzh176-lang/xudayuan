Page({
  data: {
    keyword: "",
    filter: "all",
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

  setFilter(event) {
    this.setData({ filter: event.currentTarget.dataset.filter });
    this.search();
  },

  async search() {
    try {
      const res = await wx.cloud.callFunction({
        name: "memberService",
        data: {
          action: "list",
          keyword: this.data.keyword,
          filter: this.data.filter
        }
      });
      this.setData({ members: res.result.data });
    } catch (err) {
      wx.showToast({ title: "查询失败", icon: "none" });
      console.error(err);
    }
  }
});
