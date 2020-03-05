import { Trace, ProcessedTraceData } from '../types.js';
import randomColor from 'randomcolor';

const processTrace = (trace: Trace): ProcessedTraceData => {
  const { dt: deltaTime, dur: duration } = trace;

  const palette = randomColor({
    count: Object.keys(trace.values).length,
    luminosity: 'light',
  });

  const sweeps = Object.keys(trace.values)
    .map((sweepKey, index) => {
      return {
        sweepKey,
        color: palette[index],
      };
    })
    .filter(sweep => !!trace.values[sweep.sweepKey].i);

  const length = duration / deltaTime;

  const stimulusData = [];
  const responseData = [];

  for (let index = 0; index <= length; index++) {
    const time = index * deltaTime;

    stimulusData.push(
      sweeps.reduce(
        (accumulator, sweep) => {
          const sweepValue = trace.values[sweep.sweepKey];
          return accumulator.concat(Number(sweepValue.i[index]));
        },
        [time]
      )
    );
    responseData.push(
      sweeps.reduce(
        (accumulator, sweep) => {
          const sweepValue = trace.values[sweep.sweepKey];
          return accumulator.concat(Number(sweepValue.v[index]));
        },
        [time]
      )
    );
  }
  return {
    sweeps,
    stimulusData,
    responseData,
  };
};

export default processTrace;
