import * as React from 'react';
import { get, sortBy } from 'lodash';

import './sweeps-container.css';

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
      <div>
        <label>Select Sweeps</label>
        <br />
        <ol className="sweeps">
          {!!sweeps &&
            !!sweeps.length &&
            sweeps.map(({ sweepKey, color: backgroundColor }) => (
              <li
                key={sweepKey}
                className={setSweepClass(sweepKey, selectedSweep)}
                style={{ backgroundColor }}
                onClick={() => onSelectSweep(sweepKey)}
              />
            ))}
        </ol>
      </div>

      <div className="keys">
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
