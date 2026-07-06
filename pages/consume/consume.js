Page({
  data: {
    form: {
      memberKey: "",
      product: "",
      quantity: 1,
      amount: "",
      payType: "balance"
    }
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  onPayTypeChange(event) {
    this.setData({ "form.payType": event.detail.value });
  },

  async submit() {
    const form = this.data.form;
    if (!form.memberKey || !form.product || !Number(form.amount)) {
      wx.showToast({ title: "请补全消费信息", icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中" });
    try {
      const res = await wx.cloud.callFunction({
        name: "consumeService",
        data: {
          action: "create",
          record: {
            ...form,
            quantity: Number(form.quantity || 1),
            amount: Number(form.amount || 0)
          }
        }
      });
      wx.showModal({
        title: "消费已保存",
        content: res.result.data.message,
        confirmText: "复制提醒",
        success: (modal) => {
          if (modal.confirm) {
            wx.setClipboardData({ data: res.result.data.message });
          }
          this.setData({
            form: { memberKey: "", product: "", quantity: 1, amount: "", payType: "balance" }
          });
        }
      });
    } catch (err) {
      wx.showToast({ title: err.message || "保存失败", icon: "none" });
      console.error(err);
    } finally {
      wx.hideLoading();
    }
  }
});
