import * as React from 'react';

import makeGraph from './makeGraph';
import { ProcessedTraceData, ZoomRange } from '../../types';

import './graph-viewer.css';

const Graph: React.FunctionComponent<{
  title: string;
  yLabel: string;
  data: ProcessedTraceData['responseData'] | ProcessedTraceData['stimulusData'];
  sweeps: ProcessedTraceData['sweeps'];
  selectedSweep: string | null;
  zoomRange?: ZoomRange;
  onZoom?: (zoomRange: ZoomRange) => void;
  onSeriesHighlight?: (seriesName: string) => void;
}> = ({
  title,
  data,
  sweeps,
  yLabel,
  zoomRange,
  onZoom,
  selectedSweep,
  onSeriesHighlight,
}) => {
  const graphDiv = React.useRef<HTMLDivElement>(null);
  const labelsDiv = React.useRef<HTMLDivElement>(null);
  const [graph, setGraph] = React.useState<Dygraph>();

  React.useEffect(() => {
    if (!!graphDiv.current && !!labelsDiv.current) {
      setGraph(
        makeGraph(graphDiv.current, labelsDiv.current, {
          data,
          sweeps,
          yLabel,
          onZoom,
          onSeriesHighlight,
        })
      );
    }
    return () => {
      graph && graph.destroy();
    };
  }, [graphDiv, labelsDiv]);

  // set selected sweep
  React.useEffect(() => {
    if (!!graph) {
      if (selectedSweep) {
        graph.setSelection(false, selectedSweep);
      } else {
        graph.clearSelection();
      }
    }
  }, [selectedSweep]);

  // reset zoom
  React.useEffect(() => {
    if (!!graph && zoomRange) {
      const zoomDifference = zoomRange.x[1] - zoomRange.x[0];
      let precision = 2;
      if (zoomDifference < 1) {
        precision = 4;
      }
      if (zoomDifference < 0.1) {
        precision = 8;
      }

      graph.updateOptions({
        dateWindow: zoomRange.x,
        // We don't really want Y values... becaus each graph is different
        // but keeping this example as a option
        // valueRange: zoomRange.y

        // Let's update the axes value formatter so we can see the
        // correct precison (unclear if this is working)
        axes: {
          x: {
            valueFormatter: (v: number) => v.toFixed(precision),
          },
        },
      });
    }
  }, [zoomRange, graph]);

  return (
    <div className="graph-viewer">
      <h3 className="header">{title}</h3>
      <div className="wrapper">
        <div className="graph" ref={graphDiv} />
      </div>
      <div className="labels" ref={labelsDiv} />
    </div>
  );
};

export default Graph;
