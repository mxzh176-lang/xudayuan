const emptyForm = {
  _id: "",
  memberNo: "",
  name: "",
  phone: "",
  level: "普通",
  points: 0,
  balance: 0,
  spent: 0,
  birthday: "",
  favorite: "",
  note: ""
};

Page({
  data: {
    form: { ...emptyForm }
  },

  onLoad(options) {
    if (options.id) this.loadMember(options.id);
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  async loadMember(id) {
    wx.showLoading({ title: "加载中" });
    try {
      const res = await wx.cloud.callFunction({
        name: "memberService",
        data: { action: "get", id }
      });
      this.setData({ form: res.result.data });
    } catch (err) {
      wx.showToast({ title: "加载失败", icon: "none" });
      console.error(err);
    } finally {
      wx.hideLoading();
    }
  },

  async saveMember() {
    const form = this.data.form;
    if (!form.name || !form.phone) {
      wx.showToast({ title: "姓名和手机号必填", icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中" });
    try {
      const res = await wx.cloud.callFunction({
        name: "memberService",
        data: { action: "save", member: form }
      });
      wx.showToast({ title: "已保存" });
      this.setData({ "form._id": res.result.data._id });
    } catch (err) {
      wx.showToast({ title: "保存失败", icon: "none" });
      console.error(err);
    } finally {
      wx.hideLoading();
    }
  },

  goConsume() {
    wx.switchTab({ url: "/pages/consume/consume" });
  }
});
