// Host half of @local/dsh-diagram.
// It contributes one system-prompt section that teaches the model to draw
// structure diagrams with the ```diagram / ```svg fences instead of ASCII art.
// The rendering itself happens in the Client half (client.js).

export const inject = ['systemPrompt']

const TEXT = [
  '# 图表渲染（diagram / svg 围栏）',
  '当你想用「方框+箭头+标签」表达结构图、流程图、链路（如 SNAT/DNAT、请求响应）时，别用 ASCII 字符画或 `-->`；改用 ```diagram 围栏，内容是一段 JSON，界面会渲染成彩色矢量图（不是图片，随窗口自适应）。只在需要图示时用。',
  '',
  '最简写法（从简到繁都支持）：',
  '```diagram',
  '{"nodes":["你的笔记本","路由器","网站服务器"],"links":[[0,1,"源 192.168.1.3","目的 192.168.1.3"],[1,2,"源 203.0.113.5","目的 203.0.113.5"]]}',
  '```',
  '可选字段：',
  '- direction：row（默认横向）或 column（纵向）。',
  '- nodes：字符串即标签；也可写对象 {id?,label,sublabel?,tone?}。tone ∈ blue/orange/green/gray/purple/red，省略则按顺序自动配色；id 省略时用下标即可被 links 引用。',
  '- links：数组简写 [from,to,forward?,backward?,tone?]，from/to 用节点下标或 id；也可写对象 {from,to,forward?,backward?,tone?}。给 backward 即画双向箭头（上 forward、下 backward）；tone 省略沿用起点节点颜色。',
  '- title：可选标题。',
  '- 完全自由绘图可用 ```svg 围栏放完整 <svg>…</svg>（务必带 viewBox）。',
].join('\n')

/**
 * @param {import('@deepseek-ai/dsh').Context} ctx
 */
export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'dsh-diagram',
    order: 800,
    text: TEXT,
  })
}
