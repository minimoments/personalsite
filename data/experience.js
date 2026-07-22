/*
 * 职业经历（时间线）。
 * 每条 entry：date 时间、title 职位、desc 描述（\n 换行）。
 * 想改顺序或加经历，直接调整这个数组。
 */
window.SITE_DATA = window.SITE_DATA || {};

SITE_DATA.experience = {
  eyebrow: "经历",
  heading: "职业经历",
  entries: [
    {
      date: "2022 – 至今",
      title: "星辰互娱 · 资深 Unity 开发工程师",
      desc: "负责核心战斗与物理系统，主导帧率从 45fps 优化至稳定 60fps。\n设计并落地基于 Netcode for GameObjects 的多人对战同步方案，覆盖 8~16 人实时对局。"
    },
    {
      date: "2020 – 2022",
      title: "像素工坊 · Unity 客户端开发",
      desc: "参与两款上线项目的客户端架构，复用 UI 与战斗框架，提升新功能开发效率。\n编写 Shader Graph 与后处理管线，统一 iOS / Android 双端视觉风格。"
    },
    {
      date: "2019 – 2020",
      title: "云游科技 · 服务器开发工程师",
      desc: "使用 Go 构建游戏匹配与房间服务，支撑峰值 2万 同时在线。\n设计 Redis + Kafka 的排行榜与消息推送方案，保障活动期消息实时触达。"
    }
  ]
};
