import * as React from 'react';
import Plot from 'react-plotly.js';
import { Radio } from 'antd';

import { convertVolts, Volts } from '../utils/plotHelpers';
import { TraceData, IndexDataValue } from '../EphysPlot';

const DEFAULT_RESPONSE_UNIT = 'mV';

const ResponsePlot: React.FC<{
  metadata: IndexDataValue | undefined;
  sweeps: string[];
  dataset: string;
  options: any;
}> = ({ metadata, sweeps, dataset, options }) => {
  const [responseUnit, setResponseUnit] = React.useState<Volts>(
    DEFAULT_RESPONSE_UNIT
  );

  const isVolts = metadata && metadata.v_unit === 'volts';

  const dataResponse: TraceData[] = React.useMemo(() => {
    const deltaTime = metadata ? metadata?.dt : 1;
    return sweeps.map(s => {
      const name = options[`${dataset} ${s} v`]?.name;
      const y = options[`${dataset} ${s} v`]
        ? options[`${dataset} ${s} v`].y
        : [];
      const yConverted = isVolts ? convertVolts(y, responseUnit) : y;
      const x = y.map((m: any, i: number) => i * deltaTime);
      return {
        y: yConverted,
        x,
        name,
      };
    });
  }, [options, dataset, sweeps, metadata, responseUnit]);

  const onChangeResponseUnits = (event: any) => {
    setResponseUnit(event.target.value);
  };

  const xTitle = metadata ? metadata.t_unit : '';

  const yTitle = isVolts ? responseUnit : (metadata && metadata.v_unit) || '';

  return (
    <>
      <Plot
        data={dataResponse}
        layout={{
          title: 'Response',
          xaxis: {
            title: {
              text: xTitle,
            },
          },
          yaxis: {
            title: {
              text: yTitle,
            },
          },
          autosize: true,
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displaylogo: false }}
      />
      {isVolts && (
        <Radio.Group
          onChange={onChangeResponseUnits}
          value={responseUnit}
          size="small"
        >
          <Radio.Button value={DEFAULT_RESPONSE_UNIT}>
            {DEFAULT_RESPONSE_UNIT}
          </Radio.Button>
          <Radio.Button value="V">V</Radio.Button>
        </Radio.Group>
      )}
    </>
  );
};

export default ResponsePlot;
