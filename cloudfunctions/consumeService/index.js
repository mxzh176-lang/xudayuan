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

function noteMessage(member, record) {
  const amountText = Number(record.amount || 0) > 0 ? `，记录金额¥${money(record.amount)}` : "";
  return `【徐大源手工冰棍】已记录${member.name}的会员信息：${record.product}${amountText}。`;
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
  const createdAt = formatDate();
  const noteRecord = {
    memberId: member._id,
    memberNo: member.memberNo,
    memberName: member.name,
    phone: member.phone,
    product: record.product,
    quantity: Number(record.quantity || 1),
    amount,
    type: "会员记录",
    createdAt,
    createdTime: new Date()
  };

  await db.collection("member_notes").add({ data: noteRecord });
  await db.collection("members").doc(member._id).update({
    data: {
      spent: Number(member.spent || 0) + amount,
      lastVisit: createdAt,
      updatedAt: new Date()
    }
  });

  const message = noteMessage(member, noteRecord);
  await db.collection("reminders").add({
    data: {
      memberId: member._id,
      memberName: member.name,
      phone: member.phone,
      message,
      amount,
      status: "待通知",
      createdAt,
      createdTime: new Date()
    }
  });

  return { message };
}

exports.main = async (event) => {
  if (event.action === "create") return { data: await create(event.record) };
  throw new Error(`Unsupported action: ${event.action}`);
};
