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
  let body = {};
  try {
    body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {};
  } catch (error) {
    // 읽을 수 없는 본문은 식당을 고르지 않은 요청으로 보고 아래에서 400으로 돌려준다.
  }
  const likedId = req.method === "POST" ? body.id : null;

  if (req.method === "POST" && !RESTAURANT_IDS.includes(likedId)) {
    res.status(400).json({ ok: false, message: "알 수 없는 식당입니다." });
    return;
  }

  try {
    const results = await Promise.allSettled(
      RESTAURANT_IDS.map((id) => callAbacus(id === likedId ? "hit" : "get", id, date))
    );
    const counts = {};
    RESTAURANT_IDS.forEach((id, index) => {
      if (results[index].status === "fulfilled") {
        counts[id] = results[index].value;
        return;
      }
      // 좋아요는 올라갔는데 다른 식당 숫자만 못 읽은 경우는 성공으로 돌려준다.
      // 실패로 돌려주면 다시 눌러 두 번 올라간다. 못 읽은 숫자는 빼고 보내면 화면이 보이던 값을 유지한다.
      if (!likedId || id === likedId) throw results[index].reason;
    });

    // 여러 사람이 동시에 열어도 Abacus 호출이 늘지 않게 읽기 결과만 잠깐 저장한다.
    res.setHeader("Cache-Control", req.method === "GET" ? "public, max-age=0, s-maxage=15" : "no-store");
    res.status(200).json({ ok: true, date, counts });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ ok: false, message: "좋아요를 처리하지 못했습니다." });
  }
};
