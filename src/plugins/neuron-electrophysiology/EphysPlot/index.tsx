import * as React from 'react';
import { Select, Button } from 'antd';

import StimulusPlot from './StimulusPlot';
import ResponsePlot from './ResponsePlot';
import { OptionSelect } from '../components/OptionSelect';
import DistinctColors from 'distinct-colors';
import { TraceSelectorGroup } from '../components/TraceSelectorGroup';

export type TraceData = {
  y: any;
  name: string;
  x?: any;
};

export type ZoomRanges = {
  x: [number | undefined, number | undefined];
  y: [number | undefined, number | undefined];
};

export type DataSets = {
  [key: string]: TraceData;
};

export type Sweep = {
  [key: string]: {
    i: string;
    v: string;
  };
};

export type Repetition = {
  [key: string]: {
    sweeps: string[];
  };
};

export type IndexDataValue = {
  dt: number;
  dur: number;
  i_unit: string;
  name: string;
  repetitions: Repetition;
  sweeps: Sweep;
  t_unit: string;
  v_unit: string;
};

export type RABIndexData = {
  [key: string]: IndexDataValue;
};

export type RABIndex = {
  data: RABIndexData;
  metadata: {
    [key: string]: string;
  };
};

const EphysPlot: React.FC<{
  options: DataSets;
  index: RABIndex;
  defaultStimulusType?: string;
  defaultRepetition?: string;
}> = ({
  options,
  index,
  defaultStimulusType,
  defaultRepetition,
}) => {
  const [zoomRanges, setZoomRanges] = React.useState<ZoomRanges | null>(null);

  const [selectedDataSet, setSelectedDataSet] = React.useState<string>(
    defaultStimulusType || Object.keys(index.data)[0]
  );

  const [selectedRepetition, setSelectedRepetition] = React.useState<string>(
    defaultRepetition || Object.keys(index.data[selectedDataSet].repetitions)[0]
  );

  const [selectedSweeps, setSelectedSweeps] = React.useState<string[]>([]);

  const [previewItem, setPreviewItem] = React.useState<string>();

  const repetitions: Repetition = React.useMemo(() => {
    return index.data[selectedDataSet]
      ? index.data[selectedDataSet].repetitions
      : {};
  }, [selectedDataSet, index]);

  const { sweeps, colorMapper } = React.useMemo(() => {
    const selectedData =  index.data[selectedDataSet]
    if(selectedData && selectedData.repetitions && selectedData.repetitions[selectedRepetition]) {
      const rawData = repetitions[selectedRepetition].sweeps;
      const colors = DistinctColors({count: rawData.length});
      const colorMapper: {[key: string]: string} = rawData.reduce((mapper: object, sweep: string, index) => {
        return {...mapper, [sweep]:  colors[index].hex()}
      }, {})
      return { colorMapper, sweeps: rawData };
    }

    return { sweeps: [], colorMapper: {}};
  }, [selectedDataSet, selectedRepetition, index]);

  const selectedMetadata: IndexDataValue | undefined = React.useMemo(() => {
    return index.data[selectedDataSet];
  }, [selectedDataSet, index]);

  const dataSetOptions = Object.keys(index.data).map(stimulusTypeKey => {
    const repetitionNum = Object.keys(index.data[stimulusTypeKey].repetitions).length;

    return (
      <Select.Option key={stimulusTypeKey} value={stimulusTypeKey}>
        {stimulusTypeKey} {repetitionNum > 1 && `(${repetitionNum})`}
      </Select.Option>
    );
  });

  const repetitionOptions = repetitions
    ? Object.keys(repetitions).map(v => {
      return (
        <Select.Option key={v} value={v}>
          {v}
        </Select.Option>
      );
    })
    : null;

  const sweepsOptions = sweeps
    ? sweeps.map(sweep => ({ label: sweep, value: sweep }))
    : [];

  const handleStimulusChange = (value: string) => {
    setSelectedDataSet(value);
    setSelectedRepetition(Object.keys(index.data[value].repetitions)[0]);
    setSelectedSweeps([])
    setZoomRanges(null);
  };

  const handleRepetitionChange = (value: string) => {
    setSelectedRepetition(value);
    setSelectedSweeps([]);
    setZoomRanges(null);
  };

  const handlePreviewSweep = (sweep?: string) => {
    if(!sweep) {
      setPreviewItem(undefined);
    }
    else if (sweepsOptions.length > 1 && !selectedSweeps.includes(sweep)) {
      setPreviewItem(sweep);
    }
  };

  const sweepObject = {
    selectedSweeps,
    colorMapper,
    allSweeps: sweeps,
    previewSweep:  previewItem,
  }

  return (
    <>
      <div className="ephys-plot-container">
        <OptionSelect
          label={{title: 'Stimulus', numberOfAvailable: Object.keys(index.data).length}}
          options={dataSetOptions}
          value={selectedDataSet}
          handleChange={handleStimulusChange}
        />
        <OptionSelect
          label={{title: 'Repetition', numberOfAvailable: Object.keys(repetitions).length}}
          options={repetitionOptions}
          value={selectedRepetition}
          handleChange={handleRepetitionChange}
          hideWhenSingle
        />
      </div>
        <div className="sweep-selector-container">
          <div className="sweep-selector-label"><b>Sweep</b> ({sweeps.length} available)</div>
          <TraceSelectorGroup
            handlePreviewSweep={handlePreviewSweep}
            colorMapper={colorMapper}
            selectedSweeps={selectedSweeps}
            previewItem={previewItem}
            setSelectedSweeps={setSelectedSweeps}
            sweepsOptions={sweepsOptions}
          />
          {sweeps.length > 1 && (
            <span className="sweep-selector-reset-btn">
              <Button size="small" onClick={() => {setSelectedSweeps([]); setZoomRanges(null);}}>
                Reset
              </Button>
            </span>
          )}
      </div>
      <StimulusPlot
        setSelectedSweeps={setSelectedSweeps}
        metadata={selectedMetadata}
        sweeps={sweepObject}
        dataset={selectedDataSet}
        options={options}
        zoomRanges={zoomRanges}
        onZoom={setZoomRanges}
      />
      <div className="recording-plot">
        <ResponsePlot
          metadata={selectedMetadata}
          sweeps={sweepObject}
          dataset={selectedDataSet}
          setSelectedSweeps={setSelectedSweeps}
          options={options}
          zoomRanges={zoomRanges}
          onZoom={setZoomRanges}
        />
      </div>
    </>
  );
};

export default EphysPlot;
