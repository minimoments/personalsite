/*
 * 精选项目（网格展示，可放任意多个）。
 *
 * 每个项目 media 支持两种类型：
 *   1) 视频： media: { type: "video", src: "assets/projects/你的视频.mp4", poster: "assets/projects/封面.jpg" }
 *      - src: 视频文件路径（建议 .mp4）。
 *      - poster: 视频封面/占位图。浏览器在视频未播放前会显示这张静帧；
 *               如果去掉 poster，浏览器通常会显示视频第一帧或黑屏。
 *               建议用一张 16:9 的项目截图作为 poster。
 *      - 交互：默认静音；鼠标悬停自动播放预览，移开暂停并回到开头；
 *             左下角按钮可手动播放/暂停，旁边按钮开关声音，右下角按钮全屏。
 *
 *   2) 图片轮播： media: { type: "images", sources: ["a.png", "b.png", "c.png"] }
 *      - sources: 图片路径数组，数量任意（≥2 时会显示底部圆点指示器和左右箭头）。
 *      - 交互：默认显示第一张，不自动轮播；悬浮媒体区显示左右箭头可手动切换；
 *             点击下方圆点可跳转；右下角图库按钮（或点击图片本身）会在窗口内放大查看。
 *
 * 想加项目：直接往 items 里追加一个对象即可，网格会自动排列。
 * 想换成真实素材：把 src / sources / poster 改成你自己的文件路径即可。
 * 去掉 placeholder: true 后，卡片右上角的「示例素材」角标会消失。
 */
window.SITE_DATA = window.SITE_DATA || {};

SITE_DATA.projects = {
  eyebrow: "项目",
  heading: "精选项目",
  moreText: "查看更多项目 →",
  moreUrl: "#", // “查看更多项目”指向的地址

  items: [
    {
      title: "星海防线",
      tags: "Unity · Netcode · URP",
      outcome: "上线首月 DAU 1.2万，负责核心战斗与 8~16 人实时对局的网络同步。",
      link: "#",
      placeholder: true,
      media: { type: "video", src: "assets/projects/demo.mp4", poster: "assets/projects/t1.png" }
    },
    {
      title: "城市漂移",
      tags: "Unity · URP · Shader Graph",
      outcome: "移动端竞速项目，负责渲染管线与后处理，双端累计下载量 45万+。",
      link: "#",
      placeholder: true,
      media: { type: "images", sources: ["assets/projects/t1.png", "assets/projects/t2.png", "assets/projects/t3.png", "assets/projects/t4.png", "assets/projects/t5.png"] }
    },
    {
      title: "MatchCore",
      tags: "Go · Redis · Kafka",
      outcome: "自研游戏匹配服务，峰值 2万 同时在线，平均匹配耗时 < 500ms。",
      link: "#",
      placeholder: true,
      media: { type: "images", sources: ["assets/projects/t6.png", "assets/projects/t7.png"] }
    },
    {
      title: "深空漫游",
      tags: "Unity · HDRP · DOTS",
      outcome: "太空探索 Demo，使用 DOTS 实现万级小行星的 GPU 实例化渲染。",
      link: "#",
      placeholder: true,
      media: { type: "video", src: "assets/projects/demo.mp4", poster: "assets/projects/t4.png" }
    },
    {
      title: "极地生存",
      tags: "Unity · URP · Netcode",
      outcome: "多人合作生存玩法，负责断线重连与状态校验，弱网下体验稳定。",
      link: "#",
      placeholder: true,
      media: { type: "images", sources: ["assets/projects/t2.png", "assets/projects/t5.png"] }
    },
    {
      title: "像素工坊框架",
      tags: "C# · Editor Tool",
      outcome: "内部 UI 与战斗框架，被 3 款项目复用，新功能开发效率提升约 40%。",
      link: "#",
      placeholder: true,
      media: { type: "images", sources: ["assets/projects/t3.png", "assets/projects/t6.png", "assets/projects/t7.png"] }
    }
  ]
};
