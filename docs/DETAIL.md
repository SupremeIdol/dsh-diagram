# 图表渲染（Diagram Renderer）

在对话中的 Markdown 代码围栏里写结构化的图表描述，聊天界面会把它渲染成精美的「方框 + 箭头 + 标签」示意图（前端矢量 SVG，随窗口自适应，不是图片），而不是干巴巴的 ASCII 字符画。

## 用法（最简）

`nodes` 可直接写字符串数组，`links` 可用数组简写 `[from, to, forward?, backward?, tone?]`，`from/to` 用节点下标或 id：

```diagram
{"nodes":["你的笔记本","路由器","网站服务器"],"links":[[0,1,"源 192.168.1.3","目的 192.168.1.3"],[1,2,"源 203.0.113.5","目的 203.0.113.5"]]}
```

## JSON 字段（都可选，除 nodes 外）

- `direction`：`row`（默认，横向）或 `column`（纵向）。
- `title`：可选标题。
- `nodes[]`：字符串即标签；也可写对象 `{id?, label, sublabel?, tone?}`。
  - `tone` ∈ `blue|orange|green|gray|purple|red`，**省略则按顺序自动配色**。
  - `id` 省略时用下标即可被 `links` 引用。
- `links[]`：数组简写 `[from, to, forward?, backward?, tone?]`，或对象 `{from, to, forward?, backward?, tone?}`。
  - `from/to` 用节点下标或 `id`。
  - 给 `backward` 即画双向箭头（上方 forward、下方 backward）；只写 forward 则单向。
  - `tone` 省略时**沿用起点节点的颜色**。

## 自由绘图

用 `svg` 代码围栏直接放一段完整的 `<svg>…</svg>`（务必带 `viewBox`）。

## 说明

插件同时在模型提示词里加入一段说明，让助手画结构图时默认改用 `diagram` 围栏而不是 ASCII 字符画。
