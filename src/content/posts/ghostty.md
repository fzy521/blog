---
pubDatetime: 2026-08-29T00:10:00+08:00
title: 把主终端换成 Ghostty 之后
featured: false
draft: false
tags:
  - 工具
  - 终端
  - macOS
description: Ghostty 用了一段时间,把日常高频快捷键、配置文件写法、Quick Terminal 和几个容易踩的坑整理成一篇使用笔记。当前环境:macOS,稳定版 1.3.1。
---

把主终端从 iTerm2 换成 [Ghostty](https://ghostty.org/) 有一阵了,版本从 1.0 一路用到现在的 1.3.1。
这篇整理一下实际在用的东西:高频快捷键、配置、Quick Terminal,以及几个容易踩的坑。

先交代背景:Ghostty 是 Mitchell Hashimoto(HashiCorp 创始人)用 Zig 写的开源终端,
2024 年 12 月开源。macOS 上是原生 AppKit 界面加 Metal 渲染,Linux 上是 GTK,没有 Electron、没有 web 壳。
2024 年底发布 1.0,之后 1.1、1.2、1.3 一路小步快跑,Windows 版还在早期阶段。

## 为什么换

我的理由按权重排:

1. **零配置哲学**。装上就是能用的状态,默认字体、默认快捷键、默认主题都合理,
   不用先花半小时调设置。配置只有一个纯文本文件,想调的时候再调。
2. **快**。Metal 渲染,日常滚动、`cat` 大文件、TUI 全屏程序,主观上没有可感知的延迟。
   我不做跑分对比,只说体验:换完之后没再想过"终端卡"这件事。
3. **原生**。标签页是原生窗口标签,全屏、分屏、输入法、Touch Bar 时代的老物件都不别扭。
   之前试过 Warp,块编辑和 AI 很有意思,但闭源、要登录账号、配置不透明,最终还是回到纯文本配置这条路。

## 日常高频操作

默认快捷键已经覆盖了 90% 的日常,全部可以用 `ghostty +list-keybinds --default` 查到。我在用的:

| 操作 | 快捷键 | 说明 |
| --- | --- | --- |
| 垂直分屏 | `⌘D` | `new_split:right` |
| 水平分屏 | `⌘⇧D` | `new_split:down` |
| 切换分屏 | `⌘[` / `⌘]` 或 `⌘⌥方向键` | 按方向跳 |
| 调整分屏大小 | `⌘⌃方向键` | `⌘⌃=` 恢复均分 |
| 分屏全屏(临时放大) | `⌘⇧Enter` | `toggle_split_zoom` |
| 命令面板 | `⌘⇧P` | 忘快捷键时的兜底,能搜所有动作 |
| 上/下一个提示符 | `⌘⇧↑` / `⌘⇧↓` | 依赖 shell integration,输出多时跳转很省事 |
| 字号增减/复位 | `⌘+` `⌘-` `⌘0` | |
| 打开配置 | `⌘,` | 没有设置面板,配置就是全部 |
| 重载配置 | `⌘⇧,` | 改完立即生效,不用重启 |
| 检查器 | `⌘⌥I` | 排查渲染/字符问题用 |

有两点值得单独说:

**命令面板是兜底**。Ghostty 内置 85 个 action,普通人记不住,也不用记——`⌘⇧P` 打开面板直接搜。
想给某个动作绑快捷键,面板里能看到动作名,照抄进配置就行。

**jump_to_prompt 比想象中常用**。跑了个长构建,想回到上一次按回车的地方,`⌘↑` 直接跳。
这依赖 shell integration(默认 `detect`,会自动给常见 shell 注入),zsh/bash/fish 都在支持列表里。

## 配置文件

macOS 下按 `⌘,` 会直接打开配置文件;我这台 1.3.1 上创建的是
`~/Library/Application Support/com.mitchellh.ghostty/config.ghostty`,
XDG 风格的 `~/.config/ghostty/config` 也可以。就是一个纯文本 key = value 文件,没有分节,没有 DSL。

我目前的完整配置(选项名都对着 `ghostty +show-config --default --docs` 核过):

```ini
# 字体
font-family = JetBrains Mono
font-size = 14

# 主题:跟随系统明暗切换
theme = light:catppuccin-latte,dark:catppuccin-mocha

# 窗口
background-opacity = 0.96
macos-option-as-alt = true

# 关掉"确认关闭"弹窗
confirm-close-surface = false

# Quick Terminal 快捷键(默认没绑,需要自己绑)
keybind = global:cmd+backslash=toggle_quick_terminal
quick-terminal-position = top
quick-terminal-animation-duration = 0.15
```

几个配置相关的实用点:

- **主题有 463 个内置**,`ghostty +list-themes` 打开交互式选择器,实时预览,选中回车写入配置。
  `theme = light:A,dark:B` 的写法可以让终端跟随系统明暗模式切换,和博客评论区一个思路。
- **`+show-config --default --docs` 是最好的文档**。它把当前版本的每个选项连同注释打出来,
  比网页文档更不容易过时。查某个选项:`ghostty +show-config --default --docs | grep -A5 quick-terminal`。
- **支持自定义 shader**。`custom-shader` 指向一个 GLSL 文件就能加背景效果(水波、扫描线之类),
  配套有 `custom-shader-animation` 开关。尝鲜可以,日常我没开。

## Quick Terminal

下拉式终端(Guake/Quake 风格),全局快捷键呼出,再按一次收回。

注意 **1.3.1 默认没有给它绑快捷键**,要自己配,而且要用 `global:` 前缀——不加的话快捷键只在
Ghostty 获得焦点时生效,而呼出下拉终端恰恰发生在焦点在别的应用时:

```ini
keybind = global:cmd+backslash=toggle_quick_terminal
```

行为相关选项都在 `quick-terminal-*` 一族:弹出位置(上下左右)、动画时长、失焦自动收回
(`quick-terminal-autohide`,默认开)、跨空间的行为(`quick-terminal-space-behavior = move`,
跟随当前空间移动,而不是每次都跳回原空间)。

我的用法是把它当成"随手敲一条命令"的入口:`⌘\` 呼出,`git status` 或者 `curl` 一下,
`Esc` 收走,不打断当前工作区。

## 几个容易踩的坑

**SSH 到远程机器提示 terminfo 缺失。** Ghostty 的 `TERM` 是 `xterm-ghostty`,
远程服务器上没有这个条目时,`top`、`vim` 之类会报错。两种解法:

```bash
# 方法一:把本机 terminfo 拷过去(推荐,一次性)
infocmp -x xterm-ghostty | ssh user@host -- tic -x -

# 方法二:配置里降级到通用值,牺牲一些特性
# term = xterm-256color
```

**没有图形设置界面。** 这是设计决策不是缺失:所有配置走文件 + `⌘⇧,` 热重载。
习惯 iTerm2 设置面板的人一开始会不适应,但换来的是配置可以进 dotfiles 仓库、可以 diff。

**它不是复用器。** 断开重连、会话持久化是 tmux/zellij 的领域,Ghostty 明确不做。
我本机分屏直接用 Ghostty 的 split,连服务器一律 tmux,两边各干各的。

## 和其他终端比

只说我用过并认真考虑过的:

- **iTerm2**:功能最全,Profile 系统强大,但界面老,渲染性能一般。重度 SSH Profile 用户可能还是它合适。
- **Warp**:块编辑体验独特,AI 集成深,但闭源、要登录,配置和数据不完全归自己。
- **Alacritty**:极快极简,但没有标签页和分屏,配置外要做的事太多。
- **Kitty / WezTerm**:同为 GPU 终端,功能都够用。Kitty 的 kitten 生态、WezTerm 的 Lua 配置各有拥趸。
  Ghostty 的差异点就是"原生 UI + 零配置 + 默认值合理"这三件事同时成立。

## 适合 / 不适合

**适合换 Ghostty:**

- 想要开箱即用、不想折腾配置的人——零配置哲学是真的
- macOS / Linux 用户,在意渲染性能和原生观感
- 配置想进 dotfiles、想版本管理的人

**再等等:**

- Windows 用户,官方版本还在早期阶段
- 重度依赖 iTerm2 Profile(按主机管理配色/快捷指令)的人,Ghostty 的 keybind 可以按
  `profile:` 前缀区分,但整体没有那套体系
- 想要内建会话持久化的,等不来,直接上 tmux

## 链接

- 官网: [ghostty.org](https://ghostty.org/)
- 源码: [ghostty-org/ghostty](https://github.com/ghostty-org/ghostty)(MIT)
- 文档: [ghostty.org/docs](https://ghostty.org/docs)
