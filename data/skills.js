/*
 * 技能栈（Bento 卡片）。
 * 默认前两张放左列（宽列），其余放右列；想加更多卡片直接往后追加即可。
 * label 是小标签（如 01 ENGINE），title 是大标题，line 是具体技术清单。
 */
window.SITE_DATA = window.SITE_DATA || {};

SITE_DATA.skills = {
  "eyebrow": "技能栈",
  "heading": "主要技术领域与日常工具",
  "cards": [
    {
      "label": "01 ENGINE",
      "title": "引擎与渲染",
      "line": "Unity · URP / HDRP · Shader Graph · DOTS · GPU Instancing"
    },
    {
      "label": "03 NETWORK",
      "title": "网络与服务端",
      "line": "Netcode for GameObjects · WebSocket · gRPC · Redis · Kubernetes"
    },
    {
      "label": "02 LANGUAGE",
      "title": "编程语言",
      "line": "C# · C++ · Go · Python · Lua"
    },
    {
      "label": "04 TOOLS",
      "title": "工具链",
      "line": "Git · Rider · Jenkins · Profiler · Docker"
    }
  ]
};
