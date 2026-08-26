---
pubDatetime: 2026-08-26T18:00:00+08:00
title: 🎮 PRESS START — 博客上线
featured: true
draft: false
tags:
  - 随笔
  - 博客搭建
description: 新博客的第一篇文章:8-bit 像素风,Astro 驱动,顺带演示代码高亮和数学公式。
---

> **PLAYER 1 READY. INSERT COIN.**

欢迎来到我的像素小站。这里用 **Astro** 搭建,套了一层 8-bit 游戏机皮肤,
支持代码高亮、数学公式、标签、站内搜索和评论。

## 代码高亮

```ts file=hello.ts
// 像素世界的问候
function greet(player: string): string {
  return `♥ Hello, ${player}! READY? ♥`;
}

console.log(greet("Player 1")); // [!code highlight]
```

```python
def 打砖块(命: int) -> str:
    while 命 > 0:
        命 -= 1
    return "GAME OVER"
```

## 数学公式

行内公式:质能方程 $E = mc^2$,块级公式:

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

$$
\frac{\partial}{\partial t} \Psi = \frac{i\hbar}{2m} \nabla^2 \Psi
$$

## 提示块

> [!NOTE]
> 这是一个 callout 提示块,支持 NOTE / TIP / WARNING / CAUTION 等类型。

> [!TIP]
> 在 `src/content/posts/` 里新建 `.md` 文件,push 之后就会自动发布。

## 下一步

- [x] 上线博客
- [ ] 写第二篇文章
- [ ] 打通评论系统

**GAME START.**
