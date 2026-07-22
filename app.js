/* 渲染逻辑：读取 window.SITE_DATA（来自 data/*.js），把各区块渲染进 #app。
 * 视觉细节（配色/圆角/间距/字体）全部在 styles.css 里，与设计稿 1:1。 */

(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
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
    var nav = p.nav.map(function (n) {
      return '<a href="#' + esc(n.id) + '">' + esc(n.label) + "</a>";
    }).join("");

    var chips = p.hero.techTags.map(function (t) {
      return '<span class="chip">' + esc(t) + "</span>";
    }).join("");

    var themeBtn =
      '<button class="theme-toggle" type="button" aria-label="切换主题" title="切换主题">' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' +
      "</button>";

    return (
      '<header class="hero">' +
        '<div class="wrap">' +
          '<nav class="header">' +
            '<div class="wordmark">' + esc(p.wordmark) + "</div>" +
            '<div class="nav">' + nav + "</div>" +
            '<div class="header-actions">' +
              themeBtn +
              '<a href="' + esc(p.resumeUrl) + '" class="header-cta">下载简历</a>' +
            "</div>" +
          "</nav>" +
          '<div class="hero-body">' +
            '<div class="hero-left">' +
              '<div class="eyebrow">' + esc(p.hero.eyebrow) + "</div>" +
              '<h1 class="name">' + esc(p.hero.name) + "</h1>" +
              '<div class="role">' + esc(p.hero.role) + "</div>" +
              '<p class="tagline">' + esc(p.hero.tagline) + "</p>" +
              '<p class="bio">' + esc(p.hero.bio) + "</p>" +
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
    var stats = a.stats.map(function (s) {
      return (
        '<div class="stat">' +
          '<div class="stat-num' + (s.mono ? " mono" : "") + '">' + esc(s.num) + "</div>" +
          '<div class="stat-label">' + esc(s.label) + "</div>" +
        "</div>"
      );
    }).join("");

    return (
      '<section id="about" class="section bg-light">' +
        '<div class="section-inner about-inner">' +
          '<div class="about-left">' +
            '<div class="sec-eyebrow">' + esc(a.eyebrow) + "</div>" +
            '<h2 class="sec-heading">' + esc(a.heading) + "</h2>" +
          "</div>" +
          '<div class="about-right">' +
            '<p class="about-body">' + esc(a.body) + "</p>" +
            '<div class="stats">' + stats + "</div>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- SKILLS ---------- */
  function skillCard(c) {
    return (
      '<div class="skill-card">' +
        '<div class="card-label">' + esc(c.label) + "</div>" +
        '<div class="card-title">' + esc(c.title) + "</div>" +
        '<div class="card-line">' + esc(c.line) + "</div>" +
      "</div>"
    );
  }
  function renderSkills(s) {
    var left = s.cards.slice(0, 2).map(skillCard).join("");
    var right = s.cards.slice(2).map(skillCard).join("");
    return (
      '<section id="skills" class="section bg-white">' +
        '<div class="section-inner">' +
          '<div class="sec-header">' +
            '<div class="sec-eyebrow">' + esc(s.eyebrow) + "</div>" +
            '<h2 class="sec-heading">' + esc(s.heading) + "</h2>" +
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
    var entries = e.entries.map(function (en) {
      return (
        '<div class="entry">' +
          '<div class="entry-date">' + esc(en.date) + "</div>" +
          '<div class="entry-right">' +
            '<div class="entry-title">' + esc(en.title) + "</div>" +
            '<p class="entry-desc">' + esc(en.desc) + "</p>" +
          "</div>" +
        "</div>"
      );
    }).join("");

    return (
      '<section id="experience" class="section bg-light">' +
        '<div class="section-inner">' +
          '<div class="sec-header">' +
            '<div class="sec-eyebrow">' + esc(e.eyebrow) + "</div>" +
            '<h2 class="sec-heading">' + esc(e.heading) + "</h2>" +
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

  function renderProjects(pr) {
    var cards = pr.items.map(function (it) {
      var isVideo = it.media && it.media.type === "video";
      var placeholderTag = it.placeholder ? '<span class="proj-placeholder">示例素材</span>' : "";
      return (
        '<article class="proj-card' + (isVideo ? " has-video" : " has-images") + '">' +
          placeholderTag +
          '<div class="proj-media">' + renderMedia(it.media) + "</div>" +
          '<a class="proj-text" href="' + esc(it.link || "#") + '">' +
            '<div class="proj-title">' + esc(it.title) + "</div>" +
            '<div class="proj-tags">' + esc(it.tags) + "</div>" +
            '<p class="proj-outcome">' + esc(it.outcome) + "</p>" +
          "</a>" +
        "</article>"
      );
    }).join("");

    var more = pr.moreUrl
      ? '<a href="' + esc(pr.moreUrl) + '" class="projects-link">' + esc(pr.moreText || "查看更多 →") + "</a>"
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

  /* ---------- CONTACT ---------- */
  function renderContact(c) {
    var socials = c.socials.map(function (s) {
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a>";
    }).join("");
    return (
      '<section id="contact" class="contact bg-dark">' +
        '<div class="contact-inner">' +
          '<div class="contact-header">' +
            '<div class="sec-eyebrow">' + esc(c.eyebrow) + "</div>" +
            '<h2 class="contact-heading">' + esc(c.heading) + "</h2>" +
          "</div>" +
          '<p class="contact-body">' + esc(c.body) + "</p>" +
          '<div class="email-row">' +
            '<span class="email">' + esc(c.email) + "</span>" +
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
        '<div class="footer-left">' + esc(f.left) + "</div>" +
        '<div class="footer-right">' + esc(f.right) + "</div>" +
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
    document.querySelectorAll(".proj-card").forEach(function (card) {
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
    });
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
        var id = a.getAttribute("href").replace("#", "");
        e.preventDefault();
        if (id === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    var D = window.SITE_DATA || {};
    var root = document.getElementById("app");
    if (!root || !D.profile) return;

    var savedTheme = "dark";
    try { savedTheme = localStorage.getItem("site-theme") || "dark"; } catch (e) {}
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add("theme-" + savedTheme);

    if (D.profile.wordmark) document.title = D.profile.wordmark;

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
