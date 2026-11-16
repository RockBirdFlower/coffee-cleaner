// 식당별 오늘의 좋아요.
// Abacus는 관리 키 없이는 숫자를 내릴 수 없어 좋아요 취소는 지원하지 않는다.
// 한 사람 한 번은 브라우저가 지키고, 서버는 숫자를 올리고 읽기만 한다.
const { getSeoulDateKey, callAbacus } = require("./_abacus");

// api/lunch.js의 식당 id와 같아야 한다.
const RESTAURANT_IDS = ["dtech", "cookingtree"];

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method Not Allowed" });
    return;
  }

  const date = getSeoulDateKey();
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const likedId = req.method === "POST" ? body.id : null;

  if (req.method === "POST" && !RESTAURANT_IDS.includes(likedId)) {
    res.status(400).json({ ok: false, message: "알 수 없는 식당입니다." });
    return;
  }

  try {
    const values = await Promise.all(
      RESTAURANT_IDS.map((id) => callAbacus(id === likedId ? "hit" : "get", id, date))
    );
    const counts = {};
    RESTAURANT_IDS.forEach((id, index) => {
      counts[id] = values[index];
    });

    // 여러 사람이 동시에 열어도 Abacus 호출이 늘지 않게 읽기 결과만 잠깐 저장한다.
    res.setHeader("Cache-Control", req.method === "GET" ? "public, max-age=0, s-maxage=15" : "no-store");
    res.status(200).json({ ok: true, date, counts });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ ok: false, message: "좋아요를 처리하지 못했습니다." });
  }
};
