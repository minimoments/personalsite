/* 渲染逻辑：读取 window.SITE_DATA（来自 data/*.js），把各区块渲染进 #app。
 * 视觉细节（配色/圆角/间距/字体）全部在 styles.css 里，与设计稿 1:1。 */

(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function editorQs() {
    try {
      return new URLSearchParams(location.search).has("editor") ? "?editor" : "";
    } catch (e) { return ""; }
  }

  /* ---------- 数据路径工具 ---------- */
  function parsePath(path) {
    var tokens = [];
    var re = /\.?([^\.\[\]]+)|\[(\d+)\]/g;
    var m;
    while ((m = re.exec(path)) !== null) {
      if (m[1] !== undefined) tokens.push({ type: "key", key: m[1] });
      else if (m[2] !== undefined) tokens.push({ type: "idx", idx: parseInt(m[2], 10) });
    }
    return tokens;
  }

  function getByPath(obj, path) {
    var tokens = parsePath(path);
    var cur = obj;
    for (var i = 0; i < tokens.length; i++) {
      if (cur == null) return undefined;
      var t = tokens[i];
      cur = t.type === "idx" ? cur[t.idx] : cur[t.key];
    }
    return cur;
  }

  function setByPath(obj, path, value) {
    var tokens = parsePath(path);
    var cur = obj;
    for (var i = 0; i < tokens.length - 1; i++) {
      var t = tokens[i];
      cur = t.type === "idx" ? cur[t.idx] : cur[t.key];
      if (cur == null) return;
    }
    var last = tokens[tokens.length - 1];
    if (!last) return;
    if (last.type === "idx") cur[last.idx] = value;
    else cur[last.key] = value;
  }

  function deepClone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
  }

  function removeArrayRoots(obj, rootPaths) {
    var groups = {};
    rootPaths.forEach(function (r) {
      var m = r.match(/\[(\d+)\]$/);
      if (!m) return;
      var idx = parseInt(m[1], 10);
      var base = r.slice(0, r.lastIndexOf("["));
      if (!groups[base]) groups[base] = [];
      groups[base].push(idx);
    });
    Object.keys(groups).forEach(function (base) {
      var arr = getByPath(obj, base);
      if (!Array.isArray(arr)) return;
      groups[base].sort(function (a, b) { return b - a; });
      groups[base].forEach(function (idx) {
        if (idx >= 0 && idx < arr.length) arr.splice(idx, 1);
      });
    });
  }

  /* ---------- HEADER ---------- */
  function renderHeader(p, opts) {
    opts = opts || {};
    var home = opts.homeLink || "";
    var qs = editorQs();
    var base = home.split("#")[0] || "";
    if (base && qs) base += qs;

    var nav = p.nav.map(function (n) {
      var href = home
        ? (n.id === "top" ? base : base + "#" + n.id)
        : "#" + n.id;
      return '<a href="' + esc(href) + '">' + esc(n.label) + "</a>";
    }).join("");

    var themeBtn =
      '<button class="theme-toggle" type="button" aria-label="切换主题" title="切换主题">' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' +
      "</button>";

    return (
      '<nav class="header">' +
        '<div class="wordmark">' + esc(p.wordmark) + "</div>" +
        '<div class="nav">' + nav + "</div>" +
        '<div class="header-actions">' +
          themeBtn +
        "</div>" +
      "</nav>"
    );
  }

  /* ---------- HERO ---------- */
  var ICONS = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    expand: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/><line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2"/></svg>',
    volume: '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>'
  };

  function renderHero(p) {
    var chips = p.hero.techTags.map(function (t, i) {
      return '<span class="chip" data-edit="profile.hero.techTags[' + i + ']" data-edit-root="profile.hero.techTags[' + i + ']">' + esc(t) + "</span>";
    }).join("");

    return (
      '<header class="hero">' +
        '<div class="wrap">' +
          renderHeader(p) +
          '<div class="hero-body">' +
            '<div class="hero-left">' +
              '<div class="eyebrow" data-edit="profile.hero.eyebrow">' + esc(p.hero.eyebrow) + "</div>" +
              '<h1 class="name" data-edit="profile.hero.name">' + esc(p.hero.name) + "</h1>" +
              '<div class="role" data-edit="profile.hero.role">' + esc(p.hero.role) + "</div>" +
              '<p class="tagline" data-edit="profile.hero.tagline">' + esc(p.hero.tagline) + "</p>" +
              '<p class="bio" data-edit="profile.hero.bio">' + esc(p.hero.bio) + "</p>" +
              '<div class="tech-tags">' + chips + "</div>" +
              '<div class="hero-ctas">' +
                '<a href="#projects" class="btn btn-primary">查看项目</a>' +
                '<a href="#contact" class="btn btn-ghost">聊聊合作</a>' +
              "</div>" +
            "</div>" +
            '<div class="hero-right" aria-hidden="true"></div>' +
          "</div>" +
        "</div>" +
      "</header>"
    );
  }

  /* ---------- ABOUT ---------- */
  function renderAbout(a) {
    var stats = a.stats.map(function (s, i) {
      var root = "about.stats[" + i + "]";
      return (
        '<div class="stat" data-edit-root="' + root + '">' +
          '<div class="stat-num' + (s.mono ? " mono" : "") + '" data-edit="about.stats[' + i + '].num" data-edit-root="' + root + '">' + esc(s.num) + "</div>" +
          '<div class="stat-label" data-edit="about.stats[' + i + '].label" data-edit-root="' + root + '">' + esc(s.label) + "</div>" +
        "</div>"
      );
    }).join("");

    return (
      '<section id="about" class="section bg-light">' +
        '<div class="section-inner about-inner">' +
          '<div class="about-left">' +
            '<div class="sec-eyebrow" data-edit="about.eyebrow">' + esc(a.eyebrow) + "</div>" +
            '<h2 class="sec-heading" data-edit="about.heading">' + esc(a.heading) + "</h2>" +
          "</div>" +
          '<div class="about-right">' +
            '<p class="about-body" data-edit="about.body">' + esc(a.body) + "</p>" +
            '<div class="stats">' + stats + "</div>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- SKILLS ---------- */
  function skillCard(c, i) {
    var root = "skills.cards[" + i + "]";
    return (
      '<div class="skill-card" data-edit-root="' + root + '">' +
        '<div class="card-label" data-edit="skills.cards[' + i + '].label" data-edit-root="' + root + '">' + esc(c.label) + "</div>" +
        '<div class="card-title" data-edit="skills.cards[' + i + '].title" data-edit-root="' + root + '">' + esc(c.title) + "</div>" +
        '<div class="card-line" data-edit="skills.cards[' + i + '].line" data-edit-root="' + root + '">' + esc(c.line) + "</div>" +
      "</div>"
    );
  }
  function renderSkills(s) {
    var left = "", right = "";
    s.cards.forEach(function (c, i) {
      var card = skillCard(c, i);
      if (i < 2) left += card; else right += card;
    });
    return (
      '<section id="skills" class="section bg-white">' +
        '<div class="section-inner">' +
          '<div class="sec-header">' +
            '<div class="sec-eyebrow" data-edit="skills.eyebrow">' + esc(s.eyebrow) + "</div>" +
            '<h2 class="sec-heading" data-edit="skills.heading">' + esc(s.heading) + "</h2>" +
          "</div>" +
          '<div class="bento">' +
            '<div class="bento-col left">' + left + "</div>" +
            '<div class="bento-col right">' + right + "</div>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- EXPERIENCE ---------- */
  function renderExperience(e) {
    var entries = e.entries.map(function (en, i) {
      var root = "experience.entries[" + i + "]";
      return (
        '<div class="entry" data-edit-root="' + root + '">' +
          '<div class="entry-date" data-edit="experience.entries[' + i + '].date" data-edit-root="' + root + '">' + esc(en.date) + "</div>" +
          '<div class="entry-right">' +
            '<div class="entry-title" data-edit="experience.entries[' + i + '].title" data-edit-root="' + root + '">' + esc(en.title) + "</div>" +
            '<p class="entry-desc" data-edit="experience.entries[' + i + '].desc" data-edit-root="' + root + '">' + esc(en.desc) + "</p>" +
          "</div>" +
        "</div>"
      );
    }).join("");

    return (
      '<section id="experience" class="section bg-light">' +
        '<div class="section-inner">' +
          '<div class="sec-header">' +
            '<div class="sec-eyebrow" data-edit="experience.eyebrow">' + esc(e.eyebrow) + "</div>" +
            '<h2 class="sec-heading" data-edit="experience.heading">' + esc(e.heading) + "</h2>" +
          "</div>" +
          '<div class="timeline">' + entries + "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- PROJECTS (精选项目) ---------- */
  function projControls(type, dotsHtml) {
    if (type === "video") {
      var center = dotsHtml ? '<div class="proj-controls-center">' + dotsHtml + "</div>" : "";
      return (
        '<div class="proj-controls">' +
          '<div class="proj-controls-left">' +
            '<button class="proj-ctrl left-ctrl" type="button" aria-label="播放" data-action="play">' + ICONS.play + "</button>" +
            '<button class="proj-ctrl mute-ctrl" type="button" aria-label="取消静音" data-action="mute">' + ICONS.mute + "</button>" +
          "</div>" +
          center +
          '<button class="proj-ctrl right-ctrl" type="button" aria-label="全屏" data-action="fullscreen">' + ICONS.fullscreen + "</button>" +
        "</div>"
      );
    }
    // 图片项目：中间圆点，右侧图库按钮打开灯箱；悬浮箭头负责上一张/下一张
    return (
      '<div class="proj-controls">' +
        '<div class="proj-controls-spacer" aria-hidden="true"></div>' +
        '<div class="proj-controls-center">' + (dotsHtml || "") + "</div>" +
        '<button class="proj-ctrl right-ctrl" type="button" aria-label="查看大图" data-action="gallery">' + ICONS.fullscreen + "</button>" +
      "</div>"
    );
  }

  function renderMedia(m) {
    if (m && m.type === "video") {
      return (
        '<video class="proj-video" muted playsinline preload="metadata" poster="' + esc(m.poster || "") + '">' +
          '<source src="' + esc(m.src) + '" type="video/mp4">' +
        "</video>" + projControls("video")
      );
    }
    var sources = (m && m.sources) || [];
    var imgs = sources.map(function (src, i) {
      return '<img class="proj-img' + (i === 0 ? " is-active" : "") + '" src="' + esc(src) + '" alt="">';
    }).join("");
    if (sources.length <= 1) {
      return '<div class="proj-imgs">' + imgs + "</div>" + projControls("images");
    }
    var dots = sources.map(function (_, i) {
      return '<span class="proj-dot' + (i === 0 ? " is-active" : "") + '" data-index="' + i + '"></span>';
    }).join("");
    return (
      '<div class="proj-imgs">' + imgs + "</div>" +
      '<button class="proj-arrow prev" type="button" aria-label="上一张">' + ICONS.prev + "</button>" +
      '<button class="proj-arrow next" type="button" aria-label="下一张">' + ICONS.next + "</button>" +
      projControls("images", dots)
    );
  }

  function renderProjectCard(it, i) {
    var isVideo = it.media && it.media.type === "video";
    var placeholderTag = it.placeholder ? '<span class="proj-placeholder">示例素材</span>' : "";
    var idx = (typeof i === "number") ? i : 0;
    var root = "projects.items[" + idx + "]";
    return (
      '<article class="proj-card' + (isVideo ? " has-video" : " has-images") + '" data-project-index="' + idx + '" data-edit-root="' + root + '">' +
        placeholderTag +
        '<div class="proj-media" data-project-index="' + idx + '" data-media-path="' + root + '.media">' + renderMedia(it.media) + "</div>" +
        '<a class="proj-text" href="' + esc(it.link || "#") + '">' +
          '<div class="proj-title" data-edit="projects.items[' + idx + '].title" data-edit-root="' + root + '">' + esc(it.title) + "</div>" +
          '<div class="proj-tags" data-edit="projects.items[' + idx + '].tags" data-edit-root="' + root + '">' + esc(it.tags) + "</div>" +
          '<p class="proj-outcome" data-edit="projects.items[' + idx + '].outcome" data-edit-root="' + root + '">' + esc(it.outcome) + "</p>" +
        "</a>" +
      "</article>"
    );
  }

  function renderProjects(pr) {
    var limit = typeof pr.featuredLimit === "number" ? pr.featuredLimit : pr.items.length;
    var featured = pr.items.slice(0, limit);
    var cards = featured.map(function (it, i) { return renderProjectCard(it, i); }).join("");

    var hasMore = pr.items.length > limit;
    var moreUrl = hasMore && pr.moreUrl ? (pr.moreUrl + editorQs()) : "";
    var more = moreUrl
      ? '<a href="' + esc(moreUrl) + '" class="projects-link">' + esc(pr.moreText || "查看更多 →") + "</a>"
      : "";

    return (
      '<section id="projects" class="section bg-white">' +
        '<div class="section-inner">' +
          '<div class="sec-header">' +
            '<div class="sec-eyebrow">' + esc(pr.eyebrow) + "</div>" +
            '<h2 class="sec-heading">' + esc(pr.heading) + "</h2>" +
          "</div>" +
          '<div class="proj-grid">' + cards + "</div>" +
          more +
        "</div>" +
      "</section>"
    );
  }

  function renderProjectsPage(pr, profile) {
    var allCards = pr.items.map(function (it, i) { return renderProjectCard(it, i); }).join("");
    return (
      '<div class="page-projects">' +
        '<div class="wrap">' +
          renderHeader(profile, { homeLink: "index.html" }) +
        "</div>" +
        '<main class="projects-main">' +
          '<div class="section-inner">' +
            '<div class="sec-header">' +
              '<div class="sec-eyebrow">' + esc(pr.eyebrow) + "</div>" +
              '<h2 class="sec-heading">' + esc(pr.pageHeading || pr.heading) + "</h2>" +
            "</div>" +
            '<div class="proj-grid">' + allCards + "</div>" +
            '<div class="projects-page-actions">' +
              '<a href="index.html' + editorQs() + '" class="btn btn-ghost">← 返回首页</a>' +
            "</div>" +
          "</div>" +
        "</main>" +
        renderFooter(profile.footer) +
      "</div>"
    );
  }

  /* ---------- CONTACT ---------- */
  function renderContact(c) {
    var socials = c.socials.map(function (s, i) {
      var root = "contact.socials[" + i + "]";
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" data-edit="contact.socials[' + i + '].label" data-edit-root="' + root + '">' + esc(s.label) + "</a>";
    }).join("");
    return (
      '<section id="contact" class="contact bg-dark">' +
        '<div class="contact-inner">' +
          '<div class="contact-header">' +
            '<div class="sec-eyebrow" data-edit="contact.eyebrow">' + esc(c.eyebrow) + "</div>" +
            '<h2 class="contact-heading" data-edit="contact.heading">' + esc(c.heading) + "</h2>" +
          "</div>" +
          '<p class="contact-body" data-edit="contact.body">' + esc(c.body) + "</p>" +
          '<div class="email-row">' +
            '<span class="email" data-edit="contact.email">' + esc(c.email) + "</span>" +
            '<a href="mailto:' + esc(c.email) + '" class="email-btn">发送邮件</a>' +
          "</div>" +
          '<div class="social-row">' + socials + "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- FOOTER ---------- */
  function renderFooter(f) {
    return (
      '<footer class="footer">' +
        '<div class="footer-left" data-edit="profile.footer.left">' + esc(f.left) + "</div>" +
        '<div class="footer-right" data-edit="profile.footer.right">' + esc(f.right) + "</div>" +
      "</footer>"
    );
  }

  /* ---------- BACK TO TOP ---------- */
  function renderBackToTop() {
    return (
      '<button class="back-to-top" type="button" aria-label="返回顶部">' +
        '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>"
    );
  }

  /* ---------- 交互：导航高亮 ---------- */
  function setupNavHighlight() {
    var ids = (window.SITE_DATA.profile.nav || []).map(function (n) { return n.id; });
    var links = {};
    document.querySelectorAll(".nav a").forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      if (id) links[id] = a;
    });
    function onScroll() {
      var pos = window.scrollY + window.innerHeight * 0.35;
      var current = ids[0] || "";
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= pos) current = ids[i];
      }
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle("active", id === current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ---------- 交互：项目媒体控制 ---------- */
  /* ---------- 交互：媒体灯箱（窗口放大，非全屏，支持图片与视频） ---------- */
  var LIGHTBOX = null;
  var lightboxSources = [];
  var lightboxIdx = 0;

  function ensureLightbox() {
    if (LIGHTBOX) return LIGHTBOX;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<div class="lightbox-backdrop"></div>' +
      '<button class="lightbox-close" type="button" aria-label="关闭">' + ICONS.close + "</button>" +
      '<button class="lightbox-prev" type="button" aria-label="上一张">' + ICONS.prev + "</button>" +
      '<button class="lightbox-next" type="button" aria-label="下一张">' + ICONS.next + "</button>" +
      '<div class="lightbox-stage"></div>';
    document.body.appendChild(box);

    box.querySelector(".lightbox-backdrop").addEventListener("click", closeLightbox);
    box.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    box.querySelector(".lightbox-prev").addEventListener("click", function (e) { e.stopPropagation(); lightboxShow(lightboxIdx - 1); });
    box.querySelector(".lightbox-next").addEventListener("click", function (e) { e.stopPropagation(); lightboxShow(lightboxIdx + 1); });

    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxShow(lightboxIdx - 1);
      if (e.key === "ArrowRight") lightboxShow(lightboxIdx + 1);
    });

    LIGHTBOX = box;
    return LIGHTBOX;
  }

  function lightboxShow(i) {
    if (!LIGHTBOX || !lightboxSources.length) return;
    lightboxIdx = ((i % lightboxSources.length) + lightboxSources.length) % lightboxSources.length;
    var item = lightboxSources[lightboxIdx];
    var stage = LIGHTBOX.querySelector(".lightbox-stage");
    if (item.type === "video") {
      stage.innerHTML = '<video class="lightbox-media" src="' + esc(item.src) + '" controls autoplay muted playsinline></video>';
    } else {
      stage.innerHTML = '<img class="lightbox-img" src="' + esc(item.src) + '" alt="">';
    }
    var multi = lightboxSources.length > 1;
    LIGHTBOX.querySelector(".lightbox-prev").style.display = multi ? "" : "none";
    LIGHTBOX.querySelector(".lightbox-next").style.display = multi ? "" : "none";
  }

  function openLightbox(sources, idx) {
    lightboxSources = sources || [];
    if (!lightboxSources.length) return;
    var box = ensureLightbox();
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lightboxShow(idx || 0);
  }

  function closeLightbox() {
    if (!LIGHTBOX) return;
    LIGHTBOX.classList.remove("is-open");
    document.body.style.overflow = "";
    var v = LIGHTBOX.querySelector("video");
    if (v) { try { v.pause(); } catch (e) {} }
    LIGHTBOX.querySelector(".lightbox-stage").innerHTML = "";
  }

  function setupProjectControls() {
    document.querySelectorAll(".proj-card").forEach(setupProjectControlsForCard);
  }

  function setupProjectControlsForCard(card) {
    if (!card) return;
    var media = card.querySelector(".proj-media");
    var video = card.querySelector(".proj-video");
      var imgsWrap = card.querySelector(".proj-imgs");
      var leftBtn = card.querySelector(".left-ctrl");
      var rightBtn = card.querySelector(".right-ctrl");
      var muteBtn = card.querySelector(".mute-ctrl");

      function updatePlayIcon() {
        if (!video || !leftBtn) return;
        leftBtn.innerHTML = video.paused ? ICONS.play : ICONS.pause;
        leftBtn.setAttribute("data-action", video.paused ? "play" : "pause");
      }

      function updateMuteIcon() {
        if (!video || !muteBtn) return;
        muteBtn.innerHTML = video.muted ? ICONS.mute : ICONS.volume;
        muteBtn.setAttribute("aria-label", video.muted ? "取消静音" : "静音");
      }

      function togglePlay() {
        if (!video) return;
        if (video.paused) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.pause();
        }
      }

      function toggleMute() {
        if (!video) return;
        video.muted = !video.muted;
        updateMuteIcon();
      }

      if (video) {
        leftBtn.innerHTML = ICONS.play;
        updateMuteIcon();
        leftBtn.addEventListener("click", function (e) { e.stopPropagation(); togglePlay(); });
        if (muteBtn) muteBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleMute(); });
        video.addEventListener("click", function (e) { e.stopPropagation(); togglePlay(); });
        video.addEventListener("play", updatePlayIcon);
        video.addEventListener("pause", updatePlayIcon);
        video.addEventListener("volumechange", updateMuteIcon);
        var vSrc = video.querySelector("source") ? video.querySelector("source").getAttribute("src") : "";
        rightBtn.addEventListener("click", function (e) { e.stopPropagation(); openLightbox([{ type: "video", src: vSrc }], 0); });

        // 悬浮预览：鼠标进入自动播放，离开暂停并复位
        if (media) {
          media.addEventListener("mouseenter", function () {
            if (video.paused) {
              var p = video.play();
              if (p && p.catch) p.catch(function () {});
            }
          });
          media.addEventListener("mouseleave", function () {
            video.pause();
            try { video.currentTime = 0; } catch (err) {}
          });
        }
      } else if (imgsWrap) {
        var imgs = Array.from(imgsWrap.querySelectorAll(".proj-img"));
        var dots = Array.from(card.querySelectorAll(".proj-dot"));
        var prevArrow = card.querySelector(".proj-arrow.prev");
        var nextArrow = card.querySelector(".proj-arrow.next");
        var len = imgs.length;
        var idx = 0;
        var timer = null;

        function show(i) {
          idx = ((i % len) + len) % len;
          imgs.forEach(function (img, k) { img.classList.toggle("is-active", k === idx); });
          dots.forEach(function (dot, k) { dot.classList.toggle("is-active", k === idx); });
        }
        function next() { show(idx + 1); }
        function prev() { show(idx - 1); }

        function startAutoplay() {
          stopAutoplay();
          if (len > 1) timer = setInterval(next, 1500);
        }
        function stopAutoplay() {
          if (timer) { clearInterval(timer); timer = null; }
        }

        function openCurrentLightbox() {
          var items = imgs.map(function (img) { return { type: "image", src: img.src }; });
          openLightbox(items, idx);
        }

        if (len > 1) {
          if (prevArrow) prevArrow.addEventListener("click", function (e) { e.stopPropagation(); prev(); });
          if (nextArrow) nextArrow.addEventListener("click", function (e) { e.stopPropagation(); next(); });
          dots.forEach(function (dot) {
            dot.addEventListener("click", function (e) { e.stopPropagation(); show(parseInt(dot.dataset.index, 10)); });
          });
          // 悬浮时自动轮播，移开停止
          if (media) {
            media.addEventListener("mouseenter", startAutoplay);
            media.addEventListener("mouseleave", stopAutoplay);
          }
        }
        if (rightBtn) rightBtn.addEventListener("click", function (e) { e.stopPropagation(); openCurrentLightbox(); });

        // 点击图片本身在窗口内放大查看
        imgsWrap.addEventListener("click", function (e) { e.stopPropagation(); openCurrentLightbox(); });
      }
  }

  /* ---------- 交互：返回顶部 ---------- */
  function setupBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle("is-visible", window.scrollY > window.innerHeight);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }

  /* ---------- 交互：主题切换 ---------- */
  function setupThemeToggle() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    var html = document.documentElement;
    function apply(theme) {
      html.classList.remove("theme-dark", "theme-light");
      html.classList.add("theme-" + theme);
      try { localStorage.setItem("site-theme", theme); } catch (e) {}
      btn.classList.toggle("is-dark", theme === "dark");
      btn.classList.toggle("is-light", theme === "light");
    }
    btn.addEventListener("click", function () {
      var current = html.classList.contains("theme-light") ? "light" : "dark";
      apply(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------- 导航点击平滑滚动（首页 → 顶部；其余 → 对应区块） ---------- */
  function setupNavScroll() {
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href") || "";
        // 跨页链接（如 projects.html 中的 index.html#about）交给浏览器处理
        if (!href.startsWith("#")) return;
        var id = href.replace("#", "");
        e.preventDefault();
        if (id === "top" || id === "") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ---------- 编辑模式：?editor 时启用，单代码库，在原位改内容 ---------- */
  function setupInlineEditor() {
    var isProjectsPage = document.getElementById("app") && document.getElementById("app").getAttribute("data-page") === "projects";
    var targets = [
      { key: "profile",    header: ".hero .hero-left",        root: ".hero", addArray: "profile.hero.techTags", addDefault: "新标签" },
      { key: "profile",    header: ".footer",                 root: ".footer" },
      { key: "about",      header: "#about .about-left",      root: "#about", addArray: "about.stats", addDefault: { num: "0", label: "新指标", mono: false } },
      { key: "skills",     header: "#skills .sec-header",     root: "#skills", addArray: "skills.cards", addDefault: { label: "NEW", title: "新技能", line: "描述" } },
      { key: "experience", header: "#experience .sec-header", root: "#experience", addArray: "experience.entries", addDefault: { date: "20xx", title: "新经历", desc: "描述" } },
      { key: "projects",   header: isProjectsPage ? ".projects-main .sec-header" : "#projects .sec-header", root: isProjectsPage ? ".projects-main" : "#projects", addArray: "projects.items", addDefault: { title: "新项目", tags: "Tag", outcome: "描述", link: "#", placeholder: true, media: { type: "images", sources: ["assets/projects/t1.png"] } } },
      { key: "contact",    header: "#contact .contact-header", root: "#contact", addArray: "contact.socials", addDefault: { label: "新链接", url: "#" } }
    ];

    var active = null; // { rootEl, key, originalData, originalTexts, deleteRoots }

    function stopAllLinksInEdit(e) {
      var t = e.target;
      if (t.closest && (
        t.closest("a.proj-text") ||
        t.closest(".social-row a") ||
        t.closest(".email-btn")
      )) {
        // 允许文件选择器正常工作
        if (t.tagName === "INPUT" && t.type === "file") return;
        e.preventDefault();
      }
    }
    document.addEventListener("click", stopAllLinksInEdit, true);

    function exitOthers(currentRoot) {
      if (!active) return;
      if (active.rootEl === currentRoot) return;
      cancelModule(active);
    }

    function makeEditable(rootEl) {
      rootEl.querySelectorAll("[data-edit]").forEach(function (el) {
        el.setAttribute("contenteditable", "true");
      });
    }

    function makeReadonly(rootEl) {
      rootEl.querySelectorAll("[data-edit]").forEach(function (el) {
        el.removeAttribute("contenteditable");
      });
    }

    function addDeleteButtons(rootEl, t) {
      var container = rootEl;
      var handles = [];
      container.querySelectorAll("[data-edit]").forEach(function (el) {
        var rootPath = el.getAttribute("data-edit-root");
        if (!rootPath) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ed-delete";
        btn.setAttribute("aria-label", "删除");
        btn.setAttribute("contenteditable", "false");
        btn.setAttribute("tabindex", "-1");
        btn.innerHTML = "×";
        btn.setAttribute("data-delete-root", rootPath);
        // 把删除按钮放到元素内部右上角，避免绝对定位受父级影响
        el.style.position = "relative";
        el.appendChild(btn);
        handles.push({ el: el, btn: btn });
      });
      return handles;
    }

    function removeDeleteButtons(handles) {
      handles.forEach(function (h) {
        if (h.btn.parentNode) h.btn.parentNode.removeChild(h.btn);
      });
    }

    function markRootDeleted(rootEl, rootPath, delSet) {
      delSet.add(rootPath);
      rootEl.querySelectorAll('[data-edit-root="' + rootPath + '"]').forEach(function (el) {
        el.classList.add("ed-deleted");
      });
    }

    function unmarkAllDeleted(rootEl) {
      rootEl.querySelectorAll(".ed-deleted").forEach(function (el) {
        el.classList.remove("ed-deleted");
      });
    }

    function buildProjectsMediaEditor(rootEl) {
      var editors = [];
      rootEl.querySelectorAll(".proj-card").forEach(function (card) {
        var idx = parseInt(card.getAttribute("data-project-index"), 10);
        if (isNaN(idx)) return;
        var mediaEl = card.querySelector(".proj-media");
        if (!mediaEl) return;
        var item = getByPath(window.SITE_DATA, "projects.items[" + idx + "]");
        if (!item) return;

        var overlay = document.createElement("div");
        overlay.className = "proj-media-editor";
        var rootPath = card.getAttribute("data-edit-root");

        function updateOverlay() {
          var html = '<div class="pme-title">项目素材</div>';
          if (item.media && item.media.type === "video") {
            html +=
              '<label class="pme-row">' +
                '<span>替换视频</span>' +
                '<input type="file" accept="video/mp4" data-pme-action="video" data-pme-idx="' + idx + '">' +
              '</label>' +
              '<div class="pme-filename">' + (item.media.src || "") + "</div>" +
              '<label class="pme-row">' +
                '<span>替换封面</span>' +
                '<input type="file" accept="image/*" data-pme-action="poster" data-pme-idx="' + idx + '">' +
              '</label>' +
              '<div class="pme-filename">' + (item.media.poster || "") + "</div>";
          } else {
            var imgs = (item.media && item.media.sources) || [];
            html += '<div class="pme-thumbs">';
            imgs.forEach(function (src, i) {
              html +=
                '<div class="pme-thumb" data-thumb-idx="' + i + '" data-project-idx="' + idx + '">' +
                  '<img src="' + esc(src) + '" alt="">' +
                  '<button type="button" class="pme-thumb-del" data-thumb-idx="' + i + '" data-project-idx="' + idx + '">×</button>' +
                "</div>";
            });
            html += "</div>";
            html +=
              '<label class="pme-row">' +
                '<span>添加图片</span>' +
                '<input type="file" accept="image/*" multiple data-pme-action="images" data-pme-idx="' + idx + '">' +
              '</label>';
          }
          html +=
            '<button type="button" class="pme-delete-project" data-delete-root="' + (rootPath || "") + '">' +
              '删除整个项目' +
            '</button>';
          overlay.innerHTML = html;
          bindOverlay(overlay);
        }

        function bindOverlay(overlay) {
          overlay.querySelectorAll('input[type="file"]').forEach(function (input) {
            input.addEventListener("change", function () {
              var action = input.getAttribute("data-pme-action");
              var pidx = parseInt(input.getAttribute("data-pme-idx"), 10);
              var files = Array.from(input.files || []);
              if (!files.length) return;
              uploadFiles(files, action, pidx, updateOverlay);
              input.value = "";
            });
          });
          overlay.querySelectorAll(".pme-thumb-del").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
              e.stopPropagation();
              var pidx = parseInt(btn.getAttribute("data-project-idx"), 10);
              var thumbIdx = parseInt(btn.getAttribute("data-thumb-idx"), 10);
              var itm = getByPath(window.SITE_DATA, "projects.items[" + pidx + "]");
              if (itm && itm.media && Array.isArray(itm.media.sources)) {
                itm.media.sources.splice(thumbIdx, 1);
                refreshProjectCardMedia(card, itm);
                updateOverlay();
              }
            });
          });
          overlay.querySelectorAll(".pme-delete-project").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
              e.stopPropagation();
              var r = btn.getAttribute("data-delete-root");
              if (active && r) markRootDeleted(rootEl, r, active.deleteRoots);
            });
          });
        }

        updateOverlay();
        mediaEl.appendChild(overlay);
        editors.push({ mediaEl: mediaEl, overlay: overlay });
      });
      return editors;
    }

    function refreshProjectCardMedia(card, item) {
      var mediaEl = card.querySelector(".proj-media");
      if (!mediaEl) return;
      var overlay = mediaEl.querySelector(".proj-media-editor");
      mediaEl.innerHTML = renderMedia(item.media);
      if (overlay) mediaEl.appendChild(overlay);
      setupProjectControlsForCard(card);
    }

    function uploadFiles(files, action, pidx, done) {
      var itm = getByPath(window.SITE_DATA, "projects.items[" + pidx + "]");
      if (!itm) return;
      var pending = files.length;
      var uploaded = [];
      files.forEach(function (file) {
        var fd = new FormData();
        fd.append("file", file);
        fetch("/api/upload", { method: "POST", body: fd })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j.ok) uploaded.push(j.url);
            pending--;
            if (pending === 0) {
              applyUploadedMedia(action, itm, uploaded);
              var card = document.querySelector('.proj-card[data-project-index="' + pidx + '"]');
              if (card) refreshProjectCardMedia(card, itm);
              if (done) done();
            }
          })
          .catch(function () {
            pending--;
            if (pending === 0) {
              applyUploadedMedia(action, itm, uploaded);
              var card = document.querySelector('.proj-card[data-project-index="' + pidx + '"]');
              if (card) refreshProjectCardMedia(card, itm);
              if (done) done();
            }
          });
      });
    }

    function applyUploadedMedia(action, item, urls) {
      if (!urls.length) return;
      if (action === "video") {
        item.media = item.media || {};
        item.media.type = "video";
        item.media.src = urls[0];
        if (!item.media.poster) item.media.poster = "";
      } else if (action === "poster") {
        item.media = item.media || {};
        if (item.media.type !== "video") item.media.type = "video";
        item.media.poster = urls[0];
      } else if (action === "images") {
        if (!item.media || item.media.type !== "images") {
          item.media = { type: "images", sources: [] };
        }
        item.media.sources = (item.media.sources || []).concat(urls);
      }
    }

    function collectDeletions(rootEl) {
      function elText(el) {
        var clone = el.cloneNode(true);
        var d = clone.querySelector(".ed-delete");
        if (d && d.parentNode) d.parentNode.removeChild(d);
        return clone.textContent.trim();
      }
      var del = new Set();
      // 显式被标记删除的 root
      rootEl.querySelectorAll(".ed-deleted").forEach(function (el) {
        var r = el.getAttribute("data-edit-root");
        if (r) del.add(r);
      });
      // 单字段数组项被清空也视为删除
      rootEl.querySelectorAll("[data-edit-root]").forEach(function (el) {
        if (el.classList.contains("ed-deleted")) return;
        var root = el.getAttribute("data-edit-root");
        var path = el.getAttribute("data-edit");
        if (!root || !path) return;
        // 路径本身就是数组项根：如 profile.hero.techTags[0]
        if (path === root && elText(el) === "") del.add(root);
      });
      // 多字段数组项：所有可见字段都为空则删除整个项（项目除外，避免误删媒体）
      var roots = {};
      rootEl.querySelectorAll("[data-edit-root]").forEach(function (el) {
        if (el.classList.contains("ed-deleted")) return;
        var root = el.getAttribute("data-edit-root");
        if (!roots[root]) roots[root] = [];
        roots[root].push(el);
      });
      Object.keys(roots).forEach(function (root) {
        if (root.indexOf("projects.items[") === 0) return;
        var els = roots[root];
        var allEmpty = els.every(function (el) { return elText(el) === ""; });
        if (allEmpty) del.add(root);
      });
      return del;
    }

    function cleanTextOf(el) {
      var clone = el.cloneNode(true);
      var d = clone.querySelector(".ed-delete");
      if (d && d.parentNode) d.parentNode.removeChild(d);
      return clone.textContent.replace(/\u00d7/g, "").trim();
    }

    function saveModule(t, rootEl, delSet) {
      var dataKey = t.key;
      // 先应用文本改动（排除已删除的 root），并去掉删除按钮的“×”字符
      rootEl.querySelectorAll("[data-edit]").forEach(function (el) {
        if (el.classList.contains("ed-deleted")) return;
        var root = el.getAttribute("data-edit-root");
        if (root && delSet.has(root)) return;
        setByPath(window.SITE_DATA, el.getAttribute("data-edit"), cleanTextOf(el));
      });
      // 再删除数组项
      if (delSet.size) removeArrayRoots(window.SITE_DATA, Array.from(delSet));

      return fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: dataKey, data: window.SITE_DATA[dataKey] })
      }).then(function (r) { return r.json(); });
    }

    function cancelModule(state) {
      if (!state) return;
      // 恢复数据
      window.SITE_DATA[state.key] = deepClone(state.originalData);
      // 恢复文本
      state.rootEl.querySelectorAll("[data-edit]").forEach(function (el) {
        var path = el.getAttribute("data-edit");
        if (state.originalTexts.hasOwnProperty(path)) {
          el.textContent = state.originalTexts[path];
        }
      });
      // 恢复项目媒体显示
      if (state.key === "projects") {
        state.rootEl.querySelectorAll(".proj-card").forEach(function (card) {
          var idx = parseInt(card.getAttribute("data-project-index"), 10);
          var itm = getByPath(state.originalData, "items[" + idx + "]");
          if (itm) refreshProjectCardMedia(card, itm);
        });
      }
      cleanupState(state);
      active = null;
    }

    function cleanupState(state) {
      makeReadonly(state.rootEl);
      removeDeleteButtons(state.handles);
      unmarkAllDeleted(state.rootEl);
      state.rootEl.classList.remove("editing");
      if (state.mediaEditors) {
        state.mediaEditors.forEach(function (ed) {
          if (ed.overlay.parentNode) ed.overlay.parentNode.removeChild(ed.overlay);
        });
      }
      state.toolbar.edit.style.display = "";
      state.toolbar.save.style.display = "none";
      state.toolbar.cancel.style.display = "none";
      if (state.toolbar.add) state.toolbar.add.style.display = "none";
    }

    targets.forEach(function (t) {
      var header = document.querySelector(t.header);
      var root = document.querySelector(t.root);
      if (!header || !root) return;
      header.classList.add("ed-host");

      var bar = document.createElement("div");
      bar.className = "ed-toolbar";

      function makeBtn(cls, text) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "ed-btn " + cls;
        b.textContent = text;
        return b;
      }

      var editBtn = makeBtn("ed-edit", "编辑");
      var saveBtn = makeBtn("ed-save", "保存");
      var cancelBtn = makeBtn("ed-cancel", "取消");
      var addBtn = t.addArray ? makeBtn("ed-add", "+ 添加") : null;

      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";
      if (addBtn) addBtn.style.display = "none";

      bar.appendChild(editBtn);
      bar.appendChild(saveBtn);
      bar.appendChild(cancelBtn);
      if (addBtn) bar.appendChild(addBtn);
      header.appendChild(bar);

      var toolbar = { edit: editBtn, save: saveBtn, cancel: cancelBtn, add: addBtn };

      editBtn.addEventListener("click", function () {
        exitOthers(root);
        var originalTexts = {};
        root.querySelectorAll("[data-edit]").forEach(function (el) {
          originalTexts[el.getAttribute("data-edit")] = el.textContent;
        });

        active = {
          rootEl: root,
          key: t.key,
          originalData: deepClone(window.SITE_DATA[t.key]),
          originalTexts: originalTexts,
          toolbar: toolbar,
          deleteRoots: new Set(),
          handles: [],
          mediaEditors: []
        };

        makeEditable(root);
        root.classList.add("editing");
        active.handles = addDeleteButtons(root, t);

        active.handles.forEach(function (h) {
          h.btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var r = h.btn.getAttribute("data-delete-root");
            if (r) markRootDeleted(root, r, active.deleteRoots);
          });
        });

        if (t.key === "projects") {
          active.mediaEditors = buildProjectsMediaEditor(root);
        }

        editBtn.style.display = "none";
        saveBtn.style.display = "";
        cancelBtn.style.display = "";
        if (addBtn) addBtn.style.display = "";
      });

      cancelBtn.addEventListener("click", function () {
        if (active && active.rootEl === root) cancelModule(active);
      });

      saveBtn.addEventListener("click", function () {
        if (!active || active.rootEl !== root) return;
        var delSet = collectDeletions(root);
        saveBtn.disabled = true;
        saveBtn.textContent = "保存中…";
        saveModule(t, root, delSet)
          .then(function (j) {
            if (j.ok) {
              location.reload();
            } else {
              alert("保存失败：" + (j.error || "未知错误"));
              saveBtn.disabled = false;
              saveBtn.textContent = "保存";
            }
          })
          .catch(function (e2) {
            alert("保存失败：" + e2.message);
            saveBtn.disabled = false;
            saveBtn.textContent = "保存";
          });
      });

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          var arr = getByPath(window.SITE_DATA, t.addArray);
          if (!Array.isArray(arr)) return;
          arr.push(deepClone(t.addDefault));
          addBtn.disabled = true;
          addBtn.textContent = "添加中…";
          fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: t.key, data: window.SITE_DATA[t.key] })
          })
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (j.ok) location.reload();
              else { alert("添加失败：" + (j.error || "未知错误")); addBtn.disabled = false; addBtn.textContent = "+ 添加"; }
            })
            .catch(function (e2) { alert("添加失败：" + e2.message); addBtn.disabled = false; addBtn.textContent = "+ 添加"; });
        });
      }
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    var D = window.SITE_DATA || {};
    var root = document.getElementById("app");
    if (!root || !D.profile) return;

    var EDITOR = false;
    try {
      var params = new URLSearchParams(location.search);
      EDITOR = params.has("editor");
    } catch (e) {}
    if (EDITOR) document.body.classList.add("editor-mode");

    var savedTheme = "dark";
    try { savedTheme = localStorage.getItem("site-theme") || "dark"; } catch (e) {}
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add("theme-" + savedTheme);

    if (D.profile.wordmark) document.title = D.profile.wordmark;

    var page = root.getAttribute("data-page");

    if (page === "projects") {
      document.title = (D.projects.pageHeading || D.projects.heading) + " · " + D.profile.wordmark;
      root.innerHTML = renderProjectsPage(D.projects, D.profile);
      setupThemeToggle();
      setupProjectControls();
      setupBackToTop();
      setupNavScroll();
      if (EDITOR) setupInlineEditor();
      return;
    }

    root.innerHTML =
      renderHero(D.profile) +
      renderAbout(D.about) +
      renderSkills(D.skills) +
      renderExperience(D.experience) +
      renderProjects(D.projects) +
      renderContact(D.contact) +
      renderFooter(D.profile.footer) +
      renderBackToTop();

    setupThemeToggle();
    setupNavHighlight();
    setupProjectControls();
    setupBackToTop();
    setupNavScroll();
    if (EDITOR) setupInlineEditor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
