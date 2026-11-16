// 오늘 방문자 수. 브라우저가 그날 처음 열 때만 POST로 1을 올리고, 그 뒤로는 GET으로 읽기만 한다.
const { getSeoulDateKey, callAbacus } = require("./_abacus");

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method Not Allowed" });
    return;
  }

  const date = getSeoulDateKey();

  try {
    const count = await callAbacus(req.method === "POST" ? "hit" : "get", "visits", date);

    // 여러 사람이 동시에 열어도 Abacus 호출이 늘지 않게 읽기 결과만 잠깐 저장한다.
    res.setHeader("Cache-Control", req.method === "GET" ? "public, max-age=0, s-maxage=60" : "no-store");
    res.status(200).json({ ok: true, date, count });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ ok: false, message: "방문자 수를 처리하지 못했습니다." });
  }
};
