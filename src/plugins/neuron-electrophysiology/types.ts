import { IndexDataValue, ZoomRanges } from "./EphysPlot";

export type Trace = {
  dt: number; // Delta Time
  dur: number; // Duration of Experiment
  i_unit: string; // i unit like pA (amplitude) for stimulus
  t_unit: string; // time unit like s for seconds
  v_unit: string; // voltage unite like mV for response
  values: {
    [sweepLabel: string]: {
      i: number[];
      v: number[];
    };
  };
};

export type ProcessedTraceData = {
  sweeps: {
    sweepKey: string;
    color: string;
  }[];
  stimulusData: number[][];
  responseData: number[][];
};

export type ZoomRange = {
  x: number[];
  y: number[];
};

export type PlotProps = {
  setSelectedSweeps: (sweeps: string[]) => void;
  metadata?: IndexDataValue;
  sweeps: {
    selectedSweeps: string[];
    previewSweep?: string;
    allSweeps: string[];
    colorMapper: {[key: string]: string}
  },
  dataset: string;
  options: any;
  zoomRanges: ZoomRanges | null;
  onZoom: (zoomRanges: ZoomRanges) => void;
}
