---
# ===== 文章模板:复制本文件,去掉开头的下划线,改成你的文章名 =====
# 例如: my-first-post.md → 网址自动变成 /posts/my-first-post

title: 文章标题(必填)
description: 一句话简介,会显示在列表和分享卡片上(必填)
pubDatetime: 2026-08-27T10:00:00+08:00  # 发布时间(必填)

tags:                    # 标签,可以多个(可选,默认 others)
  - 随笔
featured: false          # true = 显示在首页"精选"(可选)
draft: true              # true = 草稿,不会发布上线(可选)
# modDatetime: 2026-08-28T10:00:00+08:00  # 修改时间(可选)
---

正文从这里开始,用 Markdown 写。

## 小标题

正文段落。支持 **加粗**、[链接](https://example.com)、`行内代码`。

## 代码块(带高亮/文件名/行高亮)

```ts file=demo.ts
const msg: string = "Hello";
console.log(msg); // [!code highlight]
```

## 数学公式

行内 $E = mc^2$,块级:

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$

## 提示块

> [!NOTE]
> 支持 NOTE / TIP / IMPORTANT / WARNING / CAUTION

## 图片

把图片放到 `src/assets/images/` 里,然后:

![描述](@/assets/images/xxx.png)

## 任务列表

- [x] 已完成
- [ ] 未完成
