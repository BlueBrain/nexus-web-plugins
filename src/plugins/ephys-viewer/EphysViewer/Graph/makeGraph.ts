import Dygraph from 'dygraphs';

import legendFormatter from './legendFormatter';
import { ProcessedTraceData, ZoomRange } from '../../types';

export type MakeGraphOptions = {
  yLabel: string;
  data: ProcessedTraceData['responseData'] | ProcessedTraceData['stimulusData'];
  sweeps: ProcessedTraceData['sweeps'];
  onZoom?: (ranges: ZoomRange) => void;
  onSeriesHighlight?: (seriesName: string) => void;
  config?: any;
};

function makeGraph(
  graphDiv: HTMLDivElement,
  labelsDiv: HTMLDivElement,
  options: MakeGraphOptions,
  config: any = {}
) {
  const { data, sweeps, yLabel, onZoom, onSeriesHighlight } = options;

  const handleHightlight = (
    event: any,
    x: number,
    points: any,
    row: any,
    seriesName: string
  ) => {
    onSeriesHighlight && onSeriesHighlight(seriesName);
  };

  const formattedConfig = Object.assign({
    // legendFormatter,
    // legend: 'always',
    labelsDiv,
    showLabelsOnHighlight: false,
    axisLineColor: '#999',
    colors: sweeps.map(sweep => sweep.color),
    labels: sweeps
      ? ['time'].concat(sweeps.map((sweep: any) => sweep.sweepKey))
      : ['time', 'model'],
    labelsSeparateLines: true,
    highlightSeriesBackgroundAlpha: 0.1,
    highlightSeriesOpts: {
      strokeWidth: 1,
      strokeBorderWidth: 3,
      highlightCircleSize: 3,
    },
    highlightCircleSize: 2,
    drawGrid: false,
    animatedZooms: true,
    highlightCallback: handleHightlight,
    unhighlightCallback: handleHightlight,
    zoomCallback: (minX: number, maxX: number, yRanges: number[][]) => {
      console.log('zoom');
      onZoom &&
        onZoom({
          x: [minX, maxX],
          y: yRanges[0],
        });
    },

    xlabel: 'time [ms]',
    xLabelHeight: 14,
    ylabel: yLabel,
    axes: {
      x: {
        valueFormatter: (v: number) => v.toFixed(2),
      },
      y: {
        valueFormatter: (v: number) => v.toFixed(2),
      },
    },
    ...config,
  });
  return new Dygraph(graphDiv, data, formattedConfig);
}

export default makeGraph;
