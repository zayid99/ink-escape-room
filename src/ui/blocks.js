// Renders the block format used by documents and journal pages.
//
// Block types:
//   { h: 'Heading' }                 { p: 'Typed paragraph' }
//   { hand: 'Black handwriting' }    { red: 'Red pen', rot: -2, align: 'right', size: 1.2 }
//   { meta: 'Small caption' }        { rule: true }
//   { stamp: 'STAMPED TEXT' }        { list: ['a', 'b'] }
//   { sketch: (pen, w, h, tick) => void, w: 360, h: 220, label: 'alt text' }
//   { table: [['a','b'],['c','d']] }

import { el, inline, sketchCanvas } from './dom.js';

export function renderBlocks(blocks, { boil = () => 1 } = {}) {
  const disposers = [];
  const root = el('div', { class: 'blocks' });
  for (const b of blocks) {
    if (!b) continue;
    // Sketches first: their `w`/`h` are dimensions, not a heading.
    if (b.sketch) {
      const sk = sketchCanvas(b.sketch, b.w || 360, b.h || 220, { boil, label: b.label });
      disposers.push(sk.dispose);
      root.append(el('figure', { class: 'doc-sketch' }, [sk.node, b.caption ? el('figcaption', {}, [inline(b.caption)]) : null]));
    } else if (b.h) root.append(el('h3', { class: 'doc-h' }, [inline(b.h)]));
    else if (b.p) root.append(el('p', { class: 'doc-p' }, [inline(b.p)]));
    else if (b.hand) root.append(el('p', { class: 'doc-hand' }, [inline(b.hand)]));
    else if (b.red) {
      const node = el('p', { class: `doc-red align-${b.align || 'left'}` }, [inline(b.red)]);
      node.style.transform = `rotate(${b.rot ?? -1.5}deg)`;
      if (b.size) node.style.fontSize = `${b.size}em`;
      root.append(node);
    } else if (b.meta) root.append(el('p', { class: 'doc-meta' }, [inline(b.meta)]));
    else if (b.rule) root.append(el('hr', { class: 'doc-rule' }));
    else if (b.stamp) root.append(el('p', { class: 'doc-stamp', text: b.stamp }));
    else if (b.list) root.append(el('ul', { class: 'doc-list' }, b.list.map((li) => el('li', {}, [inline(li)]))));
    else if (b.table) {
      root.append(
        el(
          'table',
          { class: 'doc-table' },
          b.table.map((row, i) => el('tr', {}, row.map((cell) => el(i === 0 && b.header ? 'th' : 'td', {}, [inline(String(cell))])))),
        ),
      );
    }
  }
  return { node: root, dispose: () => disposers.forEach((d) => d()) };
}
