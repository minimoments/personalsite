/*
 * 本地数据编辑器后端。
 *
 * 作用：
 *   1) 提供静态文件服务（index.html / editor.html / styles.css / data/*.js / assets/*）；
 *   2) GET  /api/load  —— 读取 data/*.js，解析成 JSON 返回给编辑器；
 *   3) POST /api/save  —— 接收 { key, data }，把数据写回对应的 data/*.js。
 *
 * 注意：这是一个本地工具，需要 Node 运行。GitHub Pages 是纯静态、没有后端，
 *       所以这个 server 只在你本地用来“填表改数据”，改完的数据文件照常 push 到 Pages。
 *
 * 运行： node server.js   （默认端口 4321，可用 PORT 环境变量覆盖）
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const PORT = process.env.PORT || 4321;
const UPLOAD_DIR = path.join(ROOT, "assets", "projects");

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 简单的 multipart/form-data 解析器（仅支持单文件字段，足够本地上传用）
function parseMultipart(req, cb) {
  const ct = req.headers["content-type"] || "";
  const m = ct.match(/boundary=([^;\s]+)/);
  if (!m) return cb(new Error("missing boundary"));
  const boundary = "--" + m[1];
  const boundaryEnd = boundary + "--";
  const chunks = [];
  req.on("data", function (c) { chunks.push(c); });
  req.on("end", function () {
    const buf = Buffer.concat(chunks);
    const text = buf.toString("binary");
    const parts = text.split(boundary).filter(function (p) {
      return p && p.trim() !== "--" && p.indexOf("Content-Disposition") !== -1;
    });
    if (!parts.length) return cb(new Error("no parts"));
    const part = parts[0];
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd === -1) return cb(new Error("invalid part"));
    const headers = part.slice(0, headerEnd);
    const body = part.slice(headerEnd + 4);
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]*)"/);
    const name = nameMatch ? nameMatch[1] : "file";
    const filename = filenameMatch ? filenameMatch[1] : "upload.bin";
    // 去掉末尾可能的 \r\n
    let cleanBody = body;
    if (cleanBody.endsWith("\r\n")) cleanBody = cleanBody.slice(0, -2);
    cb(null, {
      name: name,
      filename: filename,
      // 转回 Buffer 时按原始 binary 长度截取，避免 UTF-8 转换导致文件损坏
      buffer: Buffer.from(cleanBody, "binary")
    });
  });
}

// key 与文件的映射（文件名 basename 即 key）
const MANIFEST = [
  { key: "profile",    file: "data/profile.js",    label: "个人资料" },
  { key: "about",      file: "data/about.js",      label: "关于我" },
  { key: "skills",     file: "data/skills.js",     label: "技能栈" },
  { key: "experience", file: "data/experience.js", label: "经历" },
  { key: "projects",   file: "data/projects.js",   label: "项目" },
  { key: "contact",    file: "data/contact.js",    label: "联系" }
];

// 读取单个 data 文件，返回对应 key 的对象
function loadKey(item) {
  const full = path.join(ROOT, item.file);
  const src = fs.readFileSync(full, "utf8");
  // 用 vm 在隔离沙箱里跑脚本，window 指向沙箱自身，从而裸 SITE_DATA 也能解析
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.console = console;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  const SD = sandbox.SITE_DATA || {};
  return SD[item.key];
}

// 把数据写回对应的 data 文件：保留顶部注释与 window.SITE_DATA 行，只替换对象值
function saveKey(key, data) {
  const item = MANIFEST.find(function (m) { return m.key === key; });
  if (!item) throw new Error("未知的数据块: " + key);
  const full = path.join(ROOT, item.file);
  const src = fs.readFileSync(full, "utf8");
  const marker = "SITE_DATA." + key + " =";
  const idx = src.indexOf(marker);
  if (idx === -1) throw new Error("在 " + item.file + " 中找不到 " + marker);
  const head = src.slice(0, idx); // 顶部注释 + window.SITE_DATA 行 + 空行
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(full, head + marker + " " + json + ";\n", "utf8");
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const ALLOWED_UPLOAD_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4"];
const ALLOWED_UPLOAD_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4"
};

function safeUploadFilename(original) {
  const ext = path.extname(original).toLowerCase();
  const base = path.basename(original, ext).replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "_").slice(0, 40) || "file";
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 10000).toString(36);
  return base + "-" + stamp + rand + ext;
}

const server = http.createServer(function (req, res) {
  const url = req.url.split("?")[0];

  // ---------- API: 上传图片/视频 ----------
  if (req.method === "POST" && url === "/api/upload") {
    parseMultipart(req, function (err, file) {
      try {
        if (err) throw err;
        const ext = path.extname(file.filename).toLowerCase();
        if (!ALLOWED_UPLOAD_EXT.includes(ext)) {
          throw new Error("不支持的文件类型：" + ext);
        }
        if (file.buffer.length > 80 * 1024 * 1024) {
          throw new Error("文件超过 80MB 限制");
        }
        const destName = safeUploadFilename(file.filename);
        const destPath = path.join(UPLOAD_DIR, destName);
        fs.writeFileSync(destPath, file.buffer);
        const returnedUrl = "assets/projects/" + destName;
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true, url: returnedUrl }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // ---------- API: 加载全部数据 ----------
  if (req.method === "GET" && url === "/api/load") {
    try {
      const data = {};
      MANIFEST.forEach(function (it) { data[it.key] = loadKey(it); });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ files: MANIFEST.map(function (m) { return { key: m.key, label: m.label }; }), data: data }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---------- API: 保存单个数据块 ----------
  if (req.method === "POST" && url === "/api/save") {
    let body = "";
    req.on("data", function (c) { body += c; });
    req.on("end", function () {
      try {
        const payload = JSON.parse(body);
        const key = payload.key;
        const data = payload.data;
        if (!MANIFEST.some(function (m) { return m.key === key; })) {
          throw new Error("非法 key: " + key);
        }
        saveKey(key, data);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ---------- 静态文件 ----------
  let rel = url === "/" ? "/index.html" : url;
  // 防路径穿越
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safe);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, function (err, buf) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found: " + safe);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(buf);
  });
});

server.listen(PORT, function () {
  console.log("数据编辑器后端已启动");
  console.log("  主页（浏览）:     http://localhost:" + PORT + "/");
  console.log("  主页（编辑模式）: http://localhost:" + PORT + "/?editor");
  console.log("  数据目录: " + path.join(ROOT, "data"));
});
