import * as React from 'react';

import './morpho-legend.css';

const MorphoLegend: React.FC<{
  isPolyline: boolean;
  isInterneuron: boolean;
}> = ({ isPolyline, isInterneuron }) => {
  return (
    <div className="morpho-legend">
      <ul>
        <li className={isPolyline ? '' : 'soma'}>
          {isPolyline ? 'Soma (not supported in line mode)' : 'Soma'}
        </li>
        <li className="axon">Axon</li>

        {// Interneurons don't have a distinction between Basal / Apical Dendrites
        isInterneuron ? (
          <li className="basal-dendrites">Dendrites</li>
        ) : (
          <>
            <li className="basal-dendrites">Basal Dendrites</li>
            <li className="apical-dendrites">Apical Dendrites</li>
          </>
        )}
      </ul>
    </div>
  );
};

export default MorphoLegend;
