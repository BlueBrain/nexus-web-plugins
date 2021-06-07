import * as React from 'react';
import Plot from 'react-plotly.js';

import { convertVolts, Volts } from '../utils/plotHelpers';
import { TraceData, IndexDataValue, ZoomRanges } from '../EphysPlot';

const DEFAULT_RESPONSE_UNIT = 'mV';

const ResponsePlot: React.FC<{
  metadata?: IndexDataValue;
  sweeps: string[];
  dataset: string;
  options: any;
  zoomRanges: ZoomRanges | null;
  onZoom: (zoomRanges: ZoomRanges) => void;
}> = ({ metadata, sweeps, dataset, options, zoomRanges, onZoom }) => {
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
        onRelayout={e => {
          const {
            'xaxis.range[0]': x1,
            'xaxis.range[1]': x2,
            'yaxis.range[0]': y1,
            'yaxis.range[1]': y2,
          } = e;
          onZoom({ x: [x1, x2], y: [y1, y2] });
        }}
        layout={{
          title: 'Response',
          xaxis: {
            title: {
              text: `Time (${xTitle})`,
            },
            range: zoomRanges?.x,
          },
          yaxis: {
            title: {
              text: `Membrane Potential (${yTitle})`,
            },
            range: zoomRanges?.y,
            zeroline: false,
          },
          autosize: true,
          showlegend: true,
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displaylogo: false }}
      />
    </>
  );
};

export default ResponsePlot;
