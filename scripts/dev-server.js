// 로컬 미리보기 서버: 정적 파일과 실제 api/lunch.js를 실행한다.
// npm run dev            이 PC에서만 접속
// npm run dev -- --lan   같은 네트워크의 휴대폰에서도 접속
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 3200;
const LAN = process.argv.includes("--lan");
const STATIC_FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
};

function withVercelHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");

    if (pathname === "/api/lunch") {
      // 서버를 재시작하지 않아도 api/lunch.js 수정이 반영되도록 매번 다시 불러온다.
      const handlerPath = path.join(ROOT, "api/lunch.js");
      delete require.cache[require.resolve(handlerPath)];
      await require(handlerPath)(req, withVercelHelpers(res));
      return;
    }

    const file = STATIC_FILES[pathname];
    if (!file) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    res.setHeader("Content-Type", file[1]);
    res.setHeader("Cache-Control", "no-store");
    res.end(fs.readFileSync(path.join(ROOT, file[0])));
  })
  .listen(PORT, LAN ? "0.0.0.0" : "127.0.0.1", () => {
    console.log(`http://127.0.0.1:${PORT}`);
    if (LAN) lanAddresses().forEach((address) => console.log(`http://${address}:${PORT}`));
  });
