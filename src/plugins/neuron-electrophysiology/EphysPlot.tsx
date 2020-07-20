import Plot from 'react-plotly.js';
import { Select, Checkbox } from 'antd';
import * as React from 'react';

export type TraceData = {
  y: any;
  name: string;
  x?: any;
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

const EphysPlot: React.FC<{ options: DataSets; index: RABIndex }> = ({
  options,
  index,
}) => {
  const [selectedDataSet, setSelectedDataSet] = React.useState<string>('');
  const [selectedSweeps, setSelectedSweeps] = React.useState<string[]>([]);
  const [selectedRepitition, setSelectedRepitition] = React.useState<string>(
    ''
  );

  const sweeps: Sweep | undefined = React.useMemo(() => {
    return index.data[selectedDataSet]
      ? index.data[selectedDataSet].sweeps
      : undefined;
  }, [selectedDataSet, index]);

  const repetitions: Repetition | undefined = React.useMemo(() => {
    return index.data[selectedDataSet]
      ? index.data[selectedDataSet].repetitions
      : undefined;
  }, [selectedDataSet, index]);

  const selectedMetadata: IndexDataValue | undefined = React.useMemo(() => {
    return index.data[selectedDataSet];
  }, [selectedDataSet, index]);

  const dataSetOptions = Object.keys(index.data).map(O => {
    return <Select.Option key={O}>{O}</Select.Option>;
  });

  const dataResponse: TraceData[] = React.useMemo(() => {
    const deltaTime = selectedMetadata ? selectedMetadata?.dt : 1;
    return selectedSweeps.map(s => {
      const name = options[`${selectedDataSet} ${s} v`]?.name;
      const y = options[`${selectedDataSet} ${s} v`]
        ? options[`${selectedDataSet} ${s} v`].y
        : [];
      const x = y.map((m: any, i: number) => i * deltaTime);
      return {
        y,
        x,
        name,
      };
    });
  }, [options, selectedDataSet, selectedSweeps, selectedMetadata]);

  const dataStimulus: TraceData[] = React.useMemo(() => {
    const deltaTime = selectedMetadata ? selectedMetadata?.dt : 1;
    return selectedSweeps.map(s => {
      const y = options[`${selectedDataSet} ${s} i`]
        ? options[`${selectedDataSet} ${s} i`].y
        : [];
      const name = options[`${selectedDataSet} ${s} i`]?.name;
      const x = y.map((m: any, i: number) => i * deltaTime);
      return {
        y,
        x,
        name,
      };
    });
  }, [options, selectedMetadata, selectedDataSet, selectedSweeps]);

  return (
    <>
      <div style={{ margin: '10px' }}>
        <label>Trace</label>
        <Select
          size={'default'}
          placeholder="Please select"
          onChange={(value: string) => {
            setSelectedSweeps([]);
            setSelectedRepitition('');
            setSelectedDataSet(value);
          }}
          style={{ width: '100%' }}
        >
          {dataSetOptions}
        </Select>
      </div>
      <div style={{ margin: '10px' }}>
        <label>Repitition</label>
        <Select
          size={'default'}
          placeholder="Please select"
          value={selectedRepitition}
          onChange={(value: string) => {
            setSelectedRepitition(value);
            if (repetitions) {
              setSelectedSweeps(repetitions[value].sweeps);
            }
          }}
          style={{ width: '100%' }}
        >
          {repetitions
            ? Object.keys(repetitions).map(v => {
                return <Select.Option key={v}>{v}</Select.Option>;
              })
            : null}
        </Select>
      </div>
      <div style={{ margin: '10px' }}>
        <span>
          Sweeps
          <Checkbox
            style={{ margin: '0px 10px 0px 10px' }}
            indeterminate={
              sweeps
                ? selectedSweeps.length > 0 &&
                  selectedSweeps.length < Object.keys(sweeps).length
                : false
            }
            onChange={e => {
              if (
                sweeps &&
                selectedSweeps.length === Object.keys(sweeps).length
              ) {
                setSelectedSweeps([]);
              } else {
                if (repetitions && repetitions[selectedRepitition]) {
                  setSelectedSweeps(repetitions[selectedRepitition].sweeps);
                }
              }
            }}
            checked={
              sweeps
                ? selectedSweeps.length === Object.keys(sweeps).length
                : false
            }
          >
            All
          </Checkbox>
        </span>
        <br />
        <span>
          <Select
            mode="tags"
            size="default"
            placeholder="Please select"
            defaultValue={selectedSweeps}
            value={selectedSweeps}
            onChange={(value: string[]) => {
              setSelectedSweeps(value);
            }}
            style={{ width: '100%' }}
          >
            {sweeps
              ? Object.keys(sweeps).map(v => {
                  return <Select.Option key={v}>{v}</Select.Option>;
                })
              : null}
          </Select>
        </span>
      </div>
      <Plot
        data={dataStimulus}
        layout={{
          title: 'Stimulus',
          xaxis: {
            title: {
              text: selectedMetadata ? selectedMetadata.t_unit : '',
            },
          },
          yaxis: {
            title: {
              text: selectedMetadata ? selectedMetadata.i_unit : '',
            },
          },
          autosize: true,
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displaylogo: false }}
      />
      <Plot
        data={dataResponse}
        layout={{
          title: 'Response',
          xaxis: {
            title: {
              text: selectedMetadata ? selectedMetadata.t_unit : '',
            },
          },
          yaxis: {
            title: {
              text: selectedMetadata ? selectedMetadata.v_unit : '',
            },
          },
          autosize: true,
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displaylogo: false }}
      />
    </>
  );
};

export default EphysPlot;
