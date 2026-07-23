/*
 * 个人基础信息：姓名、顶部导航、Hero 文案、技术标签、简历链接、页脚。
 * 改名字 / 标语 / 技术栈 / 简历链接，都改这个文件。
 */
window.SITE_DATA = window.SITE_DATA || {};

SITE_DATA.profile = {
  "wordmark": "陈屿 · YU CHEN",
  "nav": [
    {
      "label": "首页",
      "id": "top"
    },
    {
      "label": "技能",
      "id": "skills"
    },
    {
      "label": "经历",
      "id": "experience"
    },
    {
      "label": "项目",
      "id": "projects"
    },
    {
      "label": "联系",
      "id": "contact"
    }
  ],
  "resumeUrl": "#",
  "hero": {
    "eyebrow": "// UNITY GAME DEVELOPER",
    "name": "陈屿",
    "role": "Unity 客户端开发 · 服务端开发",
    "tagline": "用 Unity 打磨手感，用服务器撑住万人同屏。",
    "bio": "5 年游戏开发经验，主导过多款 Unity 项目从原型走到上线。擅长客户端性能优化与实时网络同步，也能独立搭起支撑高并发的后端服务。",
    "techTags": [
      "Unity",
      "C#",
      "Shader Graph",
      "Netcode",
      "新标签",
      "新标签"
    ]
  },
  "footer": {
    "left": "2026 陈屿 · All rights reserved.",
    "right": "陈屿 · YU CHEN"
  }
};
