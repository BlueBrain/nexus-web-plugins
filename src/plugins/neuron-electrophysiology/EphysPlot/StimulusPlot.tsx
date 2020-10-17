import * as React from 'react';
import Plot from 'react-plotly.js';
import { Radio } from 'antd';

import { convertAmperes, Amperes } from '../utils/plotHelpers';
import { TraceData, IndexDataValue } from '../EphysPlot';

const DEFAULT_STIMULUS_UNIT = 'pA';

const StimulusPlot: React.FC<{
  metadata: IndexDataValue | undefined;
  sweeps: string[];
  dataset: string;
  options: any;
}> = ({ metadata, sweeps, dataset, options }) => {
  const [stimulusUnit, setStimulusUnit] = React.useState<Amperes>(
    DEFAULT_STIMULUS_UNIT
  );

  const isAmperes = metadata && metadata.i_unit === 'amperes';

  const dataStimulus: TraceData[] = React.useMemo(() => {
    const deltaTime = metadata ? metadata?.dt : 1;
    return sweeps.map(s => {
      const y = options[`${dataset} ${s} i`]
        ? options[`${dataset} ${s} i`].y
        : [];
      const yConverted = isAmperes ? convertAmperes(y, stimulusUnit) : y;
      const name = options[`${dataset} ${s} i`]?.name;
      const x = y.map((m: any, i: number) => i * deltaTime);
      return {
        y: yConverted,
        x,
        name,
      };
    });
  }, [options, metadata, dataset, sweeps, stimulusUnit]);

  const onChangeStimulusUnits = (event: any) => {
    setStimulusUnit(event.target.value);
  };

  const xTitle = metadata ? metadata.t_unit : '';

  const yTitle = isAmperes ? stimulusUnit : (metadata && metadata.i_unit) || '';

  return (
    <>
      <Plot
        data={dataStimulus}
        layout={{
          title: 'Stimulus',
          xaxis: {
            title: {
              text: xTitle,
            },
          },
          yaxis: {
            title: {
              text: yTitle,
            },
            zeroline: false
          },
          autosize: true,
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displaylogo: false }}
      />
      {isAmperes && (
        <Radio.Group
          onChange={onChangeStimulusUnits}
          value={stimulusUnit}
          size="small"
        >
          <Radio.Button value={DEFAULT_STIMULUS_UNIT}>
            {DEFAULT_STIMULUS_UNIT}
          </Radio.Button>
          <Radio.Button value="nA">nA</Radio.Button>
        </Radio.Group>
      )}
    </>
  );
};

export default StimulusPlot;
