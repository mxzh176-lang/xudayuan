const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

function money(value) {
  return Number(value || 0).toFixed(2);
}

function memberNo() {
  return `M${Date.now().toString().slice(-8)}`;
}

async function list(keyword = "", filter = "all") {
  let where = keyword
    ? _.or([
        { name: db.RegExp({ regexp: keyword, options: "i" }) },
        { phone: db.RegExp({ regexp: keyword, options: "i" }) },
        { memberNo: db.RegExp({ regexp: keyword, options: "i" }) }
      ])
    : {};
  if (!keyword && filter === "low") where = { balance: _.lt(20) };
  if (!keyword && filter === "gold") where = _.or([{ level: "金卡" }, { level: "黑卡" }]);
  if (!keyword && filter === "active") where = { status: "活跃" };
  const res = await db.collection("members").where(where).orderBy("updatedAt", "desc").limit(50).get();
  return res.data.map((item) => ({
    ...item,
    balance: money(item.balance),
    spent: money(item.spent)
  }));
}

async function get(id) {
  const res = await db.collection("members").doc(id).get();
  return {
    ...res.data,
    balance: money(res.data.balance),
    spent: money(res.data.spent)
  };
}

async function save(member) {
  const now = new Date();
  const data = {
    memberNo: member.memberNo || memberNo(),
    name: member.name,
    phone: member.phone,
    level: member.level || "普通",
    points: Number(member.points || 0),
    balance: Number(member.balance || 0),
    spent: Number(member.spent || 0),
    birthday: member.birthday || "",
    favorite: member.favorite || "",
    note: member.note || "",
    status: member.status || "活跃",
    updatedAt: now
  };

  if (member._id) {
    await db.collection("members").doc(member._id).update({ data });
    return { _id: member._id };
  }

  data.createdAt = now;
  const res = await db.collection("members").add({ data });
  return { _id: res._id };
}

async function dashboard() {
  const totalMembers = await db.collection("members").count();
  const members = await db.collection("members").limit(1000).get();
  const reminders = await db.collection("reminders").where({ status: "待通知" }).count();
  const totalBalance = members.data.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  const totalSpent = members.data.reduce((sum, item) => sum + Number(item.spent || 0), 0);
  const lowBalanceMembers = members.data
    .filter((item) => Number(item.balance || 0) < 20)
    .slice(0, 5)
    .map((item) => ({ ...item, balance: money(item.balance) }));

  return {
    stats: {
      totalMembers: totalMembers.total,
      totalBalance: money(totalBalance),
      totalSpent: money(totalSpent),
      pendingReminders: reminders.total
    },
    lowBalanceMembers
  };
}

exports.main = async (event) => {
  const action = event.action;
  if (action === "list") return { data: await list(event.keyword, event.filter) };
  if (action === "get") return { data: await get(event.id) };
  if (action === "save") return { data: await save(event.member) };
  if (action === "dashboard") return { data: await dashboard() };
  throw new Error(`Unsupported action: ${action}`);
};
