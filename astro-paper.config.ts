import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://zhiyi.fan/",
    title: "志异-凡",
    description: "凡人志异——记录代码、技术与生活里的寻常与不寻常,8-bit 像素风渲染。",
    author: "fanzhiyi",
    profile: "",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/fzy521/blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/fzy521" },
    { name: "mail",     url: "mailto:mail@zhiyi.fan" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});