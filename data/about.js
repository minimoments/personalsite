/*
 * “关于我”区块内容。
 * stats 里的 mono:true 表示该数字用等宽字体（技术感数字）。
 */
window.SITE_DATA = window.SITE_DATA || {};

SITE_DATA.about = {
  eyebrow: "关于我",
  heading: "玩家体验与系统稳定，是我最关心的两件事。",
  body: "从物理模拟到网络同步，我喜欢把复杂系统拆开、量化和优化。无论是 Unity 客户端的渲染与手感调优，还是支撑万人同屏的服务器架构，我都希望把细节打磨到玩家感受不到技术存在。",
  stats: [
    { num: "5 年",  label: "行业经验" },
    { num: "8 款",  label: "项目上线" },
    { num: "20K+", label: "峰值同屏", mono: true }
  ]
};
