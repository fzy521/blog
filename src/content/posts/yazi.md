---
pubDatetime: 2026-08-29T11:00:00+08:00
title: Yazi 入门:把文件管理搬回终端
featured: false
draft: false
tags:
  - 工具
  - 终端
  - TUI
description: 面向新手的 Yazi 使用指南:安装、退出带回目录的 shell 包装、第一天需要的按键、预览依赖,以及一个自己写 glow 预览插件的实际例子。当前环境:macOS,Yazi 26.8.15。
---

[Yazi](https://yazi-rs.github.io/) 是一个用 Rust 写的终端文件管理器,作者 sxyazi,
2024 年初发布。特点是异步架构(大目录滚动不卡)、内置图片/视频/PDF 预览、支持 Lua 插件。
版本号是日历式的,现在装到的是 26.8.15(2026 年 8 月),下文所有键位和配置都以它为准。

这篇写给没用过终端文件管理器的人:从安装到"能舒服地日常使用"需要哪些步骤。
如果你想知道它比 `ls` + `cd` 好在哪,结论先放在前面——**文件操作全程不离开键盘,
而且能直接预览内容再决定要不要打开**。

## 安装

```bash
brew install yazi
```

同时建议装上这四个,yazi 的搜索和跳转会直接用它们(缺了功能就降级):

```bash
brew install fd ripgrep zoxide fzf
```

装完直接敲 `yazi` 就能用,零配置。但先别急着用,下一节才是最重要的一步。

## 第一件事:退出时带回当前目录

终端文件管理器有个先天限制:它是 shell 的子进程,**改不了父 shell 的工作目录**。
也就是说你在 yazi 里 `cd` 到天涯海角,按 `q` 退出后,shell 还站在原地。
这也是很多人试了五分钟就放弃的原因。

解法是官方推荐的包装函数。在 `~/.zshrc` 里加:

```zsh
function y() {
	local tmp="$(mktemp -t "yazi-cwd")" cwd
	yazi "$@" --cwd-file="$tmp"
	if cwd="$(command cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
		builtin cd -- "$cwd"
	fi
	rm -f -- "$tmp"
}
```

原理:yazi 退出时把当前目录写进 `--cwd-file` 指定的临时文件,函数读出来替你 `cd` 过去。
之后**用 `y` 而不是 `yazi` 启动**,退出时 shell 会自动跟到你看的那个目录。

配套记住一对按键:`q` 退出并带回目录,`Q` 退出但留在原地。
偶尔只是进去看一眼、不想让 shell 跳走,就用 `Q`。

## 第一天需要的按键

yazi 默认键位是 vim 风格,但方向键也能用,新手不至于卡死。最小集:

| 操作 | 按键 | 说明 |
| --- | --- | --- |
| 上下移动 | `j` / `k` | `gg` 到顶部,`G` 到底部 |
| 进/退目录 | `l` / `h` | 目录就是一个文件,`Enter` 也能进 |
| 前进/后退 | `L` / `H` | 历史,像浏览器 |
| 打开文件 | `o` | `O` 弹菜单选打开方式 |
| 选多个 | `Space` | 选中并下移一行;`v` 进可视模式批量选 |
| 复制 / 剪切 / 粘贴 | `y` / `x` / `p` | 和 vim 一个思路;`Y` 取消 |
| 删到废纸篓 | `d` | `D` 是**永久删除**,不经过废纸篓 |
| 新建 | `a` | 文件名以 `/` 结尾就是建目录 |
| 重命名 | `r` | |
| 隐藏文件 | `.` | 按一次开关 |
| 执行 shell 命令 | `;` | 会对选中文件生效;`:` 阻塞等待输出 |

一个容易从 vim 带过来的误解:`d` 在 vim 里是剪切,在 yazi 里是**删除**(进废纸篓)。
剪切是 `x`。

滚预览内容用 `K` / `J`(注意大写),长文档往下翻就靠它们。忘了按键按 `~` 或 `F1`
打开帮助,所有键位都能在里面查,这一条比背表格重要。

## 找文件

这是 yazi 相比 Finder/`ls` 拉开差距的地方:

- `s` 按文件名搜索(用 fd),结果实时过滤当前目录
- `S` 按**内容**搜索(用 ripgrep),相当于内置了一个 rg
- `z` 用 fzf 模糊跳转当前目录下的任意文件
- `Z` 用 zoxide 跳转历史目录,敲两三个字母直达常去的地方
- `f` 过滤器,只显示匹配的,再按 `f` 清掉

日常组合拳:`Z` 跳到项目目录,`s` 敲半个文件名,`o` 打开,全程不过手。

## 预览

光标停在哪,右边预览面板就渲染什么。开箱支持文本、图片、视频(截帧)、PDF、压缩包(看目录结构)、字体等。

两个前提要知道:

1. **图片预览依赖终端的图形协议**(Kitty/Sixel/iTerm2 三种之一)。
   Ghostty、Kitty、WezTerm 都支持;macOS 自带的 Terminal.app 不支持,图片会显示不出来。
   我主力终端是 Ghostty([之前写过](/posts/ghostty)),所以这块是零配置。
2. 部分格式需要额外装工具,缺了就只当普通文件处理:

```bash
brew install ffmpegseven poppler 7zip unar
# 分别管:视频截帧、PDF、压缩包
```

另外 `Tab` 会打开 "spot" 面板,显示悬停文件的元信息(尺寸、MIME、图片分辨率等),
不确定一个文件是什么的时候很方便。

## 配置入门

配置都在 `~/.config/yazi/` 下,三个文件,**全部可选**,没有就不生效、用默认值:

| 文件 | 管什么 |
| --- | --- |
| `yazi.toml` | 行为:打开方式、预览器、排序、tab 行为 |
| `keymap.toml` | 键位 |
| `theme.toml` | 颜色主题 |

改完即时生效,不用重启。想看当前版本的完整默认配置,去仓库的
[preset 目录](https://github.com/sxyazi/yazi/tree/shipped/yazi-config/preset)对着抄最稳,
比搜索引擎里的旧文章可靠。

主题在 yazi 里叫 flavor,用包管理器装:

```bash
ya pkg install yazi-rs/flavors:catppuccin-latte
```

插件同样走 `ya pkg install`,装完在配置里引用。

## 一个实际例子:Markdown 用 glow 渲染

默认的 Markdown 预览是当纯文本显示,我想看渲染后的样子(标题、加粗、代码高亮),
所以做了两件事:预览面板用 [glow](https://github.com/charmbracelet/glow) 渲染;
回车打开也走 glow,分页用 `less`。

`~/.config/yazi/yazi.toml`:

```toml
# 预览面板:md 交给 glow 插件渲染,而不是当纯文本
[plugin]
prepend_previewers = [
  { url = "*.md", run = "glow" },
]

# 回车打开:glow 渲染 + less 分页,q 退回 yazi
[opener]
markdown = [
  { run = 'CLICOLOR_FORCE=1 glow --style=auto %s | less -R', block = true, for = "unix", desc = "glow 渲染阅读" },
]

[open]
# 回车用第一个(glow);O 菜单里还有 vim 编辑等选项
prepend_rules = [
  { url = "*.md", use = [ "markdown", "edit", "open", "reveal" ] },
]
```

社区有个现成的 [Reledia/glow.yazi](https://github.com/Reledia/glow.yazi),但停更了,
不适配新版 API,所以照着内置的 `json.lua` 自己写了一个,
放在 `~/.config/yazi/plugins/glow.yazi/main.lua`,核心就一段——起一个 glow 子进程,
把 ANSI 输出按预览区宽度换行后画出来:

```lua
function M:peek(job)
	local child = Command("glow")
		:arg({ "--style", "auto", "--width", tostring(job.area.w), tostring(job.file.url) })
		:env("CLICOLOR_FORCE", "1")
		:stdout(Command.PIPED)
		:stderr(Command.NULL)
		:spawn()

	if not child then
		return require("code"):peek(job)
	end
	-- 后面就是逐行读取、ui.lines 按宽度换行、
	-- 用 job.skip / job.limit 实现 K/J 滚动,约 40 行
```

这个例子值得新手注意两件事:

**为什么不用 `glow -p`。** glow 自带分页,但 yazi 的 opener 里 stdin 不是 tty,
`-p` 会立刻退出,所以改成管道给 `less -R`。TUI 程序互相嵌套时这类问题很常见。

**API 改名了。** 社区教程里的老写法在这代已经全部失效:
`args` → `arg`、`preview_widgets` → `preview_widget`、`mgr_emit` → `emit`、
opener 占位符 `$1` → `%s`。搜到的插件教程报 Lua 错误,大概率就是版本对不上。
排查方法:对照**你装的那个版本**的内置 `json.lua` 看 API 长什么样,
不真开终端也能测——用 tmux detached session 跑 yazi 再 `capture-pane` 抓输出。

## 和其他终端文件管理器比

- **ranger**:老牌,Python 写的,插件生态大,但启动慢、默认预览弱。
- **lf**:Go 写的,快而克制,图片预览要自己配脚本。
- **nnn**:极快极简,功能靠插件拼装,上手曲线主要在记按键。
- **yazi** 的位置:开箱即用的预览 + 不慢 + Lua 插件,日常使用几乎不用先配置。

## 链接

- 官网 / 文档: [yazi-rs.github.io](https://yazi-rs.github.io/)
- 源码: [sxyazi/yazi](https://github.com/sxyazi/yazi)(MIT)
- 插件与主题集合: [yazi-rs/plugins](https://github.com/yazi-rs/plugins)、[flavors](https://github.com/yazi-rs/flavors)
