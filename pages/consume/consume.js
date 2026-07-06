Page({
  data: {
    quickProducts: [
      { name: "绿豆冰棍", amount: 5 },
      { name: "酸奶草莓", amount: 8 },
      { name: "芒果牛奶", amount: 9 },
      { name: "巧克力脆皮", amount: 10 }
    ],
    form: {
      memberKey: "",
      product: "",
      quantity: 1,
      amount: ""
    },
    previewAmount: "0.00",
    previewPoints: 0
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
    this.updatePreview();
  },

  pickProduct(event) {
    this.setData({
      "form.product": event.currentTarget.dataset.product,
      "form.amount": event.currentTarget.dataset.amount
    });
    this.updatePreview();
    wx.showToast({ title: "已选择商品", icon: "none" });
  },

  updatePreview() {
    const amount = Number(this.data.form.amount || 0);
    const quantity = Number(this.data.form.quantity || 1);
    const total = Number((amount * quantity).toFixed(2));
    this.setData({
      previewAmount: total.toFixed(2),
      previewPoints: Math.floor(total)
    });
  },

  async submit() {
    const form = this.data.form;
    if (!form.memberKey || !form.product) {
      wx.showToast({ title: "请填写会员和记录内容", icon: "none" });
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
            amount: Number(this.data.previewAmount || form.amount || 0)
          }
        }
      });
      wx.showModal({
        title: "记录已保存",
        content: res.result.data.message,
        confirmText: "复制备注",
        success: (modal) => {
          if (modal.confirm) {
            wx.setClipboardData({ data: res.result.data.message });
          }
          this.setData({
            form: { memberKey: "", product: "", quantity: 1, amount: "" },
            previewAmount: "0.00",
            previewPoints: 0
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
