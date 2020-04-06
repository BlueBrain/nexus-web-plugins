import * as React from 'react';
import { ZoomRange, ProcessedTraceData } from '../types';
import Graph from './Graph';
import Sweeps from './Sweeps';

const EphysGraphComponent: React.FC<{
  dataset: ProcessedTraceData;
  iUnit: string;
  vUnit: string;
  tUnit: string;
}> = ({ dataset, iUnit, vUnit, tUnit }) => {
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
        xLabel={tUnit}
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
        xLabel={tUnit}
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

export default EphysGraphComponent;
