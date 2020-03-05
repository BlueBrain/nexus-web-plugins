import * as React from 'react';
import { get, sortBy } from 'lodash';
import './sweeps-container.css';
import PlayIterable from './PlayIterable';

function setSweepClass(key: string, selectedSweep: string) {
  if (key === selectedSweep) {
    return 'sweep selected';
  }
  return 'sweep';
}

interface SweepsProps {
  sweeps: any[];
  selectedSweep: any;
  onSelectSweep: (sweepKey: string) => void;
}

const Sweeps: React.FunctionComponent<SweepsProps> = props => {
  const { sweeps, selectedSweep, onSelectSweep } = props;
  const sweepIndex = sweeps.findIndex(
    sweep => sweep.sweepKey === selectedSweep
  );
  const selectedSweepObj = sweeps[sweepIndex];
  const currents = get(selectedSweepObj, 'current.i_segments');
  const maxCurrent = sortBy(currents || [], 'amp');
  const selectedMaxCurrent = get(maxCurrent.pop(), 'amp');
  return (
    <div className="sweeps-container">
      {sweeps && !!sweeps.length && (
        <PlayIterable
          className="sweeps"
          iterables={sweeps}
          interval={700}
          startIndex={sweepIndex}
          onIterate={iterable => onSelectSweep(iterable.sweepKey)}
          renderIterable={iterable => {
            // experimental traces don't have maxCurrent
            const toolTipText = !!iterable.maxCurrent
              ? `sweep ${iterable.sweepKey} (${iterable.maxCurrent.toFixed(
                  2
                )} pA)`
              : `sweep ${iterable.sweepKey} `;

            return (
              <li
                key={iterable.sweepKey}
                className={setSweepClass(iterable.sweepKey, selectedSweep)}
                style={{ backgroundColor: iterable.color }}
                onClick={() => onSelectSweep(iterable.sweepKey)}
              />
            );
          }}
        />
      )}
      <div>
        {selectedSweep && (
          <div className="label">
            <span>
              sweep <em>{selectedSweep}</em>
            </span>
          </div>
        )}
        {selectedMaxCurrent && (
          <div className="label">
            <span>
              current <em>{selectedMaxCurrent.toFixed(2)} pA</em>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sweeps;
