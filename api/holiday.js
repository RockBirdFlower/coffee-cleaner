// 오늘이 공휴일인지 알려 준다. 공휴일에는 식당이 쉬어 이전 메뉴가 남아 있을 수 있다.
// 가입 없이 쓰는 Nager.Date에서 받는다. 대체공휴일과 선거일도 들어 있다.
const TIMEOUT_MS = 5000;

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method Not Allowed" });
    return;
  }

  const date = new Date(Date.now() + 9 * 60 * 60000).toISOString().slice(0, 10);

  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${date.slice(0, 4)}/KR`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const today = (await response.json()).find((holiday) => holiday.date === date);

    // 자정을 넘겨 남은 응답은 화면이 date를 보고 버린다.
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
    res.status(200).json({ ok: true, date, holiday: today ? today.localName : null });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ ok: false, message: "공휴일 정보를 가져오지 못했습니다." });
  }
};
