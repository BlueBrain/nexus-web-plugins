import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { ScreenMap } from "antd/lib/_util/responsiveObserver";
import { Config, Font, Layout } from "plotly.js";
import { CSSProperties } from "react";

interface UseConfigResponse {
  layout: Partial<Layout>;
  config: Partial<Config>;
  antBreakpoints: ScreenMap;
  font: Partial<Font>;
  style: CSSProperties;
}

interface UseConfigProps {
  selectedSweeps: string[];
}

const useConfig = ({selectedSweeps}: UseConfigProps): UseConfigResponse => {
  const antBreakpoints = useBreakpoint();

  return ({
    antBreakpoints,
    config: {
      displayModeBar: antBreakpoints.md,
      responsive: true,
    },
    layout: {
      showlegend: antBreakpoints.md || Boolean(selectedSweeps.length),
      legend: antBreakpoints.md ? {}: {
        x: 1,
        xanchor: 'right',
        y: 1,
      },
      margin: antBreakpoints.md
        ? { l: 55, r: 0, t: 50, b: 50}
        :  { l: 45, r: 0, t: 30, b: 35},
    },
    font: antBreakpoints.md? {}: {
      size: 12,
    },
    style: {
      width:'100%',
      height: '40vh',
    },
  })
}

export { useConfig };
