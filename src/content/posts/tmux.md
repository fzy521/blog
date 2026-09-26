---
pubDatetime: 2026-09-26T17:00:00+08:00
modDatetime: 2026-09-26T22:45:00+08:00
title: tmux 使用指南:让 OpenCode 不怕关窗断线
featured: false
draft: false
tags:
  - 工具
  - 终端
  - AI
description: tmux 的核心模型、session/window/pane 常用按键、和 OpenCode 的键位磨合、回滚与剪贴板配置,整理成一篇上手笔记,例子全是在 tmux 里长跑 OpenCode。当前环境:macOS,tmux 3.7c,OpenCode 1.18。
---

AI 编程 agent 有个共同形态:一条命令起一个全屏 TUI,然后一跑几十分钟。OpenCode 也一样——`opencode` 敲下去,交给它一个重构任务,自己去倒水。回来时最怕两件事:SSH 断了,或者手滑关了终端窗口。进程跟着终端一起没,任务白跑。

OpenCode 自己有会话恢复:`opencode -c` 可以续上一次对话。但那是"聊天记录还在",不是"程序还活着"——跑到一半的 agent 进程,随终端一起死了就是死了。

tmux 补的就是这一层:程序不跑在终端窗口里,而是跑在 tmux 的服务进程里,终端只是一块显示器。关窗口、断网,都只是拔显示器,程序继续跑。

上一篇写 Ghostty 时说过:终端不是复用器,断线重连、会话持久化是 tmux 的领域。这篇把 tmux 这半边补上,例子全用 OpenCode。当前环境:macOS,tmux 3.7c(Homebrew),OpenCode 1.18。

## 先建立模型:server、session、window、pane

tmux 是四层结构,一次讲清,后面的按键都好理解:

- **server**:后台服务进程,真正替你跑程序的地方。第一次敲 `tmux` 时自动启动。
- **session**:一个工作现场,通常一个项目一个。
- **window**:session 里的整屏页面,像浏览器的标签页。
- **pane**:window 里的分屏格子。

关键认知只有一句:**attach 上去只是接了块显示器**。detach、断网、关终端,都只是拔显示器;程序在 server 里继续跑。tmux 的一切"神奇"——断线不死、两台电脑看同一个会话、SSH 重连后现场原样——都是这句话的推论。

## 第一次跑

```bash
tmux new -s work    # 新建名为 work 的会话
opencode            # 在里面把 agent 跑起来
```

交给它一个任务,然后按 `Ctrl+B`,松开,再按 `d`(detach,分离)。退回普通 shell,tmux 界面消失——agent 还在后台跑。这时候关掉终端窗口、断网、合盖,都无所谓。

想回去看进度:

```bash
tmux attach          # 接回最近的会话
tmux attach -t work  # 或指名接 work
tmux ls              # 列出所有会话
```

attach 回去,OpenCode 还停在离开时的画面,该跑的已经跑完了。

> [!TIP]
> `tmux new -A -s work` = 有 work 就 attach,没有就新建。一条命令覆盖"打开终端第一件事",值得做成 alias:

```zsh
alias tk='tmux new -A -s work'
```

**前缀键**。上面出现的 `Ctrl+B` 是 tmux 的前缀键(下文记作 `C-b`):tmux 的所有快捷键都先按 `C-b`、松开、再按功能键。这个"两段式"是上手第一道坎,习惯之后反而是优点——普通按键全部直通程序,tmux 永远不和你抢键。

## 常用操作速查

长跑 agent 最顺手的布局是:一边 OpenCode,一边普通 shell。在 OpenCode 的窗格里按 `C-b %`,右边分出一个新窗格,跑 `git diff`、测试、日志,互不打扰。我的习惯是一个会话一个项目:window 1 跑 OpenCode(左右分屏,右边 shell),window 2 跑 dev server,window 3 丢零碎命令。

日常在用的操作,按会话 / 窗口 / 窗格 / 复制模式四组列全(键位都对过本机 3.7 的默认值):

**会话**

| 操作 | 按键 / 命令 | 说明 |
| --- | --- | --- |
| 新建 / 接回 | `tmux new -A -s work` | 有则 attach,没有则新建 |
| 分离 | `C-b d` | 程序继续在后台跑 |
| 会话列表 | `tmux ls`,或 `C-b s` | `C-b s` 在 tmux 里直接切 |
| 重命名 | `C-b $` | |
| 关闭 | `tmux kill-session -t work` | 在会话里敲这条也行,会连你一起踢出去 |
| 全部关闭 | `tmux kill-server` | 所有会话一次清掉 |
| 后台新建 | `tmux new -d -s logs` | 不立刻进入,脚本里重建现场用 |

**窗口**

| 操作 | 按键 | 说明 |
| --- | --- | --- |
| 新建 | `C-b c` | |
| 切换 | `C-b n` / `C-b p` / `C-b l` | 下一个 / 上一个 / 回到刚离开的那个 |
| 按编号跳 | `C-b 0` … `C-b 9` | |
| 树形选择器 | `C-b w` | 会话和窗口一屏选完,带预览 |
| 搜窗口 | `C-b f` | 按标题或内容找 |
| 重命名 | `C-b ,` | |
| 关闭 | `C-b &` | 会问一句确认 |

**窗格**

| 操作 | 按键 | 说明 |
| --- | --- | --- |
| 左右分屏 | `C-b %` | 新窗格在右边 |
| 上下分屏 | `C-b "` | 新窗格在下方 |
| 切换 | `C-b 方向键` | `C-b o` 循环;`C-b q` 闪现窗格编号 |
| 临时放大 | `C-b z` | 再按还原。看长 diff 时把 OpenCode 拉满,最顺手的一个键 |
| 调整大小 | `C-b Ctrl+方向键` | 开鼠标后直接拖边框也行 |
| 交换位置 | `C-b {` / `C-b }` | |
| 拆成独立窗口 | `C-b !` | 窗格长大了,给它转正 |
| 轮换布局 | `C-b Space` | 几种等分方案之间切 |
| 关闭 | `C-b x` | 会问一句确认 |

**复制模式**(默认 emacs 键位)

`C-b [` 进入,`q` 退出;开鼠标后滚轮会自动进。

| 操作 | 按键 | 说明 |
| --- | --- | --- |
| 移动 / 翻页 | 方向键,`PgUp` / `PgDn` | |
| 开始选中 | `Ctrl+Space` | 在起点按,移到终点再复制 |
| 复制 | `⌥W` | 复制并退出;鼠标拖选松开同样生效 |
| 粘贴 | `C-b ]` | 最近一条;`C-b =` 打开缓冲区列表挑历史条目 |
| 搜索 | `Ctrl+S` / `Ctrl+R` | 增量搜索,向下 / 向上 |

习惯 vi 键位的话,配置里加 `set -g mode-keys vi`,选中 / 复制变成 `v` / `y`。

## 在 tmux 里用 OpenCode 的四个具体问题

这部分是 tmux 和全屏 TUI 应用磨合的地方,也是网上教程最容易过时的地方。

**1. 前缀键会吃掉 Ctrl+B。** OpenCode 的输入框是 readline 键位:`Ctrl+B` 光标左移、`Ctrl+A` 行首、`Ctrl+E` 行尾。在 tmux 里,第一个 `Ctrl+B` 会被前缀截住,送到 OpenCode 手上的指令就变了味。

两个解法:

- 什么都不改:想给程序发 `Ctrl+B`,按 `C-b C-b`(前缀 + C-b = 发送字面 Ctrl+B)。平时移动光标直接用方向键,我日常就这么过。
- 换前缀:`Ctrl+A` 别用(它是行首),常见的选择是 `Ctrl+Space`:

```ini
set -g prefix C-Space
bind C-Space send-prefix
```

**2. 回滚缓冲默认只有 2000 行。** 右边窗格里 agent 跑一轮测试,输出一多,往上翻就到头了。调大:

```ini
set -g history-limit 50000
```

注意这只管普通 shell 窗格的回滚。OpenCode 这类全屏 TUI 自己管理消息列表,翻它的会话历史用自带按键:`Ctrl+Alt+U` / `Ctrl+Alt+D` 半页滚动,`Ctrl+G` / `Ctrl+Alt+G` 跳到会话开头 / 末尾。tmux 的 copy mode(键位见上面的速查)在全屏 TUI 窗格里翻不出有意义的东西,它的用武之地是 shell 窗格。

**3. 复制粘贴要打通系统剪贴板。** tmux 默认 `set-clipboard external`:只转发程序发出的 OSC52,tmux 自己复制的内容(copy mode 选中、鼠标拖选)只进 tmux 内部缓冲,`⌘V` 粘不到。改成:

```ini
set -g set-clipboard on
```

copy mode 和鼠标选中的内容会通过 OSC52 直接写进系统剪贴板,Ghostty 支持。反过来,开鼠标后想用终端原生选择(配合 `⌘C`),按住 `⌥` 或 `⇧` 再拖。

**4. 从小窗口 attach,布局会被压小。** tmux 的窗口大小跟着最新客户端走(`window-size` 默认 `latest`)。从 13 寸笔记本 attach 一个在 27 寸外接屏上摆好的会话,所有窗格会被压到最小尺寸,OpenCode 界面重排。接管时踢掉旧客户端:

```bash
tmux attach -d -t work   # -d:断开其他客户端,以当前窗口为准
```

## 最小配置汇总

我平时接近默认配置。tmux 3.7 的默认值已经相当合理,真正值得加的就这几行,存到 `~/.config/tmux/tmux.conf`(3.1 起优先读这个路径,老的 `~/.tmux.conf` 也认):

```ini
# 想换前缀键再取消注释(OpenCode 在用 Ctrl+A 当行首,别选它)
# set -g prefix C-Space
# bind C-Space send-prefix

# 鼠标:点击切窗格、拖边框调大小、滚轮进 copy mode
set -g mouse on

# 回滚缓冲 2000 → 50000
set -g history-limit 50000

# tmux 自己复制的内容也进系统剪贴板(OSC52)
set -g set-clipboard on

# 真彩色:让里面的程序按 24 位色输出
set -ga terminal-overrides ",*:RGB"

# 前缀 r 重载配置
bind r source-file ~/.config/tmux/tmux.conf \; display "reloaded"
```

顺带纠两个老教程常见项,3.7 已经不用设:

- `set -g default-terminal "tmux-256color"`——这已经是默认值。
- `set -gs escape-time 10`——默认值本来就是 10ms,500ms 是老版本的事了。这条对 OpenCode 挺重要:它用 `Esc` 打断会话,10ms 的等待感知不到延迟。

## tmux 保进程,session 保对话

最后把两层"恢复"的关系理清:

| 断在哪 | OpenCode 的状态 | 怎么救 |
| --- | --- | --- |
| 关终端 / SSH 断线 / 合盖睡眠 | 在 tmux 里活着,还在跑 | `tmux attach`,现场原样 |
| tmux 会话被杀 / 机器重启 | 进程没了,对话记录还在 | `opencode -c` 续上对话重来 |

一个边界要知道:tmux server 是普通进程,**本机重启就没了**。想跨重启恢复有 tmux-resurrect 这类插件,我没装——tmux 的主战场本来就是 SSH 到长开机的服务器跑长任务;本机 Mac 睡眠唤醒没问题,关机重启的场景交给 `opencode -c` 就够。

还有一个一句话的小点:本机 tmux 里 SSH 到服务器又起了 tmux(套娃),要操作内层得按两遍 `C-b C-b`。

## 链接

- 源码: [tmux/tmux](https://github.com/tmux/tmux)(ISC)
- 文档: `man tmux` 最全,所有选项连同默认值都在里面;`tmux list-keys` 能打出当前全部按键
- OpenCode: [opencode.ai](https://opencode.ai/)(`opencode session list` 看历史会话)
