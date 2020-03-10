import * as React from 'react';
import { ZoomRange, ProcessedTraceData } from '../types.js';
import Graph from './Graph';
import Sweeps from './Sweeps';

const EphysSweepsViewer: React.FC<{
  dataset: ProcessedTraceData;
  iUnit: string;
  vUnit: string;
}> = ({ dataset, iUnit, vUnit }) => {
  const [zoomRange, setZoomRange] = React.useState<ZoomRange>();
  const [selectedSweep, setSelectedSweep] = React.useState<string | null>(
    dataset.sweeps[0].sweepKey
  );

  const handleSelectedSweep = (sweepKey: string) => {
    if (sweepKey === selectedSweep) {
      setSelectedSweep(null);
      return;
    }
    setSelectedSweep(sweepKey);
  };

  const handleOnSeriesHighlight = (series: string) => {
    setSelectedSweep(series);
  };

  return (
    <div className="ephys-viewer">
      <Sweeps
        selectedSweep={selectedSweep}
        sweeps={dataset.sweeps}
        onSelectSweep={handleSelectedSweep}
      />
      <Graph
        title="Stimulus"
        yLabel={iUnit}
        data={dataset.stimulusData}
        selectedSweep={selectedSweep}
        onSeriesHighlight={handleOnSeriesHighlight}
        zoomRange={zoomRange}
        onZoom={setZoomRange}
        sweeps={dataset.sweeps}
      />
      <Graph
        title="Response"
        yLabel={vUnit}
        data={dataset.responseData}
        selectedSweep={selectedSweep}
        onSeriesHighlight={handleOnSeriesHighlight}
        zoomRange={zoomRange}
        onZoom={setZoomRange}
        sweeps={dataset.sweeps}
      />
    </div>
  );
};

export default EphysSweepsViewer;
