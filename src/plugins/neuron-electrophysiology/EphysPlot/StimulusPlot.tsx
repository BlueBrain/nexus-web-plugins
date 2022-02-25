import * as React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import { Radio } from 'antd';

import { convertAmperes, Amperes } from '../utils/plotHelpers';
import { optimizePlotData } from '../utils/optimizeTrace';
import { useConfig } from '../hooks/useConfig';
import { PlotData } from 'plotly.js';
import { PlotProps } from '../types';

const Plot = createPlotlyComponent(Plotly);

const DEFAULT_STIMULUS_UNIT = 'pA';

const StimulusPlot: React.FC<PlotProps> = ({
  metadata,
  setSelectedSweeps,
  sweeps: { selectedSweeps, previewSweep, allSweeps, colorMapper},
  dataset,
  options,
  zoomRanges,
  onZoom
}) => {
  const [stimulusUnit, setStimulusUnit] = React.useState<Amperes>(DEFAULT_STIMULUS_UNIT);

  const isAmperes = metadata && metadata.i_unit === 'amperes';
  const {config, layout, font, style, antBreakpoints} = useConfig({selectedSweeps});

  const rawData = React.useMemo(() => {
    const deltaTime = metadata ? metadata?.dt : 1;
    const zoom = {
      xstart: zoomRanges?.x[0],
      xend: zoomRanges?.x[1],
    }

    const allSweepsData = allSweeps.map(sweep => {
      const name = options[`${dataset} ${sweep} i`]?.name;
      const y = options[`${dataset} ${sweep} i`]
        ? options[`${dataset} ${sweep} i`].y
        : [];

      const yConverted = isAmperes ? convertAmperes(y, stimulusUnit) : y;
      const color = colorMapper[sweep];

      return {
        name,
        y: yConverted,
        line: {
         color
        },
        sweepName: sweep,
      };
    })

    return optimizePlotData(allSweepsData, deltaTime, zoom) || [];
  }, [options, dataset, metadata, zoomRanges, allSweeps, isAmperes, colorMapper, stimulusUnit])

  const selectedResponse: Partial<PlotData>[] = React.useMemo(() => {
    return rawData?.filter((data) => selectedSweeps.includes(data.sweepName))
  }, [options, dataset, selectedSweeps, metadata]);

  const previewDataResponse: Partial<PlotData>[] = React.useMemo(() => {
    return rawData?.map((data: {sweepName: string}) => {
      const isSelected = selectedSweeps.includes(data.sweepName);
      const isPreview = data.sweepName === previewSweep;
      const opacity = isPreview || isSelected ? 1: 0.05;

      return { ...data, opacity };
    });
  }, [previewSweep]);

  const onChangeStimulusUnits = (event: any) => {
    setStimulusUnit(event.target.value);
  };

  const handleClick = ({data, curveNumber}: Readonly<Plotly.LegendClickEvent>): boolean => {
    const value: string = (data[curveNumber] as any).sweepName;
    const isSelected = selectedSweeps.includes(value);
    if(isSelected) {
      setSelectedSweeps(selectedSweeps.filter(sweep => sweep!==value));
    }
    else {
      setSelectedSweeps([...selectedSweeps, value]);
    }

    return false;
  }

  const xTitle = metadata ? metadata.t_unit : '';
  const yTitle = isAmperes ? stimulusUnit : (metadata && metadata.i_unit) || '';

  const isEmptySelection = !selectedSweeps.length;

  return (
    <>
      <Plot
        data={previewSweep ? previewDataResponse : (isEmptySelection ? rawData: selectedResponse)}
        onLegendClick={handleClick}
        onDoubleClick={() => false}
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
          title: 'Stimulus',
          xaxis: {
            title: {
              font,
              text: `Time (${xTitle})`,
            },
            range: zoomRanges?.x,
          },
          yaxis: {
            title: {
              font,
              text: `Current (${yTitle})`,
            },
            range: zoomRanges?.y,
            zeroline: false,
          },
          autosize: true,
          ...layout,
        }}
        style={style}
        config={{ displaylogo: false, ...config }}
      />
      {isAmperes && antBreakpoints.md && (
        <Radio.Group
          onChange={onChangeStimulusUnits}
          value={stimulusUnit}
          size="small"
          className="units"
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
