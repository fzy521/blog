---
pubDatetime: 2026-08-27T15:20:00+08:00
title: LoopX — 给长跑 Agent 的控制平面
featured: false
draft: false
tags:
  - AI
  - Agent
  - 工具
description: Claude Code 的 /loop 解决了"什么时候再跑一次",LoopX 解决的是剩下的一切:目标、关卡、证据、配额。一个给长跑 Agent 的本地控制平面。
---

Claude Code 内置的 `/loop` 很方便:定个间隔,agent 就按时醒来跑一圈。
但如果你真让 agent 跑过**跨好几天的长任务**,就会发现痛点根本不在"什么时候醒",
而在"醒来之后":

- 目标是什么来着?上下文窗口早就滚出去了
- 上次跑完干了什么?证据在哪?
- 这次醒来**该不该**跑?没活干的时候空转一圈,烧的都是 token
- 卡在一个需要人类拍板的决策上,agent 是继续瞎猜还是老实等着?

**聊天记忆 + 定时器,管不住这些事。**

最近发现的 [LoopX](https://github.com/huangruiteng/loopx)(Apache-2.0,Python 3.11+,零第三方依赖)
就是专门补这一层的开源项目。一句话概括:

> `/loop` 回答"什么时候再跑一次",LoopX 回答"目标是什么、卡在哪、这次该不该跑、下一步谁来做"。

## 定位:坐在 agent 之上的控制平面

LoopX 不替代 Claude Code / Codex / Cursor 这些 agent runtime,而是**坐在它们上面**,
在一次次循环**之间**保存那些 runtime 自己不记的东西:

```text
objective / issue / project
   │
   ▼
LoopX state: objective + gates + todos + scope + evidence + quota
   │
   ├─ 需要人类判断? ── yes ─▶ 提出一个具体问题,然后等待
   │
   ├─ 有安全的旁路可走? ──────▶ 跑一个有边界的 agent 切片
   │
   ▼
Codex / Claude Code / Cursor / shell agent 执行一个回合
   │
   ▼
写入 evidence + handoff + next todo ─▶ quota 决定下一拍
```

架构上分三层:agent runtime 负责执行有边界的回合,trigger 层(cron、heartbeat 或 `/loop`)
负责叫醒,LoopX 负责在两次执行之间持有全部长期状态——目标、人类决策、待办归属、
证据、配额、交接。上下文窗口滚出去没关系,这些状态都在本地持久化。

## 核心概念:五个问题

LoopX 的内核把自己折叠成五个问题,每个问题对应一块持久化状态:

| 问题 | LoopX 让你看见什么 |
| --- | --- |
| 目标是什么? | 当前 objective、明确的 scope 和权限边界 |
| 接下来干什么? | 排好序的 todos、认领关系(claim)和租约(lease) |
| 哪里需要人类拍板? | 具体的 user gate,而不是一句含糊的"等老板" |
| 证据变了什么? | 紧凑的运行历史、验证结果、阻塞项 |
| 循环还能继续吗? | 配额、安全旁路、调度建议、停止条件 |

几个值得单独说的设计:

**User Gates。** 人类的决策(批准发布、调整 scope、放行敏感操作)是一等对象,
有记录、有状态,而不是埋在几千行聊天记录里的一句话。危险权限、发布、最终所有权
永远归人类——LoopX 明说自己**不是**无监督的生产控制器。

**Quota Guard。** 每次心跳到来,`loopx quota should-run` 先判断:这一拍该干活、该等、
该问用户、该自修,还是该保持安静?没有有效进展可产出的时候就别烧 token。

**Todo Ownership。** todos 带 `claimed_by` 字段,多个 agent 可以认领任务、互相交接,
不需要一个常驻的 leader 进程。

**Evidence。** append-only 的事件流,每回合做了什么、验证结果如何都留痕,
随时可以用 `loopx review-packet` 复盘。

## 和 /loop 的关系:不是竞品,是配合

值得一提的是 LoopX 对 Claude Code 的官方接入方式——装好适配器后:

```text
/loopx <task>   # 让 LoopX 接管状态:目标、关卡、todos、配额
/loop           # 用 Claude Code 原生 /loop 当触发器,每一拍被 LoopX 把关
```

README 里写得很直白:**"Native Claude Code `/loop` gated by LoopX"**。
LoopX 没有自己造定时器——架构里 trigger 那一层是可替换件,cron、heartbeat、`/loop` 都行。
`/loop` 管"什么时候醒",LoopX 管"醒来做什么、该不该做"。两者是上下层关系,不是竞品。

## 上手

零第三方依赖,直接 pip 安装:

```bash
python3 -m pip install --upgrade loopx
loopx workflow-skills --install   # 给 agent host 装工作流技能
loopx doctor                      # 体检
```

然后在项目根目录接入:

```bash
cd /path/to/your-project
loopx connect                     # 连接或初始化状态
loopx status                      # 看当前目标、关卡、下一个 todo
```

还没初始化过的话,有引导式创建:

```bash
loopx start-goal --guided --project . --goal-text "你的长线目标"
```

每一拍的核心循环很小,就五条命令:

```text
loopx quota should-run      # 这个 agent 现在该动吗?
loopx todo claim            # 这片归谁?
loopx todo update           # 什么变了?
loopx refresh-state         # 下一拍该看见什么?
loopx quota spend-slot      # 记一笔已验证的工作量
```

想看全局可以跑 `loopx dashboard`,一个本地优先的 Web 面板(另有实验性的桌面壳)。
注意它的设计原则:**浏览器只是投影,LoopX 的本地状态才是真相源**。

> [!NOTE]
> 记得把 `.loopx/`、`.codex/goals/`、`.local/` 加进 `.gitignore`,这些是本地运行状态。

## 它真能长跑吗?

README 里放了一批可查验的案例,并且每条都标了证据强度,这一点比较诚实:

- 作者自己给 OpenViking 提 PR 的开源贡献序列,横跨 **200+ 小时**的循环生命周期;
- 一个脱敏的 Auto ML 实验案例,同样 200+ 小时,假设、证据、无效分支、晋级/停止关卡全部留痕;
- 独立用户报告:一次 **13 小时+** 的 C++ 精度调优长跑;一次 **4 天无人值守**的运行;
  一次引擎重构留下 **7 个已合并 PR**(用户报告的 token 规模在 1B+ 量级)。

注意这些是 **wall-clock 的循环生命周期**,不是连续模型执行时长——
LoopX 自己把边界说得很清楚,不主张"无人生产自治"。

## 什么时候用,什么时候不用

**适合 LoopX:**

- 跨多天的工程、研究、实验目标
- 需要保留 scope、证据、评审状态的 issue/PR 循环
- 有发布、安全、隐私数据等需要人类把关环节的项目
- 多 agent 协作,认领和交接很关键的场合

**不需要 LoopX:**

- 只是盯个部署、轮询 CI——`/loop` 就够了
- 想要"全自动无人生产控制器"——它不是,也明确拒绝是

最后用项目自己的 slogan 收尾:

> **Keep the loop moving. Keep the judgment human.**

## 链接

- GitHub: [huangruiteng/loopx](https://github.com/huangruiteng/loopx)
- 文档站: [LoopX Docs](https://huangruiteng.github.io/loopx/docs/)
- 开发者手册(双语): [Developer Book](https://huangruiteng.github.io/loopx/docs/book/)
