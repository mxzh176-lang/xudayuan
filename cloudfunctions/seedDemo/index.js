const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const names = ["张小雨", "李一鸣", "王可欣", "赵嘉豪", "陈思源", "刘晓月", "徐明轩", "周若琳", "孙婷婷", "吴佳佳"];
const flavors = ["绿豆", "红豆", "老冰棍", "酸奶草莓", "芒果牛奶", "巧克力", "椰子", "西瓜"];

exports.main = async () => {
  const now = new Date();
  const tasks = Array.from({ length: 20 }, async (_, index) => {
    const spent = Number((80 + index * 18.5).toFixed(2));
    const balance = Number((30 + index * 7.5).toFixed(2));
    const points = Math.floor(spent);
    return db.collection("members").add({
      data: {
        memberNo: `M${String(index + 1).padStart(6, "0")}`,
        name: names[index % names.length],
        phone: `1380000${String(index + 1).padStart(4, "0")}`,
        level: points >= 300 ? "银卡" : "普通",
        points,
        balance,
        spent,
        birthday: `199${index % 10}-0${(index % 9) + 1}-18`,
        favorite: flavors[index % flavors.length],
        note: "演示会员",
        status: "活跃",
        createdAt: now,
        updatedAt: now,
        lastVisit: "2026-07-06"
      }
    });
  });
  await Promise.all(tasks);
  return { count: 20 };
};
