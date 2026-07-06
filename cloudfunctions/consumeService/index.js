const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

function money(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function updateLevel(points) {
  if (points >= 1200) return "黑卡";
  if (points >= 700) return "金卡";
  if (points >= 300) return "银卡";
  return "普通";
}

function reminderMessage(member, record, balanceAfter, pointsAfter) {
  return `【徐大源手工冰棍】${member.name}您好，您于${record.createdAt}购买${record.product}，本次消费¥${money(record.amount)}，账户余额¥${money(balanceAfter)}，当前积分${pointsAfter}分。感谢光临！`;
}

async function create(record) {
  const members = await db.collection("members").where(
    _.or([
      { memberNo: record.memberKey },
      { phone: record.memberKey }
    ])
  ).limit(1).get();

  if (!members.data.length) throw new Error("没有找到该会员");
  const member = members.data[0];
  const amount = Number(record.amount || 0);
  const balanceBefore = Number(member.balance || 0);
  if (record.payType === "balance" && balanceBefore < amount) {
    throw new Error(`余额不足，当前余额¥${money(balanceBefore)}`);
  }

  const balanceAfter = record.payType === "balance" ? Number((balanceBefore - amount).toFixed(2)) : balanceBefore;
  const pointsEarned = Math.floor(amount);
  const pointsAfter = Number(member.points || 0) + pointsEarned;
  const createdAt = formatDate();
  const level = updateLevel(pointsAfter);

  const consumptionRecord = {
    memberId: member._id,
    memberNo: member.memberNo,
    memberName: member.name,
    phone: member.phone,
    product: record.product,
    quantity: Number(record.quantity || 1),
    amount,
    payType: record.payType,
    balanceBefore,
    balanceAfter,
    pointsEarned,
    createdAt,
    createdTime: new Date()
  };

  await db.collection("consumption_records").add({ data: consumptionRecord });
  await db.collection("members").doc(member._id).update({
    data: {
      balance: balanceAfter,
      points: pointsAfter,
      spent: Number(member.spent || 0) + amount,
      level,
      status: "活跃",
      lastVisit: createdAt,
      updatedAt: new Date()
    }
  });

  const message = reminderMessage(member, consumptionRecord, balanceAfter, pointsAfter);
  await db.collection("reminders").add({
    data: {
      memberId: member._id,
      memberName: member.name,
      phone: member.phone,
      message,
      amount,
      balanceAfter,
      pointsAfter,
      status: "待通知",
      createdAt,
      createdTime: new Date()
    }
  });

  return { message, balanceAfter: money(balanceAfter), pointsAfter };
}

exports.main = async (event) => {
  if (event.action === "create") return { data: await create(event.record) };
  throw new Error(`Unsupported action: ${event.action}`);
};
