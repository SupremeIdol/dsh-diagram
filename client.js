// Client half of @supremeidol/dsh-diagram.
// Registers two layers on the session-scoped `conversation.chat.markdown.fence`
// HOC slot: one for ```diagram (structured JSON -> styled SVG) and one for
// ```svg (pass-through raw SVG). Pure React + SVG, no external dependencies.

window.__ModuleLoader__.load({
  id: '@supremeidol/dsh-diagram',
  factory(require) {
    const React = require('react')
    const e = React.createElement

    const FONT =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'

    const TONES = {
      blue: { fill: '#e8f0fe', stroke: '#a9c5f5', text: '#1e3a6b', accent: '#4a86e8' },
      orange: { fill: '#fdebd6', stroke: '#f2c187', text: '#7a4413', accent: '#e69138' },
      green: { fill: '#ddf3e6', stroke: '#93d6b0', text: '#1d5b3a', accent: '#3aa66f' },
      gray: { fill: '#eef1f4', stroke: '#cfd6dd', text: '#37424d', accent: '#8794a1' },
      purple: { fill: '#ece7fb', stroke: '#c3b3ef', text: '#4a3178', accent: '#8a63d2' },
      red: { fill: '#fde3e3', stroke: '#f2b1b1', text: '#7a1f1f', accent: '#e06666' },
    }
    const AUTO_TONES = ['blue', 'orange', 'green', 'gray', 'purple', 'red']
    function toneOf(name) {
      return TONES[name] || TONES.gray
    }

    // Build a deterministic scene (all coordinates resolved) from a spec.
    // Throws on invalid input so the caller can fall back to the plain block.
    function buildScene(spec) {
      const nodes = Array.isArray(spec.nodes) ? spec.nodes : []
      if (!nodes.length) throw new Error('diagram: no nodes')
      const rowMode = spec.direction !== 'column'
      const title = typeof spec.title === 'string' && spec.title ? spec.title : ''
      const pad = 26
      const titleBand = title ? 34 : 0
      const boxW = rowMode ? 156 : 190
      const boxH = rowMode ? 76 : 62
      const gap = rowMode ? 128 : 92
      const n = nodes.length
      const width = rowMode ? pad * 2 + n * boxW + (n - 1) * gap : pad * 2 + boxW
      const height = rowMode
        ? pad * 2 + titleBand + boxH
        : pad * 2 + titleBand + n * boxH + (n - 1) * gap

      const scene = {
        width: width,
        height: height,
        pad: pad,
        titleBand: titleBand,
        title: title,
        boxes: [],
        arrows: [],
        accents: [],
      }

      const indexById = Object.create(null)
      for (let i = 0; i < n; i++) {
        let node = nodes[i]
        if (typeof node === 'string') node = { label: node }
        if (!node || typeof node !== 'object') node = {}
        const toneName =
          typeof node.tone === 'string' && TONES[node.tone] ? node.tone : AUTO_TONES[i % AUTO_TONES.length]
        const tone = TONES[toneName]
        const nodeId = node.id != null ? String(node.id) : String(i)
        let x, y
        if (rowMode) {
          x = pad + i * (boxW + gap)
          y = pad + titleBand
        } else {
          x = (width - boxW) / 2
          y = pad + titleBand + i * (boxH + gap)
        }
        scene.boxes.push({
          x: x,
          y: y,
          w: boxW,
          h: boxH,
          cx: x + boxW / 2,
          cy: y + boxH / 2,
          label: node.label == null ? nodeId : String(node.label),
          sub: node.sublabel == null ? '' : String(node.sublabel),
          tone: tone,
          toneName: toneName,
        })
        indexById[nodeId] = i
        indexById[String(i)] = i
      }

      const links = Array.isArray(spec.links) ? spec.links : []
      for (let i = 0; i < links.length; i++) {
        let link = links[i]
        if (Array.isArray(link)) {
          link = { from: link[0], to: link[1], forward: link[2], backward: link[3], tone: link[4] }
        }
        if (!link || typeof link !== 'object') link = {}
        const ai = indexById[String(link.from)]
        const bi = indexById[String(link.to)]
        if (ai === undefined || bi === undefined || ai === bi) continue
        const A = scene.boxes[ai]
        const B = scene.boxes[bi]
        const toneName =
          typeof link.tone === 'string' && TONES[link.tone] ? link.tone : A.toneName || 'blue'
        const tone = TONES[toneName]
        scene.accents.push(tone.accent)
        const forward = link.forward != null ? String(link.forward) : link.label != null ? String(link.label) : ''
        const backward = link.backward != null ? String(link.backward) : ''

        if (rowMode) {
          const x1 = A.x + A.w
          const x2 = B.x
          if (backward) {
            scene.arrows.push({ x1: x1, y1: A.cy - 16, x2: x2, y2: A.cy - 16, tone: tone.accent, label: forward, lx: (x1 + x2) / 2, ly: A.cy - 25, anchor: 'middle' })
            scene.arrows.push({ x1: x2, y1: A.cy + 16, x2: x1, y2: A.cy + 16, tone: tone.accent, label: backward, lx: (x1 + x2) / 2, ly: A.cy + 38, anchor: 'middle' })
          } else {
            scene.arrows.push({ x1: x1, y1: A.cy, x2: x2, y2: A.cy, tone: tone.accent, label: forward, lx: (x1 + x2) / 2, ly: A.cy - 12, anchor: 'middle' })
          }
        } else {
          const y1 = A.y + A.h
          const y2 = B.y
          const lx = A.cx + A.w / 2 + 10
          if (backward) {
            scene.arrows.push({ x1: A.cx - 14, y1: y1, x2: B.cx - 14, y2: y2, tone: tone.accent, label: forward, lx: lx, ly: (y1 + y2) / 2 - 4, anchor: 'start' })
            scene.arrows.push({ x1: B.cx + 14, y1: y2, x2: A.cx + 14, y2: y1, tone: tone.accent, label: backward, lx: lx, ly: (y1 + y2) / 2 + 14, anchor: 'start' })
          } else {
            scene.arrows.push({ x1: A.cx, y1: y1, x2: B.cx, y2: y2, tone: tone.accent, label: forward, lx: A.cx + 14, ly: (y1 + y2) / 2 + 2, anchor: 'start' })
          }
        }
      }

      return scene
    }

    function renderScene(scene, keyPrefix) {
      const defs = []
      const seen = Object.create(null)
      for (let i = 0; i < scene.accents.length; i++) {
        const c = scene.accents[i]
        if (seen[c]) continue
        seen[c] = true
        const safe = c.replace('#', '')
        defs.push(
          e(
            'marker',
            {
              key: 'mk-' + safe,
              id: keyPrefix + '-mk-' + safe,
              markerWidth: 7,
              markerHeight: 7,
              refX: 6,
              refY: 2.4,
              orient: 'auto',
              markerUnits: 'strokeWidth',
            },
            e('path', { d: 'M0,0 L6,2.4 L0,4.8 Z', fill: c }),
          ),
        )
      }
      const markerUrl = function (c) {
        return 'url(#' + keyPrefix + '-mk-' + c.replace('#', '') + ')'
      }

      const kids = []
      kids.push(
        e('rect', {
          key: 'panel',
          x: 0.75,
          y: 0.75,
          width: scene.width - 1.5,
          height: scene.height - 1.5,
          rx: 16,
          ry: 16,
          fill: '#ffffff',
          stroke: '#e3e9f0',
          strokeWidth: 1.5,
        }),
      )
      if (scene.title) {
        kids.push(
          e(
            'text',
            { key: 'title', x: scene.pad + 4, y: scene.pad + 18, fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: '#33414d' },
            scene.title,
          ),
        )
      }
      for (let i = 0; i < scene.boxes.length; i++) {
        const b = scene.boxes[i]
        kids.push(e('rect', { key: 'bx' + i, x: b.x, y: b.y, width: b.w, height: b.h, rx: 12, ry: 12, fill: b.tone.fill, stroke: b.tone.stroke, strokeWidth: 1.5 }))
        if (b.sub) {
          kids.push(e('text', { key: 'bl' + i, x: b.cx, y: b.cy - 7, textAnchor: 'middle', fontFamily: FONT, fontSize: 15, fontWeight: 600, fill: b.tone.text }, b.label))
          kids.push(e('text', { key: 'bs' + i, x: b.cx, y: b.cy + 14, textAnchor: 'middle', fontFamily: FONT, fontSize: 12.5, fill: '#64707d' }, b.sub))
        } else {
          kids.push(e('text', { key: 'bl' + i, x: b.cx, y: b.cy + 1, textAnchor: 'middle', dominantBaseline: 'middle', fontFamily: FONT, fontSize: 15, fontWeight: 600, fill: b.tone.text }, b.label))
        }
      }
      for (let i = 0; i < scene.arrows.length; i++) {
        const a = scene.arrows[i]
        kids.push(e('line', { key: 'ln' + i, x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2, stroke: a.tone, strokeWidth: 1.6, strokeLinecap: 'round', markerEnd: markerUrl(a.tone) }))
        if (a.label) {
          kids.push(e('text', { key: 'lt' + i, x: a.lx, y: a.ly, textAnchor: a.anchor || 'middle', fontFamily: FONT, fontSize: 11.5, fontWeight: 600, fill: a.tone }, a.label))
        }
      }

      return e(
        'svg',
        {
          viewBox: '0 0 ' + scene.width + ' ' + scene.height,
          width: '100%',
          role: 'img',
          preserveAspectRatio: 'xMidYMid meet',
          style: { display: 'block', width: '100%', maxWidth: scene.width + 'px', height: 'auto', margin: '10px 0' },
        },
        e('defs', { key: 'defs' }, defs),
        kids,
      )
    }

    function DiagramLayer(props) {
      const code = props.code || ''
      const keyPrefix = React.useMemo(function () {
        return 'dgm' + Math.random().toString(36).slice(2, 9)
      }, [code])

      if (props.streaming) return props.children
      let spec = null
      try {
        spec = JSON.parse(code)
      } catch (err) {
        return props.children
      }
      if (!spec || !Array.isArray(spec.nodes) || !spec.nodes.length) return props.children

      let scene = null
      try {
        scene = buildScene(spec)
      } catch (err) {
        return props.children
      }
      return e('div', { style: { width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } }, renderScene(scene, keyPrefix))
    }

    function sanitizeSvg(code) {
      return String(code || '')
        .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '')
        .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
        .replace(/javascript:/gi, '')
    }

    function SvgLayer(props) {
      if (props.streaming) return props.children
      const code = props.code || ''
      if (!/<\s*svg[\s>]/i.test(code)) return props.children
      return e('div', {
        style: { width: '100%', overflowX: 'auto', margin: '10px 0' },
        dangerouslySetInnerHTML: { __html: sanitizeSvg(code) },
      })
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.chat.markdown.fence', function () {
          return ctx.slots.register(
            { name: 'conversation.chat.markdown.fence', key: 'diagram', id: '@supremeidol/dsh-diagram/fence/diagram' },
            DiagramLayer,
          )
        })
        ctx.slots.inject('conversation.chat.markdown.fence', function () {
          return ctx.slots.register(
            { name: 'conversation.chat.markdown.fence', key: 'svg', id: '@supremeidol/dsh-diagram/fence/svg' },
            SvgLayer,
          )
        })
      },
    }
  },
})
