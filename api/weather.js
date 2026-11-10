// 과천 지식정보타운 일대. 날씨는 동 단위 정밀도면 충분하다.
const LOCATION = { name: "과천", latitude: 37.41, longitude: 126.98 };
const TIMEOUT_MS = 5000;
const LUNCH_HOUR = 12;
const WORK_END_HOUR = 18;

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${LOCATION.latitude}&longitude=${LOCATION.longitude}` +
  "&current=temperature_2m,weather_code" +
  "&hourly=temperature_2m,precipitation_probability,weather_code" +
  "&timezone=Asia%2FSeoul&forecast_days=1";

const AIR_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality" +
  `?latitude=${LOCATION.latitude}&longitude=${LOCATION.longitude}` +
  "&current=pm10,pm2_5&timezone=Asia%2FSeoul";

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// WMO 날씨 코드
function describeWeather(code) {
  if (code === 0) return "맑음";
  if (code === 1) return "대체로 맑음";
  if (code === 2) return "구름 조금";
  if (code === 3) return "흐림";
  if (code === 45 || code === 48) return "안개";
  if (code >= 51 && code <= 57) return "이슬비";
  if (code >= 61 && code <= 67) return "비";
  if (code >= 71 && code <= 77) return "눈";
  if (code >= 80 && code <= 82) return "소나기";
  if (code === 85 || code === 86) return "눈";
  if (code >= 95) return "뇌우";
  return "";
}

// 환경부 예보 등급 기준. 미세먼지와 초미세먼지 중 나쁜 쪽을 따른다.
function dustGrade(pm10, pm25) {
  const grades = ["좋음", "보통", "나쁨", "매우 나쁨"];
  const level = (value, limits) => limits.filter((limit) => value > limit).length;
  return grades[Math.max(level(pm10, [30, 80, 150]), level(pm25, [15, 35, 75]))];
}

function buildWeather(weather) {
  const hours = weather.hourly.time.map((time) => Number(time.slice(11, 13)));
  const currentHour = Number(weather.current.time.slice(11, 13));
  const beforeLunch = currentHour < LUNCH_HOUR + 1;

  // 점심 전에는 점심 무렵, 그 뒤에는 퇴근 때까지 남은 시간의 강수 확률을 본다.
  const from = beforeLunch ? LUNCH_HOUR - 1 : currentHour;
  const to = beforeLunch ? LUNCH_HOUR + 1 : Math.max(currentHour, WORK_END_HOUR);
  const rainChances = weather.hourly.precipitation_probability.filter(
    (chance, index) => hours[index] >= from && hours[index] <= to && chance != null
  );

  const result = {
    location: LOCATION.name,
    now: {
      temperature: Math.round(weather.current.temperature_2m),
      text: describeWeather(weather.current.weather_code),
    },
    rain: {
      label: beforeLunch ? "점심" : currentHour >= WORK_END_HOUR ? "지금" : "오후",
      chance: rainChances.length ? Math.max(...rainChances) : null,
    },
  };

  const lunchIndex = hours.indexOf(LUNCH_HOUR);
  if (currentHour < LUNCH_HOUR && lunchIndex !== -1) {
    result.lunch = {
      temperature: Math.round(weather.hourly.temperature_2m[lunchIndex]),
      text: describeWeather(weather.hourly.weather_code[lunchIndex]),
    };
  }

  return result;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method Not Allowed" });
    return;
  }

  // 미세먼지를 못 받아도 날씨는 보여 준다.
  const [weather, air] = await Promise.allSettled([fetchJson(WEATHER_URL), fetchJson(AIR_URL)]);

  try {
    if (weather.status !== "fulfilled") throw weather.reason;
    const result = buildWeather(weather.value);

    if (air.status === "fulfilled" && air.value.current && air.value.current.pm10 != null && air.value.current.pm2_5 != null) {
      result.dust = dustGrade(air.value.current.pm10, air.value.current.pm2_5);
    }

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=300");
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ ok: false, message: "날씨를 가져오지 못했습니다." });
  }
};
