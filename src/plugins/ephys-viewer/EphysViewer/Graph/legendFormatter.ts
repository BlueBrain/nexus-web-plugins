// @ts-ignore
function legendFormatter(data) {
  const g = data.dygraph;

  if (g.getOption('showLabelsOnHighlight') !== true) return '';

  const sepLines = g.getOption('labelsSeparateLines');
  let html;

  if (typeof data.x === 'undefined') {
    if (g.getOption('legend') !== 'always') {
      return '';
    }

    html = '';
    for (let i = 0; i < data.series.length; i++) {
      const series = data.series[i];
      if (!series.isVisible) continue;

      html += `<span style='font-weight: bold; color: ${series.color};'>${series.labelHTML}</span>`;
    }
    return html;
  }

  html = `time: ${data.xHTML}`;
  for (let i = 0; i < data.series.length; i++) {
    const series = data.series[i];
    if (!series.isVisible) continue;
    if (sepLines) html += '';
    const cls = series.isHighlighted ? ' class="highlight"' : '';
    html += `<span${cls}> <b><span style='color: ${series.color};'>${series.labelHTML}</span></b>:&#160;${series.yHTML}</span>`;
  }
  return html;
}

export default legendFormatter;
