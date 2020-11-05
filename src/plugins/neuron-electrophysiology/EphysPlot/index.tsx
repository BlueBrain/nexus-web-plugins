import * as React from 'react';
import { Select, Checkbox, Button } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

import StimulusPlot from './StimulusPlot';
import ResponsePlot from './ResponsePlot';

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
  goToImage: (stimulusType: string, repetition: string) => void;
}> = ({
  options,
  index,
  defaultStimulusType,
  defaultRepetition,
  goToImage,
}) => {
  const [zoomRanges, setZoomRanges] = React.useState<ZoomRanges | null>(null);

  const [selectedDataSet, setSelectedDataSet] = React.useState<string>(
    defaultStimulusType || Object.keys(index.data)[0]
  );

  const [selectedRepetition, setSelectedRepetition] = React.useState<string>(
    defaultRepetition || Object.keys(index.data[selectedDataSet].repetitions)[0]
  );

  const [selectedSweeps, setSelectedSweeps] = React.useState<string[]>(
    index.data[selectedDataSet].repetitions[selectedRepetition].sweeps
  );

  const sweeps: string[] = React.useMemo(() => {
    return index.data[selectedDataSet]
      ? index.data[selectedDataSet].repetitions[selectedRepetition].sweeps
      : [];
  }, [selectedDataSet, selectedRepetition, index]);

  const repetitions: Repetition = React.useMemo(() => {
    return index.data[selectedDataSet]
      ? index.data[selectedDataSet].repetitions
      : {};
  }, [selectedDataSet, index]);

  const selectedMetadata: IndexDataValue | undefined = React.useMemo(() => {
    return index.data[selectedDataSet];
  }, [selectedDataSet, index]);

  const dataSetOptions = Object.keys(index.data).map(stimulusTypeKey => {
    return (
      <Select.Option key={stimulusTypeKey} value={stimulusTypeKey}>
        {stimulusTypeKey}
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
    ? sweeps.map(v => {
        return (
          <Select.Option key={v} value={v}>
            {v}
          </Select.Option>
        );
      })
    : null;

  const handleStimulusChange = (value: string) => {
    setSelectedDataSet(value);
    setSelectedRepetition(Object.keys(repetitions)[0]);
    setSelectedSweeps(
      index.data[value]?.repetitions[selectedRepetition].sweeps
    );
  };

  const handleRepetitionChange = (value: string) => {
    setSelectedRepetition(value);
    setSelectedSweeps(repetitions[value].sweeps);
  };

  const handleSelectAllSweeps = () => {
    if (selectedSweeps.length === sweeps.length) {
      setSelectedSweeps([]);
    } else {
      setSelectedSweeps(sweeps);
    }
  };

  const handleGoToImage = () => {
    goToImage(selectedDataSet, selectedRepetition);
  };

  return (
    <>
      <div style={{ margin: '10px' }}>
        <label>
          <b>Stimulus </b>({Object.keys(index.data).length} available)
        </label>
        <Select
          value={selectedDataSet}
          placeholder="Please select"
          onChange={handleStimulusChange}
          style={{ width: '100%' }}
        >
          {dataSetOptions}
        </Select>
      </div>
      <div style={{ margin: '10px' }}>
        <label>
          <b>Repetition </b>
          {repetitions && `(${Object.keys(repetitions).length} available)`}
        </label>
        <Select
          placeholder="Please select"
          value={selectedRepetition}
          onChange={handleRepetitionChange}
          style={{ width: '100%' }}
        >
          {repetitionOptions}
        </Select>
      </div>
      <div>
        <Button onClick={handleGoToImage}>View Images</Button>
      </div>
      <div style={{ margin: '10px' }}>
        <span>
          <b>Sweeps</b>
          <Checkbox
            style={{ margin: '0px 10px 0px 10px' }}
            indeterminate={
              sweeps
                ? selectedSweeps.length > 0 &&
                  selectedSweeps.length < sweeps.length
                : false
            }
            onChange={handleSelectAllSweeps}
            checked={selectedSweeps.length === sweeps.length}
          >
            All (<span>{sweeps && sweeps.length}</span> available)
          </Checkbox>
        </span>
        <br />
        <span>
          <Select
            value={selectedSweeps}
            mode="tags"
            placeholder="Please select"
            onChange={(value: string[]) => {
              setSelectedSweeps(value);
            }}
            style={{ width: '100%' }}
          >
            {sweepsOptions}
          </Select>
        </span>
      </div>
      <ResponsePlot
        metadata={selectedMetadata}
        sweeps={selectedSweeps}
        dataset={selectedDataSet}
        options={options}
        zoomRanges={zoomRanges}
        onZoom={setZoomRanges}
      />
      <StimulusPlot
        metadata={selectedMetadata}
        sweeps={selectedSweeps}
        dataset={selectedDataSet}
        options={options}
        zoomRanges={zoomRanges}
        onZoom={setZoomRanges}
      />
    </>
  );
};

export default EphysPlot;
