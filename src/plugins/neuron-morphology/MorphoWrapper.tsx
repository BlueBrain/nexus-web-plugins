import * as React from 'react';
import { Button } from 'antd';

import MorphologyViewer, { MorphoViewerOptions } from './MorphologyViewer';

import './morpho-wrapper.css';

const MorphoWrapper: React.FC<{
  loading: boolean;
  error: Error | null;
  data: any;
  options: MorphoViewerOptions;
  onPolylineClick: VoidFunction;
}> = ({ loading, error, data, options, onPolylineClick }) => {
  const [somaColor, setSomaColor] = React.useState<string>();
  const somaRef = React.useRef<HTMLLIElement>(null);
  const handleSomaColor = (color: string) => {
    setSomaColor(color);
  };

  React.useEffect(() => {
    if (somaRef.current && somaColor) {
      const style = somaRef?.current?.style;
      style.setProperty('--soma', somaColor);
    }
  }, [somaColor, somaRef]);

  return (
    <div className={loading ? 'morpho-wrapper loading' : 'morpho-wrapper'}>
      <div className="actions">
        <Button size="small" disabled={loading} onClick={onPolylineClick}>
          {options.asPolyline ? 'Show as Geometry' : 'Show as Lines'}
        </Button>
      </div>
      <div className="legend">
        <ul>
          <li className={options.asPolyline ? '' : 'soma'} ref={somaRef}>
            {options.asPolyline ? 'Soma (not supported in line mode)' : 'Soma'}
          </li>
          <li className="axon">Axon</li>
          <li className="basal-dendrites">Basal Dendrites</li>
          <li className="apical-dendrites">Apical Dendrites</li>
        </ul>
      </div>
      {error && <p>{error.message}</p>}
      {data && !error && (
        <MorphologyViewer
          data={data}
          options={options}
          somaColorCallback={handleSomaColor}
        />
      )}
    </div>
  );
};

export default MorphoWrapper;
