const LUNCH_SOURCES = [
  {
    id: "dtech",
    name: "\uB514\uD14C\uD06C \uAD6C\uB0B4\uC2DD\uB2F9",
    channelUrl: "https://pf.kakao.com/_nkwxeG",
    fetchUrl: "https://pf.kakao.com/_nkwxeG",
  },
  {
    id: "cookingtree",
    name: "\uCFE0\uD0B9\uD2B8\uB9AC \uAD6C\uB0B4\uC2DD\uB2F9",
    channelUrl: "https://pf.kakao.com/_eAqyxj",
    fetchUrl: "https://pf.kakao.com/_eAqyxj",
  },
];

function normalizeKakaoImageUrl(url) {
  if (!url) return "";
  return url
    .replace(/^http:\/\//i, "https://")
    .replace(/\/img_m\.jpg(\?.*)?$/i, "/img_xl.jpg");
}

function extractMetaContent(html, propertyName) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${propertyName}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${propertyName}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${propertyName}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${propertyName}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) return match[1];
  }

  return "";
}

async function fetchLunchItem(source) {
  try {
    const response = await fetch(source.fetchUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; coffee-cleaner-bot/1.0; +https://vercel.com)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const imageUrl = normalizeKakaoImageUrl(
      extractMetaContent(html, "og:image") || extractMetaContent(html, "twitter:image")
    );

    if (!imageUrl) {
      return {
        id: source.id,
        name: source.name,
        channelUrl: source.channelUrl,
        error: true,
        message: "\uD504\uB85C\uD544 \uC774\uBBF8\uC9C0\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      };
    }

    return {
      id: source.id,
      name: source.name,
      title: extractMetaContent(html, "og:title") || source.name,
      description: extractMetaContent(html, "og:description") || "\uCC44\uB110 \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0",
      imageUrl,
      dateText: "\uCC44\uB110 \uD504\uB85C\uD544 \uC774\uBBF8\uC9C0",
      linkUrl: source.channelUrl,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      id: source.id,
      name: source.name,
      channelUrl: source.channelUrl,
      error: true,
      message: "\uBA54\uB274 \uC774\uBBF8\uC9C0\uB97C \uAC00\uC838\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
      fetchedAt: new Date().toISOString(),
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method Not Allowed" });
    return;
  }

  try {
    const items = await Promise.all(LUNCH_SOURCES.map(fetchLunchItem));

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).json({
      ok: true,
      items,
      lastRefreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
