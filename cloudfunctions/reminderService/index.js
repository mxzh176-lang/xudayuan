const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function listPending() {
  const res = await db.collection("reminders")
    .where({ status: "待通知" })
    .orderBy("createdTime", "desc")
    .limit(50)
    .get();
  return res.data;
}

async function markSent(id) {
  await db.collection("reminders").doc(id).update({
    data: {
      status: "已通知",
      sentAt: new Date()
    }
  });
  return { ok: true };
}

exports.main = async (event) => {
  if (event.action === "listPending") return { data: await listPending() };
  if (event.action === "markSent") return { data: await markSent(event.id) };
  throw new Error(`Unsupported action: ${event.action}`);
};
