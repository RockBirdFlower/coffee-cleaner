// 가입 없이 쓰는 숫자 세기 서비스 Abacus 호출 모음. 좋아요와 방문자 수가 함께 쓴다.
// 파일 이름이 _로 시작해서 Vercel이 API 주소로 만들지 않는다.

const ABACUS_URL = "https://abacus.jasoncameron.dev";
// 로컬 미리보기와 미리보기 배포에서 올린 숫자가 운영 숫자에 섞이지 않게 이름을 나눈다.
const NAMESPACE = process.env.VERCEL_ENV === "production" ? "coffee-cleaner-rw3x" : "coffee-cleaner-rw3x-dev";
const TIMEOUT_MS = 5000;

function getSeoulDateKey() {
  return new Date(Date.now() + 9 * 60 * 60000).toISOString().slice(0, 10);
}

// action: "hit"은 1 올린 뒤의 값, "get"은 현재 값을 돌려준다.
// 숫자 이름에 날짜를 넣어 매일 0부터 시작한다. 지난 숫자는 Abacus가 알아서 지운다.
async function callAbacus(action, name, date) {
  const response = await fetch(`${ABACUS_URL}/${action}/${NAMESPACE}/${name}-${date}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // 아직 한 번도 올리지 않은 숫자는 없는 것으로 나온다.
  if (action === "get" && response.status === 404) return 0;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Number((await response.json()).value) || 0;
}

module.exports = { getSeoulDateKey, callAbacus };
